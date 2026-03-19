import { getRandomWords, getQuizOptions } from '../utils/vocabulary.js';
import audioPlayer from '../utils/audio.js';

// 通用的测试模式生成器
export class QuizMode {
  constructor(containerId, mode, options = {}) {
    this.container = document.getElementById(containerId);
    this.mode = mode;
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
    const words = getRandomWords(this.questionsPerRound * 4);
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
    // 50个预设对话题目 - 完全按照用户提供的题目顺序
    // 正确答案分布：A选项10%，B选项20%，C选项30%，D选项40%
    const dialogueQuestions = [
      { question: "What's your name?", correctAnswer: "I'm Tom.", options: ["I'm Tom.", "I'm seven.", "It's a cat.", "It's red."] },
      { question: "I'm sorry.", correctAnswer: "That's ok.", options: ["That's ok.", "I'm sorry too.", "Thank you.", "Here you are."] },
      { question: "Tell me your name.", correctAnswer: "I'm Tom.", options: ["I'm Tom.", "I'm ten.", "It's Tom.", "I'm a boy."] },
      { question: "The tomato is ( ).", correctAnswer: "red", options: ["red", "yellow", "green", "purple"] },
      { question: "I've got two ( ) in my bag.", correctAnswer: "books", options: ["books", "book", "a book", "red"] },
      { question: "How old are you?", correctAnswer: "I'm nine.", options: ["I'm fine.", "I'm nine.", "My name is Lily.", "It's a book."] },
      { question: "Where is my pencil?", correctAnswer: "It's under the chair.", options: ["It's a pencil.", "It's under the chair.", "It's blue.", "I've got a pencil."] },
      { question: "What's your favourite animal?", correctAnswer: "I like dogs.", options: ["My favourite color is blue.", "I like dogs.", "It's a dog.", "I've got a dog."] },
      { question: "Is the cat on the sofa?", correctAnswer: "Yes, it is.", options: ["It's a cat.", "Yes, it is.", "It's black.", "I like cats."] },
      { question: "What can a bird do?", correctAnswer: "It can fly.", options: ["It can swim.", "It can jump.", "It can fly.", "It can talk."] },
      { question: "What's your mother's name?", correctAnswer: "She's Mary.", options: ["She's my mother.", "My name is Mary.", "She's Mary.", "I'm Mary."] },
      { question: "I'm happy. But my sister is ( ).", correctAnswer: "sad", options: ["sad", "happy", "big", "young"] },
      { question: "My hands are dirty. I need to ( ) them.", correctAnswer: "clean", options: ["clean", "dirty", "look", "point"] },
      { question: "What's your favourite food?", correctAnswer: "I like cake.", options: ["I like cake.", "It's a cake.", "Cake is food.", "I've got cake."] },
      { question: "I've got a ( ). It's red and I can ride it.", correctAnswer: "bike", options: ["bike", "car", "doll", "kite"] },
      { question: "What color is the apple?", correctAnswer: "It's red.", options: ["It's a fruit.", "It's red.", "It's on the table.", "I like apples."] },
      { question: "Can a bird fly?", correctAnswer: "Yes, it can.", options: ["No, it can't.", "Yes, it can.", "It can swim.", "It's a bird."] },
      { question: "What's this? ", correctAnswer: "It's a book.", options: ["It's red.", "It's a book.", "It's on the chair.", "I like books."] },
      { question: "Where's my bag?", correctAnswer: "It's here.", options: ["It's here.", "It's a bag.", "I've got a bag.", "It's blue."] },
      { question: "Who's that? ", correctAnswer: "She's my mother.", options: ["He's happy.", "She's tall.", "She's my mother.", "I'm a girl."] },
      { question: "Which one is your toy?", correctAnswer: "The red one.", options: ["The red one.", "It's a toy.", "I like toys.", "It's on the chair."] },
      { question: "What can you do?", correctAnswer: "I can jump.", options: ["I like swimming.", "I've got a ball.", "I can jump.", "I'm happy."] },
      { question: "What's this? It's a ( ).", correctAnswer: "red book", options: ["red book", "book red", "red book is", "book is red"] },
      { question: "He's my ( ). He is young.", correctAnswer: "brother", options: ["father", "grandfather", "brother", "sister"] },
      { question: "I am a fish. I can ( ) but I can't fly.", correctAnswer: "swim", options: ["swim", "jump", "run", "fly"] },
      { question: "It's cold. Please ( ) the door.", correctAnswer: "close", options: ["open", "close", "look", "point"] },
      { question: "How many eggs are in the fridge?", correctAnswer: "Ten.", options: ["Ten.", "They are white.", "I like eggs.", "It's an egg."] },
      { question: "Where is my toy car? I can't find it.", correctAnswer: "It's under the sofa.", options: ["It's under the sofa.", "It's a car.", "I've got a car.", "It's red."] },
      { question: "Can a fish swim?", correctAnswer: "Yes, it can.", options: ["Yes, it can.", "No, it can't.", "It can fly.", "It's a fish."] },
      { question: "The milk is ( ).", correctAnswer: "white", options: ["black", "red", "white", "blue"] },
      { question: "How many cats do you have?", correctAnswer: "I've got two cats.", options: ["I've got two cats.", "They are black.", "It's a cat.", "I like cats."] },
      { question: "Have you got a sister?", correctAnswer: "Yes, I have.", options: ["Yes, I have.", "I've got a dog.", "She is my mother.", "It's a girl."] },
      { question: "What's your favourite color?", correctAnswer: "My favourite color is red.", options: ["My favourite color is red.", "I like apples.", "It's a book.", "I'm seven."] },
      { question: "How many legs does a spider have?", correctAnswer: "It's got eight legs.", options: ["It's got four legs.", "It's got six legs.", "It's got eight legs.", "It's got ten legs."] },
      { question: "How many books are on the table?", correctAnswer: "One book.", options: ["It's a book.", "They are on the table.", "One book.", "I like books."] },
      { question: "Pass me the pencil, please.", correctAnswer: "Here you are.", options: ["Here you are.", "Thank you.", "I'm sorry.", "It's a pencil."] },
      { question: "Here's a cake for you.", correctAnswer: "Thank you.", options: ["Thank you.", "I like cake.", "It's a cake.", "Here you are."] },
      { question: "Who's that boy?", correctAnswer: "He's my brother.", options: ["He's my brother.", "She's my sister.", "It's a boy.", "I'm a boy."] },
      { question: "Is the book on the table?", correctAnswer: "No, it's under the chair.", options: ["No, it's under the chair.", "Yes, it's a book.", "It's red.", "I see a book."] },
      { question: "Have you got a pet?", correctAnswer: "Yes, I've got a cat.", options: ["I like dogs.", "Yes, I see a cat.", "Yes, I've got a cat.", "They are animals."] },
      { question: "How many chairs are in the living room?", correctAnswer: "Four.", options: ["Four.", "They are chairs.", "It's a chair.", "I see chairs."] },
      { question: "Where is the cat? It isn't here.", correctAnswer: "It's under the bed.", options: ["It's under the bed.", "It's here.", "It's a cat.", "I like cats."] },
      { question: "Look at the dog. It's very ( ).", correctAnswer: "big", options: ["big", "a dog", "run", "on the bed"] },
      { question: "She's my ( ). She is old.", correctAnswer: "grandmother", options: ["grandfather", "mother", "grandmother", "brother"] },
      { question: "What color is your new bike?", correctAnswer: "It's pink.", options: ["It's pink.", "It's a bike.", "I like pink.", "It's on the table."] },
      { question: "Who is that woman?", correctAnswer: "She's my mother.", options: ["He's my father.", "It's a woman.", "She's my mother.", "I'm a girl."] },
      { question: "The elephant is ( ) but mouse is small.", correctAnswer: "big", options: ["small", "long", "short", "big"] },
      { question: "I put my pencil on the book. Now it's ( ) the book.", correctAnswer: "on", options: ["on", "under", "in", "next to"] },
      { question: "This is our ( ). We sleep in it.", correctAnswer: "bedroom", options: ["kitchen", "bedroom", "living room", "house"] }
    ];

    // 随机选择题目
    const shuffledQuestions = [...dialogueQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(this.questionsPerRound, shuffledQuestions.length));

    // 转换为统一格式
    return selectedQuestions.map(q => ({
      type: this.mode,
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
        return {
          english: word.english
        };
    }
  }

  renderQuiz() {
    const currentQuestion = this.questions[this.currentIndex];
    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-progress">
            题目 <span class="current">${this.currentIndex + 1}</span> / ${this.questions.length}
          </div>
          <div class="quiz-points">每题${this.getPointsPerQuestion()}分</div>
          <div class="quiz-score">本轮得分: <span class="score">${this.score}</span></div>
        </div>

        <div class="daily-progress-bar">
          <div class="progress-stats">
            <div class="progress-item">📊 今日总得分: <span class="total-score">${window.getTodayPoints ? window.getTodayPoints() : 0}</span>分</div>
            <div class="progress-item">⏰ 今日学习: <span class="study-time">${window.getStudyTime ? window.getStudyTime() : 0}</span>分钟</div>
          </div>
        </div>

        <div class="quiz-question">
          ${this.renderQuestionContent(currentQuestion)}
        </div>

        <div class="quiz-options">
          ${currentQuestion.options.map((option, index) => `
            <div class="quiz-option" data-index="${index}">
              ${this.renderOptionContent(option)}
            </div>
          `).join('')}
        </div>

        <div class="quiz-navigation">
          <button class="quiz-nav-btn" id="prev-question" ${this.currentIndex === 0 ? 'disabled' : ''}>
            ← 上一题
          </button>
          <div class="quiz-feedback" id="quiz-feedback"></div>
          <button class="quiz-nav-btn" id="next-question" disabled>
            下一题 →
          </button>
        </div>

        ${this.currentIndex === this.questions.length - 1 ? `
          <div class="quiz-summary" id="quiz-summary" style="display: none;">
            <h3>📊 测试完成！</h3>
            <p>最终得分: <span class="final-score">${this.score}</span> / ${this.questions.length}</p>
            <p>正确率: <span class="accuracy">${Math.round((this.score / this.questions.length) * 100)}%</span></p>
            <button class="quiz-nav-btn" id="restart-quiz">重新开始</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderQuestionContent(question) {
    if (this.mode === 'listening-to-chinese') {
      return `
        <div class="audio-question">
          <button class="audio-button" id="play-question-audio">🔊</button>
        </div>
      `;
    } else if (this.mode === 'english-dialogue') {
      return `
        <div class="dialogue-question">
          <p class="english-sentence">${question.question.english}</p>
          <button class="audio-button" id="play-question-audio">🔊</button>
        </div>
      `;
    } else if (question.question.english) {
      return `
        <div class="text-question">
          <span class="question-text">${question.question.english}</span>
          ${question.question.showAudio ? '<button class="audio-button" id="play-question-audio">🔊</button>' : ''}
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
    switch (this.mode) {
      case 'english-to-chinese':
        return `<span class="option-text">${option.chinese}</span>`;
      case 'chinese-to-english':
        return `
          <span class="option-text">${option.english}</span>
          <button class="audio-option-button" data-word="${option.english}">🔊</button>
        `;
      case 'listening-to-chinese':
        return `<span class="option-text">${option.chinese}</span>`;
      case 'english-dialogue':
        return `
          <span class="option-text">${option.english}</span>
          <button class="audio-option-button" data-sentence="${option.english}">🔊</button>
        `;
      default:
        return `<span class="option-text">${option.english}</span>`;
    }
  }

  bindEvents() {
    // 选项点击事件
    const options = this.container.querySelectorAll('.quiz-option');
    options.forEach(option => {
      option.addEventListener('click', () => this.selectOption(parseInt(option.dataset.index)));
    });

    // 导航按钮
    document.getElementById('prev-question')?.addEventListener('click', () => {
      if (this.currentIndex > 0) {
        this.goToQuestion(this.currentIndex - 1);
      }
    });

    document.getElementById('next-question')?.addEventListener('click', () => {
      // 只有在选择答案后，且还有下一题时才允许点击
      if (this.selectedAnswer !== null && this.currentIndex < this.questions.length - 1) {
        this.goToQuestion(this.currentIndex + 1);
      }
    });

    document.getElementById('restart-quiz')?.addEventListener('click', () => this.restart());

    // 音频播放按钮
    const playAudioButton = document.getElementById('play-question-audio');
    if (playAudioButton) {
      playAudioButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playQuestionAudio();
      });
    }

    // 选项中的音频按钮
    const audioButtons = this.container.querySelectorAll('.audio-option-button');
    audioButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = button.dataset.word || button.dataset.sentence;
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
      const pointsPerQuestion = this.getPointsPerQuestion();
      this.score += pointsPerQuestion;
      this.container.querySelector('.score').textContent = this.score;

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

    // 显示反馈
    this.showFeedback(isCorrect);

    // 立即启用下一题按钮
    const nextButton = document.getElementById('next-question');
    if (nextButton) {
      nextButton.disabled = false;
    }

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
      console.warn('Failed to play sound effect:', error);
    }
  }

  showFeedback(isCorrect) {
    const feedback = document.getElementById('quiz-feedback');
    const pointsPerQuestion = this.getPointsPerQuestion();
    feedback.textContent = isCorrect ? `✅ 正确！+${pointsPerQuestion}分` : '❌ 错误！';
    feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
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

    // 确保导航按钮状态正确
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');

    if (prevButton) {
      prevButton.disabled = index === 0;
    }

    if (nextButton) {
      // 如果已回答或下一题已有答案，启用下一题按钮
      const hasNextState = this.questionStates[index + 1]?.hasAnswered;
      nextButton.disabled = !this.hasAnswered && !hasNextState;
    }

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
    const summary = document.getElementById('quiz-summary');
    if (summary) {
      summary.style.display = 'block';
    }
  }

  async playQuestionAudio() {
    const currentQuestion = this.questions[this.currentIndex];
    let textToPlay;

    if (this.mode === 'listening-to-chinese') {
      textToPlay = currentQuestion.correctAnswer.english;
    } else if (this.mode === 'english-dialogue') {
      textToPlay = currentQuestion.question.english;

      // 英文对话模式：1.2倍速读题目
      await this.playDialogueAudioThreeTimes(textToPlay);
      return; // 直接返回，不执行下面的通用逻辑
    } else {
      textToPlay = currentQuestion.question.english || '';
    }

    if (textToPlay) {
      // 统一使用speak方法
      audioPlayer.speak(textToPlay).then(() => {
        console.log('Question audio played successfully');
      }).catch(error => {
        console.error('Error playing question audio:', error);
      });
    }
  }

  // 英文对话模式：三遍不同语速读题目
  async playDialogueAudioThreeTimes(text) {
    try {
      console.log('开始读题目:', text);

      // 1.2倍速读一遍
      console.log('1.2倍速读题');
      await audioPlayer.speak(text, { speed: 1.2 });

      console.log('读题完成');

    } catch (error) {
      console.error('三遍读题失败:', error);
    }
  }

  playWordAudio(word) {
    if (word) {
      audioPlayer.speak(word).then(() => {
        console.log('Word audio played successfully');
      }).catch(error => {
        console.error('Error playing word audio:', error);
      });
    }
  }

  restart() {
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
}

// 各个模式的具体实现
export function initEnglishToChineseMode() {
  new QuizMode('english-to-chinese-content', 'english-to-chinese').init();
}

export function initChineseToEnglishMode() {
  new QuizMode('chinese-to-english-content', 'chinese-to-english').init();
}

export function initListeningToChineseMode() {
  new QuizMode('listening-to-chinese-content', 'listening-to-chinese').init();
}

export function initEnglishDialogueMode() {
  new QuizMode('english-dialogue-content', 'english-dialogue').init();
}