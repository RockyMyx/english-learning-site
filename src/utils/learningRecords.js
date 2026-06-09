// 学习记录数据管理模块
const STORAGE_KEY = 'learningRecords';

class LearningRecordsManager {
  constructor() {
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.records = data ? JSON.parse(data) : [];
    } catch (e) {
      this.records = [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      // ignore
    }
  }

  // 添加一条学习记录
  addRecord({ module, question, result, questionId }) {
    const record = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      module,
      question,
      result, // 'correct' | 'incorrect'
      questionId,
      time: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    this.records.push(record);
    this.save();
    return record;
  }

  // 获取所有记录
  getRecords() {
    return [...this.records];
  }

  // 获取所有已做过题目的 questionId 集合
  getCompletedQuestionIds() {
    return new Set(this.records.map(r => r.questionId).filter(Boolean));
  }

  // 获取"最终仍为错误"的 questionId 集合（答错过，且之后没有再做对过）
  getStillWrongQuestionIds() {
    const stillWrong = new Set();
    const laterCorrect = new Set();
    // 按时间顺序遍历，记录每道题的最新状态
    for (const r of this.records) {
      if (!r.questionId) continue;
      if (r.result === 'correct') {
        stillWrong.delete(r.questionId);
        laterCorrect.add(r.questionId);
      } else {
        stillWrong.add(r.questionId);
      }
    }
    return stillWrong;
  }

  // 获取已做对的 questionId 集合（最新记录为正确）
  getFinallyCorrectQuestionIds() {
    const correctIds = new Set();
    const wrongIds = new Set();
    for (const r of this.records) {
      if (!r.questionId) continue;
      if (r.result === 'correct') {
        correctIds.add(r.questionId);
        wrongIds.delete(r.questionId);
      } else {
        wrongIds.add(r.questionId);
        correctIds.delete(r.questionId);
      }
    }
    return correctIds;
  }

  // 智能选题：优先从"仍为错误"和"未做过"的题目中选择
  // allQuestions: 完整题库数组，每项需有 questionId 字段
  // count: 需要选取的题目数量
  pickQuestions(allQuestions, count) {
    if (!allQuestions || allQuestions.length === 0) return [];

    const stillWrongIds = this.getStillWrongQuestionIds();
    const completedIds = this.getCompletedQuestionIds();

    // 分类：仍为错误的 > 未做过的 > 已做对的
    const wrongQuestions = allQuestions.filter(q => stillWrongIds.has(q.questionId));
    const unansweredQuestions = allQuestions.filter(q => !completedIds.has(q.questionId));
    const correctQuestions = allQuestions.filter(q =>
      completedIds.has(q.questionId) && !stillWrongIds.has(q.questionId)
    );

    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

    const pool = [
      ...shuffle(wrongQuestions),
      ...shuffle(unansweredQuestions),
      ...shuffle(correctQuestions)
    ];

    return pool.slice(0, count);
  }

  // 检查是否所有题目都已完成（至少做过一次）
  isAllCompleted(allQuestions) {
    if (!allQuestions || allQuestions.length === 0) return false;
    const completedIds = this.getCompletedQuestionIds();
    return allQuestions.every(q => completedIds.has(q.questionId));
  }

  // 清空所有记录
  clearAll() {
    this.records = [];
    this.save();
  }

  // 获取统计信息
  getStats() {
    const total = this.records.length;
    const correct = this.records.filter(r => r.result === 'correct').length;
    const incorrect = total - correct;
    return { total, correct, incorrect, accuracy: total > 0 ? Math.round(correct / total * 100) : 0 };
  }
}

const manager = new LearningRecordsManager();

export function addRecord(data) {
  return manager.addRecord(data);
}

export function getRecords() {
  return manager.getRecords();
}

export function getCompletedQuestionIds() {
  return manager.getCompletedQuestionIds();
}

export function pickSmartQuestions(allQuestions, count) {
  return manager.pickQuestions(allQuestions, count);
}

export function isAllCompleted(allQuestions) {
  return manager.isAllCompleted(allQuestions);
}

export function clearRecords() {
  manager.clearAll();
}

export function getRecordStats() {
  return manager.getStats();
}

export default manager;
