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

  // 获取回答错误的 questionId 集合
  getWrongQuestionIds() {
    return new Set(
      this.records.filter(r => r.result === 'incorrect').map(r => r.questionId).filter(Boolean)
    );
  }

  // 获取回答正确的 questionId 集合
  getCorrectQuestionIds() {
    return new Set(
      this.records.filter(r => r.result === 'correct').map(r => r.questionId).filter(Boolean)
    );
  }

  // 智能选题：优先从错误题目和未做题目中选择
  // allQuestions: 完整题库数组，每项需有 questionId 字段
  // count: 需要选取的题目数量
  pickQuestions(allQuestions, count) {
    if (!allQuestions || allQuestions.length === 0) return [];

    const wrongIds = this.getWrongQuestionIds();
    const completedIds = this.getCompletedQuestionIds();

    // 分类
    const wrongQuestions = allQuestions.filter(q => wrongIds.has(q.questionId));
    const unansweredQuestions = allQuestions.filter(q => !completedIds.has(q.questionId));
    const correctQuestions = allQuestions.filter(q =>
      completedIds.has(q.questionId) && !wrongIds.has(q.questionId)
    );

    // 优先级：错误题 > 未做题 > 已正确题
    // 从每类中随机选取
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

export function getWrongQuestionIds() {
  return manager.getWrongQuestionIds();
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
