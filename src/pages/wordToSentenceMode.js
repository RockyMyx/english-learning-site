import audioPlayer from '../utils/audio.js';
import { addRecord, pickSmartQuestions, isAllCompleted, clearRecords } from '../utils/learningRecords.js';
import { wordSentenceData } from '../data/sentenceData.js';

// 从localStorage加载自定义题目
function loadCustomQuestions() {
  try {
    const data = localStorage.getItem('adminWordSentenceQuestions');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// 获取合并后的题目（硬编码 + localStorage + 覆盖）
function getMergedWordSentenceQuestions() {
  const hardcoded = wordSentenceData;


  const custom = loadCustomQuestions();

  // 合并自定义题目
  hardcoded.forEach(item => {
    const customItem = custom[item.word];
    if (customItem) {
      // 应用覆盖
      if (customItem._overrides) {
        Object.keys(customItem._overrides).forEach(idx => {
          const override = customItem._overrides[idx];
          const i = parseInt(idx);
          if (i >= 0 && i < item.englishSentences.length) {
            item.englishSentences[i] = override.english;
            item.chineseSentences[i] = override.chinese;
          }
        });
      }
      // 追加新题目
      if (customItem.englishSentences && customItem.englishSentences.length > 0) {
        item.englishSentences = [...item.englishSentences, ...customItem.englishSentences];
        item.chineseSentences = [...item.chineseSentences, ...customItem.chineseSentences];
      }
    }
  });

  // 添加全新单词的题目
  Object.keys(custom).forEach(word => {
    if (!hardcoded.some(h => h.word === word)) {
      const item = custom[word];
      if (item.englishSentences && item.englishSentences.length > 0) {
        hardcoded.push({
          word: item.word,
          wordChinese: item.wordChinese || word,
          englishSentences: [...item.englishSentences],
          chineseSentences: [...item.chineseSentences]
        });
      }
    }
  });

  return hardcoded;
}

// 单词造句模式
export class WordToSentenceMode {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.questionsPerRound = 10;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.selectedAnswer = null;
    // 添加选择状态跟踪
    this.questionStates = {}; // 记录每题的选择状态
    this.hasAnswered = false; // 当前题目是否已回答
  }

  init() {
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
  }

  generateQuestions() {
    // 单词造句素材（自动合并localStorage中的自定义题目）
    const wordSentenceQuestions = getMergedWordSentenceQuestions();

    // 给每个题目分配 questionId
    const questionsWithId = wordSentenceQuestions.map(q => ({
      ...q,
      questionId: `word-to-sentence_${q.word}`
    }));

    // 智能选题：优先错误题和未做题
    this.questions = pickSmartQuestions(questionsWithId, this.questionsPerRound);
  }

  renderQuiz() {
    const currentQuestion = this.questions[this.currentIndex];
    
    // 检查当前题目是否已有答题状态
    const currentState = this.questionStates[this.currentIndex];
    const hasAnswered = currentState && currentState.hasAnswered;
    const answeredIndex = hasAnswered ? currentState.answeredSentenceIndex : -1;

    this.container.innerHTML = `
      <div class="sentence-practice-container">
        <!-- 单词卡片 -->
        <div class="word-card">
          <div class="word-content">
            <div class="word-header">
              <span class="word-number">${this.currentIndex + 1}</span>
              <h2 class="word-title">${currentQuestion.word}</h2>
            </div>
            <p class="word-pronunciation">${currentQuestion.wordChinese}</p>
          </div>
          <div class="word-actions">
            <span class="word-progress">${this.currentIndex + 1} / ${this.questions.length}</span>
            <button class="word-audio-btn" id="play-word-audio" title="播放发音">
              <i class="fas fa-volume-up"></i>
            </button>
          </div>
        </div>

        <!-- 句子练习区 -->
        <div class="sentences-area">
          <h3 class="sentences-title">
            <i class="fas fa-language"></i>
            选择一句中文，说出对应的英文
          </h3>
          
          <div class="sentences-list">
            ${currentQuestion.chineseSentences.map((chineseSentence, index) => {
              const englishSentence = currentQuestion.englishSentences[index];
              // 根据保存的状态设置按钮样式
              const isAnswered = hasAnswered && answeredIndex === index;
              const isDisabled = hasAnswered;
              const correctBtnClass = isAnswered && answeredIndex === index ? 'result-btn correct-btn clicked correct-clicked' : 
                                     (isDisabled ? 'result-btn correct-btn disabled' : 'result-btn correct-btn');
              const correctBtnContent = isAnswered && answeredIndex === index ? 
                '<i class="fas fa-check"></i><span>答对</span>' : '<span>答对</span>';
              const correctBtnDisabled = isDisabled ? 'disabled' : '';
              const wrongBtnClass = isAnswered && answeredIndex === index ? 'result-btn wrong-btn disabled' :
                                   (isDisabled ? 'result-btn wrong-btn disabled' : 'result-btn wrong-btn');
              const wrongBtnDisabled = isDisabled ? 'disabled' : '';
              
              return `
                <div class="sentence-item ${isAnswered ? 'answered' : ''}" data-index="${index}">
                  <div class="sentence-row">
                    <div class="sentence-content">
                      <p class="sentence-chinese-text"><span class="sentence-num">${index + 1}.</span>${chineseSentence}</p>
                    </div>
                    <div class="sentence-actions">
                      <button class="result-btn answer-btn" data-sentence-index="${index}" data-sentence="${englishSentence}">
                        <i class="fas fa-eye"></i>
                        <span>查看答案</span>
                      </button>
                      <button class="${correctBtnClass}" data-sentence-index="${index}" ${correctBtnDisabled}>
                        ${correctBtnContent}
                      </button>
                      <button class="${wrongBtnClass}" data-sentence-index="${index}" ${wrongBtnDisabled}>
                        <span>答错</span>
                      </button>
                    </div>
                  </div>
                  <div class="sentence-answer-panel" id="answer-panel-${index}" style="display: none;">
                    <div class="sentence-answer-content">
                      <p class="sentence-answer-text">${englishSentence}</p>
                      <button class="sentence-audio-btn" data-sentence="${englishSentence}" title="播放发音">
                        <i class="fas fa-volume-up"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 反馈区域 -->
        <div class="sentence-feedback" id="sentence-feedback"></div>

        <!-- 导航按钮 -->
        <div class="sentence-navigation">
          <button class="nav-btn prev-btn" id="prev-question" ${this.currentIndex === 0 ? 'disabled' : ''}>
            <i class="fas fa-arrow-left"></i>
            <span>上一题</span>
          </button>
          <button class="nav-btn next-btn" id="next-question" ${this.currentIndex === this.questions.length - 1 ? 'data-finish="true"' : ''}>
            <span>${this.currentIndex === this.questions.length - 1 ? '完成' : '下一题'}</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>

      </div>
    `;
  }

  bindEvents() {
    // 单词发音按钮
    const playWordAudioButton = document.getElementById('play-word-audio');
    if (playWordAudioButton) {
      playWordAudioButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playWordAudio();
      });
    }

    // 查看答案按钮（与听写页面一致）
    const answerButtons = this.container.querySelectorAll('.result-btn.answer-btn');
    answerButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentence = button.dataset.sentence;
        const sentenceIndex = button.dataset.sentenceIndex;
        this.showSentenceAnswer(sentenceIndex, sentence, button);
      });
    });

    // 答对按钮（与听写页面一致）
    const correctButtons = this.container.querySelectorAll('.result-btn.correct-btn');
    correctButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentenceIndex = button.dataset.sentenceIndex;
        this.markSentenceResult(sentenceIndex, button);
      });
    });

    // 答错按钮
    const wrongButtons = this.container.querySelectorAll('.result-btn.wrong-btn');
    wrongButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentenceIndex = button.dataset.sentenceIndex;
        this.markSentenceWrong(sentenceIndex, button);
      });
    });

    // 句子发音按钮（在答案面板中）
    const sentenceAudioButtons = this.container.querySelectorAll('.sentence-audio-btn');
    sentenceAudioButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const sentence = button.dataset.sentence;
        this.playSentenceAudio(sentence);
      });
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
      if (this.currentIndex < this.questions.length - 1) {
        // 不是最后一题，正常下一题
        const nextIndex = this.currentIndex + 1;
        this.currentIndex = nextIndex;
        this.renderQuiz();
        this.bindEvents();
      } else {
        // 最后一题，点击完成按钮
        this.showQuizSummary();
      }
    });

    this.container.querySelector('#restart-quiz')?.addEventListener('click', () => this.restart());
  }

  playWordAudio() {
    const currentQuestion = this.questions[this.currentIndex];
    if (currentQuestion && currentQuestion.word) {
      audioPlayer.speak(currentQuestion.word);
    }
  }

  playSentenceAudio(sentence) {
    if (sentence) {
      audioPlayer.speak(sentence, { speed: 0.5 });
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

  // 显示句子答案（支持显示/隐藏切换）
  showSentenceAnswer(sentenceIndex, sentence, button) {
    const answerPanel = document.getElementById(`answer-panel-${sentenceIndex}`);
    const buttonSpan = button.querySelector('span');
    const buttonIcon = button.querySelector('i');

    if (answerPanel.style.display === 'none') {
      // 显示答案
      answerPanel.style.display = 'block';
      buttonSpan.textContent = '隐藏答案';
      buttonIcon.className = 'fas fa-eye-slash';
    } else {
      // 隐藏答案
      answerPanel.style.display = 'none';
      buttonSpan.textContent = '查看答案';
      buttonIcon.className = 'fas fa-eye';
    }
  }

  // 标记句子结果（与听写页面一致）
  markSentenceResult(sentenceIndex, button) {
    // 如果按钮已被禁用，直接返回
    if (button.disabled) return;

    // 检查当前题目是否已经有选中的句子
    const currentQuestionIndex = this.currentIndex;
    if (this.questionStates[currentQuestionIndex] && this.questionStates[currentQuestionIndex].answeredSentenceIndex !== undefined) {
      // 已经答过这题了，不能重复选择
      return;
    }

    // 保存答题状态
    this.questionStates[currentQuestionIndex] = {
      answeredSentenceIndex: parseInt(sentenceIndex),
      hasAnswered: true
    };

    // 禁用当前题目的所有"答对"按钮
    const allCorrectButtons = this.container.querySelectorAll('.result-btn.correct-btn');
    allCorrectButtons.forEach((btn, index) => {
      btn.disabled = true;
      if (index === parseInt(sentenceIndex)) {
        // 选中的按钮显示勾选标记
        btn.classList.add('clicked', 'correct-clicked');
        btn.innerHTML = `
          <i class="fas fa-check"></i>
          <span>答对</span>
        `;
      } else {
        // 未选中的按钮显示为禁用状态
        btn.classList.add('disabled');
      }
    });

    // 播放答对音效
    this.playSoundEffect(true);

    // 增加本轮得分
    this.score += 5;

    // 加分到全局积分
    if (window.router && window.router.addPoints) {
      window.router.addPoints(5);
    }

    // 记录学习记录
    const currentQuestion = this.questions[this.currentIndex];
    addRecord({
      module: 'word-to-sentence',
      question: currentQuestion.word,
      result: 'correct',
      questionId: currentQuestion.questionId
    });

    // 显示反馈
    const feedback = document.getElementById('sentence-feedback');
    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-content correct">
          <i class="fas fa-check-circle"></i>
          <span>答对了！+5分</span>
        </div>
      `;
      feedback.className = 'sentence-feedback show';

      // 3秒后清除反馈
      setTimeout(() => {
        feedback.className = 'sentence-feedback';
      }, 3000);
    }
  }

  // 标记句子答错
  markSentenceWrong(sentenceIndex, button) {
    if (button.disabled) return;

    const currentQuestionIndex = this.currentIndex;
    if (this.questionStates[currentQuestionIndex] && this.questionStates[currentQuestionIndex].answeredSentenceIndex !== undefined) {
      return;
    }

    // 保存答题状态
    this.questionStates[currentQuestionIndex] = {
      answeredSentenceIndex: parseInt(sentenceIndex),
      hasAnswered: true,
      isWrong: true
    };

    // 禁用当前题目的所有按钮
    const allCorrectButtons = this.container.querySelectorAll('.result-btn.correct-btn');
    const allWrongButtons = this.container.querySelectorAll('.result-btn.wrong-btn');
    allCorrectButtons.forEach(btn => { btn.disabled = true; btn.classList.add('disabled'); });
    allWrongButtons.forEach((btn, index) => {
      btn.disabled = true;
      if (index === parseInt(sentenceIndex)) {
        btn.classList.add('clicked', 'wrong-clicked');
        btn.innerHTML = '<i class="fas fa-times"></i><span>答错</span>';
      } else {
        btn.classList.add('disabled');
      }
    });

    // 播放答错音效
    this.playSoundEffect(false);

    // 记录学习记录
    const currentQuestion = this.questions[this.currentIndex];
    addRecord({
      module: 'word-to-sentence',
      question: currentQuestion.word,
      result: 'incorrect',
      questionId: currentQuestion.questionId
    });

    // 显示反馈
    const feedback = document.getElementById('sentence-feedback');
    if (feedback) {
      feedback.innerHTML = `
        <div class="feedback-content incorrect">
          <i class="fas fa-times-circle"></i>
          <span>答错了，继续加油！</span>
        </div>
      `;
      feedback.className = 'sentence-feedback show';
      setTimeout(() => { feedback.className = 'sentence-feedback'; }, 3000);
    }
  }

  goToQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;

    this.currentIndex = index;
    
    // 检查当前题目是否已答题
    const state = this.questionStates[index];
    this.hasAnswered = state && state.hasAnswered;

    // renderQuiz 会自动根据 questionStates 恢复状态
    this.renderQuiz();
    this.bindEvents();
  }

  restart() {
    // 清理弹框
    const summary = document.getElementById('quiz-summary');
    if (summary) {
      summary.remove();
    }

    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.questionStates = {}; // 清空选择状态
    this.hasAnswered = false;
    this.generateQuestions();
    this.renderQuiz();
    this.bindEvents();
  }

  showQuizSummary() {
    // 检查是否所有题目都完成
    this.checkAllCompleted();

    // 创建弹框DOM
    const summary = document.createElement('div');
    summary.className = 'quiz-summary';
    summary.id = 'quiz-summary';

    summary.innerHTML = `
      <div class="summary-content">
        <div class="summary-icon">🎉</div>
        <h3>练习完成！</h3>
        <div class="summary-stats">
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
        } else {
          message = '🎯 继续加油学习吧！';
        }

        goalMessage.innerHTML = `<p class="goal-text">${message}</p>`;
      } catch (error) {
        // console.error('生成目标提示失败:', error);
        goalMessage.innerHTML = `<p class="goal-text">🎯 继续加油学习吧！</p>`;
      }
    }

    // 绑定事件
    const restartBtn = summary.querySelector('#restart-quiz');
    const backToHomeBtn = summary.querySelector('#back-to-home');
    
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }

    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        // 移除弹框
        summary.remove();
        
        // 导航回首页
        if (window.router && window.router.navigate) {
          window.router.navigate('/');
        }
      });
    }
  }

  cleanup() {
    // 清理弹框
    const summary = document.getElementById('quiz-summary');
    if (summary) {
      summary.remove();
    }

    // 只清理当前容器的DOM状态，避免影响其他页面
    if (this.container) {
      const options = this.container.querySelectorAll('.quiz-option');
      options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.style.pointerEvents = 'auto';
      });

      // 重置导航按钮状态
      const prevButton = this.container.querySelector('#prev-question');
      const nextButton = this.container.querySelector('#next-question');
      const feedback = this.container.querySelector('#quiz-feedback');

      if (prevButton) prevButton.disabled = true;
      if (nextButton) nextButton.disabled = true;
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'quiz-feedback';
      }
    }

    // 停止音频播放
    audioPlayer.stop();

    // 清理状态
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.selectedAnswer = null;
    this.questionStates = {};
    this.hasAnswered = false;

    // console.log('单词造句模式已清理，当前实例状态已重置');
  }

  checkAllCompleted() {
    const wordSentenceQuestions = getMergedWordSentenceQuestions();
    const allQuestions = wordSentenceQuestions.map(q => ({
      questionId: `word-to-sentence_${q.word}`
    }));

    if (isAllCompleted(allQuestions)) {
      clearRecords();
    }
  }
}

export function initWordToSentenceMode() {
  const wordToSentence = new WordToSentenceMode('word-to-sentence-content');
  wordToSentence.init();
  return wordToSentence;
}
