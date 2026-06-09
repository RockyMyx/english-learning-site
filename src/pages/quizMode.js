import { getRandomWords, getRandomWordsExcluding, getQuizOptions, getAllWords, getAllWordsExcluding } from '../utils/vocabulary.js';
import audioPlayer from '../utils/audio.js';
import { addRecord, pickSmartQuestions, isAllCompleted, clearRecords } from '../utils/learningRecords.js';
import { dialogueQuestions } from '../data/dialogueData.js';

// 通用的测试模式生成器
export class QuizMode {
  constructor(containerId, mode, options = {}) {
    this.container = document.getElementById(containerId);
    this.mode = mode;
    this.difficulty = options.difficulty || null;
    this.questionsPerRound = options.questionsPerRound || 10;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.selectedAnswer = null;
    // 添加选择状态跟踪
    this.questionStates = {}; // 记录每题的选择状态和结果
    this.hasAnswered = false; // 当前题目是否已回答
  }

  init() {
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
    // 初始化导航按钮状态
    this.updateNavigationButtons();
  }

  generateQuestions() {
    if (this.mode === 'english-dialogue') {
      this.questions = this.generateDialogueQuestions();
    } else {
      this.questions = this.generateVocabularyQuestions();
    }
    this.questions = this.questions.slice(0, this.questionsPerRound);
  }

  generateVocabularyQuestions() {
    const excludeCategories = ['listening-to-chinese', 'chinese-to-english', 'english-to-chinese'].includes(this.mode);
    const words = excludeCategories
      ? getRandomWordsExcluding(this.questionsPerRound * 4)
      : getRandomWords(this.questionsPerRound * 4);
    const questions = [];

    for (let i = 0; i < this.questionsPerRound && i < words.length; i++) {
      const correctAnswer = words[i];
      const options = this.generateOptions(correctAnswer, words);

      questions.push({
        type: this.mode,
        question: this.formatQuestion(correctAnswer),
        correctAnswer: correctAnswer,
        options: options
      });
    }

    return questions;
  }

  generateDialogueQuestions() {
    // 根据难度选择题目池
    let pool = [];
    if (this.difficulty === 'easy') {
      pool = dialogueQuestions.easy.map(q => ({ ...q, difficultyLevel: 'easy' }));
    } else if (this.difficulty === 'normal') {
      pool = [
        ...dialogueQuestions.easy.map(q => ({ ...q, difficultyLevel: 'easy' })),
        ...dialogueQuestions.medium.map(q => ({ ...q, difficultyLevel: 'medium' }))
      ];
    } else if (this.difficulty === 'hard') {
      pool = [
        ...dialogueQuestions.medium.map(q => ({ ...q, difficultyLevel: 'medium' })),
        ...dialogueQuestions.hard.map(q => ({ ...q, difficultyLevel: 'hard' }))
      ];
    } else {
      // 无难度设置时使用所有题目（兼容旧逻辑）
      pool = [
        ...dialogueQuestions.easy.map(q => ({ ...q, difficultyLevel: 'easy' })),
        ...dialogueQuestions.medium.map(q => ({ ...q, difficultyLevel: 'medium' })),
        ...dialogueQuestions.hard.map(q => ({ ...q, difficultyLevel: 'hard' }))
      ];
    }

    // 给每个题目分配 questionId
    const poolWithId = pool.map(q => ({ ...q, questionId: `${this.mode}_${q.question}` }));

    // 智能选题：优先错误题和未做题
    const selectedQuestions = pickSmartQuestions(poolWithId, this.questionsPerRound);

    // 难度对应分值和标签
    const difficultyConfig = {
      easy: { label: '简单', points: 2 },
      medium: { label: '中等', points: 3 },
      hard: { label: '困难', points: 5 }
    };

    // 转换为统一格式
    return selectedQuestions.map(q => ({
      type: this.mode,
      questionId: q.questionId,
      difficulty: q.difficultyLevel,
      difficultyLabel: difficultyConfig[q.difficultyLevel].label,
      points: difficultyConfig[q.difficultyLevel].points,
      question: {
        english: q.question
      },
      correctAnswer: {
        english: q.correctAnswer
      },
      options: q.options.map(option => ({
        english: option
      }))
    }));
  }

  generateOptions(correctAnswer, allWords) {
    let options = [correctAnswer];
    const otherWords = allWords.filter(w => w.english !== correctAnswer.english);

    while (options.length < 4 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const randomWord = otherWords[randomIndex];
      if (!options.includes(randomWord)) {
        options.push(randomWord);
      }
      otherWords.splice(randomIndex, 1);
    }

    return options.sort(() => Math.random() - 0.5);
  }

  formatQuestion(word) {
    switch (this.mode) {
      case 'english-to-chinese':
        return {
          english: word.english,
          showAudio: true
        };
      case 'chinese-to-english':
        return {
          chinese: word.chinese,
          showAudio: false
        };
      case 'listening-to-chinese':
        return {
          audioOnly: true,
          word: word
        };
      default:
        return { english: word.english || '', showAudio: true };
    }
  }

  renderQuiz() {
    const currentQuestion = this.questions[this.currentIndex];
    this.container.innerHTML = `
      <div class="quiz-practice-container">
        <!-- 题目卡片 -->
        <div class="question-card">
          ${this.mode === 'english-dialogue' && currentQuestion.difficultyLabel ? `<span class="difficulty-badge difficulty-${currentQuestion.difficulty}">${currentQuestion.difficultyLabel}</span>` : ''}
          <div class="question-content">
            <div class="question-header">
              <span class="question-number">${this.currentIndex + 1}</span>
              ${this.renderQuestionContent(currentQuestion)}
            </div>
          </div>
          <div class="question-progress">
            <span class="progress-text">${this.currentIndex + 1} / ${this.questions.length}</span>
          </div>
        </div>

        <div class="quiz-options">
          ${currentQuestion.options.map((option, index) => `
            <div class="quiz-option" data-index="${index}">
              <span class="option-number">${String.fromCharCode(65 + index)}</span>
              <span class="option-text">${this.renderOptionText(option)}</span>
              ${this.mode === 'chinese-to-english' || this.mode === 'english-dialogue' ? `
                <button class="audio-option-button" data-word="${this.getEnglishText(option)}" aria-label="播放发音">
                  <i class="fas fa-volume-up"></i>
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="quiz-navigation">
          <button class="nav-btn prev-btn" id="prev-question" ${this.currentIndex === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-left"></i>
            <span>上一题</span>
          </button>
          <div class="quiz-feedback" id="quiz-feedback"></div>
          <button class="nav-btn next-btn" id="next-question" disabled>
            <span>下一题</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderQuestionContent(question) {
    if (this.mode === 'listening-to-chinese') {
      return `
        <div class="audio-question">
          <button class="question-audio-btn" id="play-question-audio">
            <i class="fas fa-volume-up"></i>
            <span>点击播放</span>
          </button>
        </div>
      `;
    } else if (this.mode === 'english-dialogue') {
      return `
        <div class="text-question">
          <p class="question-text">${question.question.english}</p>
          <button class="question-audio-btn" id="play-question-audio">
            <i class="fas fa-volume-up"></i>
          </button>
        </div>
      `;
    } else if (question.question.english) {
      return `
        <div class="text-question">
          <span class="question-text">${question.question.english}</span>
          ${question.question.showAudio ? `
            <button class="question-audio-btn" id="play-question-audio">
              <i class="fas fa-volume-up"></i>
            </button>
          ` : ''}
        </div>
      `;
    } else {
      return `
        <div class="text-question">
          <span class="question-text">${question.question.chinese}</span>
        </div>
      `;
    }
  }

  renderOptionContent(option) {
    // 这个方法在新UI中不再使用，保留以兼容旧代码
    return this.renderOptionText(option);
  }

  bindEvents() {
    // 克隆节点来移除所有旧的事件监听器
    const oldContainer = this.container;
    const newContainer = oldContainer.cloneNode(false);
    oldContainer.parentNode.replaceChild(newContainer, oldContainer);
    this.container = newContainer;

    // 重新获取内容
    this.container.innerHTML = oldContainer.innerHTML;

    // 选项点击事件
    const options = this.container.querySelectorAll('.quiz-option');
    options.forEach(option => {
      option.addEventListener('click', () => this.selectOption(parseInt(option.dataset.index)));
    });

    // 导航按钮 - 使用 this.container.querySelector 确保只获取当前模式的按钮
    const prevButton = this.container.querySelector('#prev-question');
    const nextButton = this.container.querySelector('#next-question');
    
    prevButton?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.goToQuestion(this.currentIndex - 1);
      }
    });

    nextButton?.addEventListener('click', () => {
      // 选择答案后，且还有下一题时允许点击
      if (this.hasAnswered && this.currentIndex < this.questions.length - 1) {
        this.goToQuestion(this.currentIndex + 1);
      }
    });

    this.container.querySelector('#restart-quiz')?.addEventListener('click', () => this.restart());

    this.container.querySelector('#back-to-home')?.addEventListener('click', () => {
      if (window.router && window.router.navigate) {
        window.router.navigate('/');
      }
    });

    // 音频播放按钮
    const playAudioButton = this.container.querySelector('#play-question-audio');
    if (playAudioButton) {
      playAudioButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        // console.log('点击题目音频按钮，模式:', this.mode);
        await this.playQuestionAudio();
      });
    }

    // 选项中的音频按钮
    const audioButtons = this.container.querySelectorAll('.audio-option-button');
    audioButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault(); // 防止事件冒泡和重复触发
        const word = button.dataset.word || button.dataset.sentence;
        // console.log('播放单词音频:', word);
        this.playWordAudio(word);
      });
    });
  }

  selectOption(index) {
    // 如果当前题目已经回答过，不允许再次选择
    if (this.hasAnswered) {
      return;
    }

    this.selectedAnswer = index;
    this.hasAnswered = true;
    const currentQuestion = this.questions[this.currentIndex];
    const options = this.container.querySelectorAll('.quiz-option');
    const selectedOption = options[index];
    const isCorrect = currentQuestion.options[index].english === currentQuestion.correctAnswer.english;

    // 保存当前题目的选择状态
    this.questionStates[this.currentIndex] = {
      selectedAnswer: index,
      isCorrect: isCorrect,
      hasAnswered: true
    };

    // 播放音效
    this.playSoundEffect(isCorrect);

    // 显示正确/错误状态
    selectedOption.classList.add(isCorrect ? 'correct' : 'incorrect');

    // 显示正确答案
    if (!isCorrect) {
      const correctIndex = currentQuestion.options.findIndex(
        opt => opt.english === currentQuestion.correctAnswer.english
      );
      options[correctIndex].classList.add('correct');
    }

    // 更新分数
    if (isCorrect) {
      const pointsPerQuestion = currentQuestion.points || this.getPointsPerQuestion();
      this.score += pointsPerQuestion;

      // 添加积分
      if (window.router && window.router.addPoints) {
        window.router.addPoints(pointsPerQuestion);
      }
    }

    // 记录答案
    this.answers[this.currentIndex] = {
      selected: currentQuestion.options[index],
      correct: currentQuestion.correctAnswer,
      isCorrect: isCorrect
    };

    // 记录学习记录
    const questionText = this.mode === 'english-dialogue'
      ? currentQuestion.question.english
      : (currentQuestion.correctAnswer.english || currentQuestion.question?.english || '');
    addRecord({
      module: this.mode,
      question: questionText,
      result: isCorrect ? 'correct' : 'incorrect',
      questionId: currentQuestion.questionId
    });

    // 显示反馈
    this.showFeedback(isCorrect);

    // 更新导航按钮状态
    this.updateNavigationButtons();

    // 如果是最后一题，显示总结
    if (this.currentIndex === this.questions.length - 1) {
      setTimeout(() => {
        this.showQuizSummary();
      }, 1500);
    }
  }

  playSoundEffect(isCorrect) {
    // 使用Web Audio API播放简短音效
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (isCorrect) {
        // 正确答案：更高音的音效，更响亮
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      } else {
        // 错误答案：更明显的错误音效，更响亮
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      }

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      // console.warn('Failed to play sound effect:', error);
    }
  }

  showFeedback(isCorrect) {
    const feedback = this.container.querySelector('#quiz-feedback');
    if (!feedback) return;
    const currentQuestion = this.questions[this.currentIndex];
    const pointsPerQuestion = currentQuestion.points || this.getPointsPerQuestion();
    feedback.textContent = isCorrect ? `✅ 正确！+${pointsPerQuestion}分` : '❌ 错误！';
    feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  }

  updateNavigationButtons() {
    const prevButton = this.container.querySelector('#prev-question');
    const nextButton = this.container.querySelector('#next-question');

    if (prevButton) {
      prevButton.disabled = this.currentIndex === 0;
    }

    if (nextButton) {
      const isLastQuestion = this.currentIndex === this.questions.length - 1;
      nextButton.disabled = !this.hasAnswered || isLastQuestion;
    }
  }

  getPointsPerQuestion() {
    const pointsMap = {
      'listening-to-chinese': 1,
      'english-to-chinese': 1,
      'chinese-to-english': 1,
      'english-dialogue': 2
    };
    return pointsMap[this.mode] || 1;
  }

  getQuestionTypeLabel() {
    const labelMap = {
      'listening-to-chinese': '听音选中文',
      'english-to-chinese': '看英选中',
      'chinese-to-english': '看中选英',
      'english-dialogue': '对话练习'
    };
    return labelMap[this.mode] || '练习';
  }

  renderOptionText(option) {
    if (typeof option === 'string') return option;
    if (this.mode === 'english-to-chinese' || this.mode === 'listening-to-chinese') {
      return option.chinese || option.english || option;
    }
    return option.english || option.chinese || option;
  }

  getEnglishText(option) {
    if (typeof option === 'string') return option;
    return option.english || option;
  }

  goToQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;

    this.currentIndex = index;
    this.selectedAnswer = null;
    this.hasAnswered = false;

    // 恢复当前题目的选择状态
    const state = this.questionStates[index];
    if (state && state.hasAnswered) {
      this.selectedAnswer = state.selectedAnswer;
      this.hasAnswered = true;
    }

    this.renderQuiz();
    this.bindEvents();

    // 更新导航按钮状态
    this.updateNavigationButtons();

    // 如果有保存的状态，恢复视觉显示
    if (state && state.hasAnswered) {
      this.restoreQuestionState(state);
    }
  }

  restoreQuestionState(state) {
    const options = this.container.querySelectorAll('.quiz-option');
    const selectedOption = options[state.selectedAnswer];

    if (selectedOption) {
      // 移除所有选项的事件监听器，防止重复选择
      options.forEach(option => {
        option.style.pointerEvents = 'none'; // 禁用点击
      });

      // 恢复选择状态样式
      selectedOption.classList.add('selected');

      if (state.isCorrect) {
        selectedOption.classList.add('correct');
      } else {
        selectedOption.classList.add('incorrect');

        // 如果答错了，高亮正确答案
        const currentQuestion = this.questions[this.currentIndex];
        options.forEach((option, index) => {
          if (currentQuestion.options[index].english === currentQuestion.correctAnswer.english) {
            option.classList.add('correct');
          }
        });
      }
    }
  }

  showQuizSummary() {
    // 创建弹框DOM
    const summary = document.createElement('div');
    summary.className = 'quiz-summary';
    summary.id = 'quiz-summary';

    // 计算答对题数（不是分数）
    const correctCount = this.answers.filter(a => a && a.isCorrect).length;
    const percentage = Math.round((correctCount / this.questions.length) * 100);

    // 检查当前模式的题库是否全部完成
    this.checkAllCompleted();

    summary.innerHTML = `
      <div class="summary-content">
        <div class="summary-icon">🎉</div>
        <h3>练习完成！</h3>
        <div class="summary-stats">
          <div class="stat-box stat-box-accuracy">
            <span class="stat-value">${percentage}%</span>
            <span class="stat-label">正确率</span>
          </div>
          <div class="stat-box stat-box-score">
            <span class="stat-value">${this.score}</span>
            <span class="stat-label">本轮得分</span>
          </div>
        </div>
        <div class="goal-message" id="goal-message">
          <!-- 动态插入目标提示信息 -->
        </div>
        <div class="result-actions">
          <button class="restart-btn" id="restart-quiz">
            <i class="fas fa-redo"></i>
            再练一次
          </button>
          <button class="restart-btn secondary" id="back-to-home">
            <i class="fas fa-home"></i>
            回到首页
          </button>
        </div>
      </div>
    `;

    // 添加到body中
    document.body.appendChild(summary);

    // 设置目标提示信息
    const goalMessage = summary.querySelector('#goal-message');
    if (goalMessage) {
      try {
        let message = '';

        if (window.router && typeof window.router.getGoalProgress === 'function') {
          const progress = window.router.getGoalProgress();
          if (progress && typeof progress.current !== 'undefined' && typeof progress.goal !== 'undefined') {
            const remaining = Math.max(0, progress.goal - progress.current);

            if (remaining > 0) {
              message = `💪 加油，还差${remaining}分就完成了！`;
            } else {
              message = `🎊 太棒了！你已经完成今日目标！`;
            }
          } else {
            message = '🎯 继续加油学习吧！';
          }
        } else if (window.getGoalProgress && typeof window.getGoalProgress === 'function') {
          const progress = window.getGoalProgress();
          if (progress && typeof progress.current !== 'undefined' && typeof progress.goal !== 'undefined') {
            const remaining = Math.max(0, progress.goal - progress.current);

            if (remaining > 0) {
              message = `💪 加油，还差${remaining}分就完成了！`;
            } else {
              message = `🎊 太棒了！你已经完成今日目标！`;
            }
          } else {
            message = '🎯 继续加油学习吧！';
          }
        }

        goalMessage.innerHTML = `<p class="goal-text">${message}</p>`;
      } catch (error) {
        // console.error('生成目标提示失败:', error);
        goalMessage.innerHTML = `<p class="goal-text">🎯 继续加油学习吧！</p>`;
      }
    }

    // 绑定事件 - 使用 document.getElementById 因为弹框是动态创建在 body 中的
    const restartBtn = document.getElementById('restart-quiz');
    const backToHomeBtn = document.getElementById('back-to-home');
    
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }

    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        // 移除弹框
        const summary = document.getElementById('quiz-summary');
        if (summary) {
          summary.remove();
        }

        // 导航回首页
        if (window.router && window.router.navigate) {
          window.router.navigate('/');
        }
      });
    }
  }

  async playQuestionAudio() {
    // 停止当前正在播放的音频
    audioPlayer.stop();

    const currentQuestion = this.questions[this.currentIndex];
    let textToPlay;

    if (this.mode === 'listening-to-chinese') {
      textToPlay = currentQuestion.correctAnswer.english;
    } else if (this.mode === 'english-dialogue') {
      textToPlay = currentQuestion.question.english;
      // 英文对话模式：1.2倍速读题目
      // try {
      //   await this.playDialogue(textToPlay);
      // } catch (error) {
      //   // console.error('英文对话音频播放失败:', error);
      // }
      // return; // 直接返回，不执行下面的通用逻辑
    } else {
      textToPlay = currentQuestion.question.english || '';
    }

    if (textToPlay) {
      const speed = this.mode === 'english-dialogue' ? 0.5 : 1.0;
      audioPlayer.speak(textToPlay, { speed });
    }
  }

  // 英文对话模式：0.5倍速读题目
  async playDialogue(text) {
    try {
      // console.log('英文对话模式开始读题目:', text);
      await audioPlayer.speak(text);
      // console.log('英文对话模式读题完成');
    } catch (error) {
      // console.error('英文对话读题失败:', error);
      throw error;
    }
  }

  playWordAudio(word) {
    if (word) {
      // console.log('playWordAudio被调用:', word);
      // 停止当前正在播放的音频
      audioPlayer.stop();
      // console.log('已停止当前音频');

      audioPlayer.speak(word, { speed: 0.5 }).then(() => {
        // console.log('单词音频播放成功:', word);
      }).catch(error => {
        // console.error('单词音频播放错误:', error);
      });
    }
  }

  restart() {
    // 清理弹框
    const summary = document.getElementById('quiz-summary');
    if (summary) {
      summary.remove();
    }

    // 英文对话模式重新选择难度
    if (this.mode === 'english-dialogue') {
      showDifficultySelection((difficulty) => {
        this.difficulty = difficulty;
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
        this.selectedAnswer = null;
        this.questionStates = {};
        this.hasAnswered = false;
        this.generateQuestions();
        this.renderQuiz();
        this.bindEvents();
      });
      return;
    }

    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.selectedAnswer = null;
    this.questionStates = {}; // 清空选择状态
    this.hasAnswered = false;
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
  }

  checkAllCompleted() {
    // 获取当前模式的完整题库
    let allQuestions = [];
    if (this.mode === 'english-dialogue') {
      // 对话模式的完整题库取决于难度
      const dialogueQuestions = this.getDialoguePool();
      allQuestions = dialogueQuestions.map(q => ({ ...q, questionId: `${this.mode}_${q.question}` }));
    } else {
      // 词汇模式
      const excludeCategories = ['listening-to-chinese', 'chinese-to-english', 'english-to-chinese'].includes(this.mode);
      const allWords = excludeCategories ? getAllWordsExcluding() : getAllWords();
      allQuestions = allWords.map(w => ({ questionId: `${this.mode}_${w.english}` }));
    }

    if (isAllCompleted(allQuestions)) {
      // 自动清空学习记录，开始新一轮
      clearRecords();
    }
  }

  getDialoguePool() {
    // 复用 generateDialogueQuestions 中的同一份数据，避免重复定义导致数据不一致
    // 先生成完整题目，然后只提取 question 字段用于完成检测
    const fullQuestions = this.generateDialogueQuestions();
    return fullQuestions.map(q => ({ question: q.question.english }));
  }
}

// 各个模式的具体实现
export function initEnglishToChineseMode() {
  const quiz = new QuizMode('english-to-chinese-content', 'english-to-chinese');
  quiz.init();
  return quiz;
}

export function initChineseToEnglishMode() {
  const quiz = new QuizMode('chinese-to-english-content', 'chinese-to-english');
  quiz.init();
  return quiz;
}

export function initListeningToChineseMode() {
  const quiz = new QuizMode('listening-to-chinese-content', 'listening-to-chinese');
  quiz.init();
  return quiz;
}

export function initEnglishDialogueMode() {
  let quiz = null;

  showDifficultySelection((difficulty) => {
    quiz = new QuizMode('english-dialogue-content', 'english-dialogue', { difficulty });
    quiz.init();
  });

  return quiz;
}

function showDifficultySelection(onSelect) {
  // 如果已有弹窗先移除
  const existing = document.getElementById('difficulty-selection');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'difficulty-selection';
  overlay.id = 'difficulty-selection';

  const difficulties = [
    {
      key: 'easy',
      title: '初级',
      description: '简单句型，语法巩固',
      tags: '简单2分/题',
      icon: '🌟',
      className: 'easy'
    },
    {
      key: 'normal',
      title: '中级',
      description: '基础+进阶题目',
      tags: '简单2分 / 中等3分',
      icon: '⚡',
      className: 'normal'
    },
    {
      key: 'hard',
      title: '高级',
      description: '进阶+挑战题目',
      tags: '中等3分 / 困难5分',
      icon: '🔥',
      className: 'hard'
    }
  ];

  overlay.innerHTML = `
    <div class="difficulty-content">
      <h3 class="difficulty-title">选择难度</h3>
      <p class="difficulty-subtitle">请选择本次练习的难度模式</p>
      <div class="difficulty-options">
        ${difficulties.map(d => `
          <div class="difficulty-card difficulty-card-${d.className}" data-difficulty="${d.key}">
            <div class="difficulty-card-left">
              <div class="difficulty-card-icon">${d.icon}</div>
              <div class="difficulty-card-title">${d.title}</div>
            </div>
            <div class="difficulty-card-right">
              <div class="difficulty-card-desc">${d.description}</div>
              <div class="difficulty-card-tags">${d.tags}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // 绑定点击事件
  overlay.querySelectorAll('.difficulty-card').forEach(card => {
    card.addEventListener('click', () => {
      const difficulty = card.dataset.difficulty;
      overlay.remove();
      onSelect(difficulty);
    });
  });
}