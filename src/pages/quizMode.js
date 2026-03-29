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
      { question: "Where is my bag?", correctAnswer: "It's here.", options: ["It's here.", "It's a bag.", "I've got a bag.", "It's blue."] },
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
      { question: "This is our ( ). We sleep in it.", correctAnswer: "bedroom", options: ["kitchen", "bedroom", "living room", "house"] },
      { question: "What can a monkey do?", correctAnswer: "It can jump.", options: ["It can swim.", "It can jump.", "It can fly.", "It can talk."] },
      { question: "Have you got a pet fish?", correctAnswer: "Yes, I have.", options: ["Yes, I can.", "Yes, I have.", "No, it isn't.", "I like fish."] },
      { question: "Is she your sister?", correctAnswer: "Yes, she is.", options: ["Yes, he is.", "Yes, she is.", "No, it isn't.", "She is beautiful."] },
      { question: "What color is the banana?", correctAnswer: "It's yellow.", options: ["It's red.", "It's green.", "It's orange.", "It's yellow."] },
      { question: "Where are my shoes?", correctAnswer: "They are under the bed.", options: ["They are under the bed.", "It's under the bed.", "They are blue.", "I've got shoes."] },
      { question: "Can you wash your hands?", correctAnswer: "Yes, I can.", options: ["Yes, I can.", "Yes, I have.", "No, I don't.", "I like washing."] },
      { question: "What's that? (pointing to a kite)", correctAnswer: "It's a kite.", options: ["It's blue.", "It can fly.", "It's a kite.", "I like it."] },
      { question: "How many toes have you got?", correctAnswer: "I've got ten toes.", options: ["I've got ten fingers.", "I've got ten toes.", "I've got two legs.", "I've got one nose."] },
      { question: "Is the hippo big?", correctAnswer: "Yes, it is.", options: ["No, it's small.", "Yes, it is.", "It's an animal.", "I like hippos."] },
      { question: "What do you see with?", correctAnswer: "I see with my eyes.", options: ["I see with my ears.", "I see with my nose.", "I see with my eyes.", "I see with my hands."] },
      { question: "Where is the mouse?", correctAnswer: "It's under the chair.", options: ["It's under the chair.", "It's a mouse.", "It's small.", "Cats like mice."] },
      { question: "Can a snake walk?", correctAnswer: "No, it can't.", options: ["Yes, it can.", "It can jump.", "No, it can't.", "It is long."] },
      { question: "Who's that girl?", correctAnswer: "She's my sister.", options: ["He's my brother.", "She's my sister.", "It's a girl.", "I'm a girl."] },
      { question: "Have you got a robot?", correctAnswer: "No, I haven't.", options: ["No, I don't.", "Yes, it is.", "No, I haven't.", "I like robots."] },
      { question: "What can you smell with?", correctAnswer: "I smell with my nose.", options: ["I smell with my mouth.", "I smell with my ears.", "I smell with my nose.", "I smell with my eyes."] },
      { question: "Is the elephant big or small?", correctAnswer: "It's big.", options: ["It's small.", "It's long.", "It's big.", "It's short."] },
      { question: "What color is the milk?", correctAnswer: "It's white.", options: ["It's black.", "It's red.", "It's blue.", "It's white."] },
      { question: "Where is my book? It isn't on the table.", correctAnswer: "It's under the chair.", options: ["It's on the table.", "It's a book.", "I like books.", "It's under the chair."] },
      { question: "Can you feed the cat?", correctAnswer: "Yes, I can.", options: ["Yes, I can.", "Yes, I have.", "No, it can't.", "I like cats."] },
      { question: "What are these?", correctAnswer: "They are apples.", options: ["It's an apple.", "They are bird.", "They are red.", "They are apples."] },
      { question: "Is he your grandfather?", correctAnswer: "Yes, he is.", options: ["Yes, she is.", "He is old.", "Yes, he is.", "I love him."] },
      { question: "How many legs has a frog got?", correctAnswer: "It's got four legs.", options: ["It's got two legs.", "It's got six legs.", "It's got four legs.", "It's got eight legs."] },
      { question: "What do you taste with?", correctAnswer: "I taste with my mouth.", options: ["I taste with my nose.", "I taste with my hands.", "I taste with my eyes.", "I taste with my mouth."] },
      { question: "Welcome to my house.", correctAnswer: "Thank you.", options: ["You are welcome.", "I'm sorry.", "Thank you.", "That's ok."] },
      { question: "Can you brush your teeth?", correctAnswer: "Yes, I can.", options: ["Yes, I have.", "I like brushing.", "Yes, I can.", "My teeth are white."] },
      { question: "What are those?", correctAnswer: "They are birds.", options: ["It's a bird.", "They can fly.", "They are birds.", "I like birds."] },
      { question: "Is the crocodile has big eyes?", correctAnswer: "Yes, it is.", options: ["No, it isn't.", "Yes, it is.", "It's green.", "I don't like it."] },
      { question: "Have you got a bike?", correctAnswer: "Yes, I have.", options: ["Yes, I can.", "It's blue.", "Yes, I have.", "I like bikes."] },
      { question: "What can you touch with?", correctAnswer: "I touch with my hands.", options: ["I touch with my feet.", "I touch with my arms.", "I touch with my hands.", "I touch with my legs."] },
      { question: "Who's that man?", correctAnswer: "He's my father.", options: ["She's my mother.", "He's my father.", "It's a man.", "I'm a boy."] },
      { question: "What color is the frog?", correctAnswer: "It's green.", options: ["It's yellow.", "It's green.", "It's red.", "It's blue."] },
      { question: "Where is the train?", correctAnswer: "It's next to the house.", options: ["It's a train.", "It's long.", "I've got a train.", "It's next to the house."] },
      { question: "Can a crocodile swim?", correctAnswer: "Yes, it can.", options: ["No, it can't.", "Yes, it can.", "It can walk.", "It is big."] },
      { question: "How many eyes have you got?", correctAnswer: "I've got two eyes.", options: ["I've got one eye.", "I've got two eyes.", "I've got ten eyes.", "I've got five eyes."] },
      { question: "Is she your grandmother?", correctAnswer: "Yes, she is.", options: ["Yes, he is.", "She is old.", "Yes, she is.", "I love her."] },
      { question: "What do you hear with?", correctAnswer: "I hear with my ears.", options: ["I hear with my nose.", "I hear with my mouth.", "I hear with my ears.", "I hear with my eyes."] },
      { question: "What's your favourite toy?", correctAnswer: "I like the robot.", options: ["It's a robot.", "I've got a robot.", "I like the robot.", "The robot is small."] },
      { question: "Can you walk?", correctAnswer: "Yes, I can.", options: ["Yes, I have.", "No, I can't.", "Yes, I can.", "I like walking."] },
      { question: "Where is my pencil? I can't find it.", correctAnswer: "It's in your bag.", options: ["It's a pencil.", "It's yellow.", "It's in your bag.", "I've got a pencil."] },
      { question: "Is the snake long or short?", correctAnswer: "It's long.", options: ["It's bad.", "It's long.", "It's green.", "It's an animal."] },
      { question: "What are these? They are my ( ).", correctAnswer: "toys", options: ["toy", "a toy", "toys", "red"] },
      { question: "Can you fly?", correctAnswer: "No, I can't.", options: ["Yes, I can.", "I can jump.", "Birds can fly.", "No, I can't."] },
      { question: "Have you got a kite?", correctAnswer: "Yes, I have.", options: ["Yes, I can.", "Yes, I have.", "It's red.", "I like kites."] },
      { question: "What your cat eat?", correctAnswer: "I feed the cat with fish.", options: ["I like cats.", "The cat likes fish.", "The cat eat birds", "I feed the cat with fish."] },
      { question: "What do you wash with?", correctAnswer: "I wash with my hands.", options: ["I wash with my feet.", "I wash with my hands.", "I wash with my head.", "I wash with my arms."] },
      { question: "Be quiet, please.", correctAnswer: "I'm sorry.", options: ["Thank you.", "That's ok.", "I'm sorry.", "You are welcome."] },
      { question: "Look at that monster! Is it ugly?", correctAnswer: "Yes, it is very ugly.", options: ["No, it's beautiful.", "It's big.", "Yes, it is very ugly.", "I don't like it."] },
      { question: "I am big. I have a long nose. What am I?", correctAnswer: "Elephant", options: ["Tiger", "Elephant", "Horse", "Cat"] },
      { question: "I am yellow. I can swim. I have two legs. What am I?", correctAnswer: "Duck", options: ["Fish", "Duck", "Bird", "Frog"] },
      { question: "My hands are dirty. What can I do?", correctAnswer: "Wash my hands", options: ["Wash my hands", "Brush my teeth", "Open the door", "Sit down"] },
      { question: "Teacher says, 'Be quiet!' What do you do?", correctAnswer: "Don't talk", options: ["Talk", "Don't talk", "Jump", "Run"] },
      { question: "Your friend says, 'Welcome to my house.' What do you say?", correctAnswer: "Thank you", options: ["I'm sorry", "Thank you", "That's ok", "Here you are"] },
      { question: "I am hungry. What do I want?", correctAnswer: "Food", options: ["Book", "Food", "Toy", "Bike"] },
      { question: "It is cold. What can I do?", correctAnswer: "Close the door", options: ["Open the door", "Close the door", "Open the book", "Close the book"] },
      { question: "I cannot find my pencil. What do I say?", correctAnswer: "Where is my pencil?", options: ["How many pencils?", "Where is my pencil?", "What's this?", "Which pencil?"] },
      { question: "He is sad. What can I do?", correctAnswer: "Give him a toy", options: ["Wash my hands", "Give him a toy", "Close the door", "Brush my teeth"] }
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
      <div class="quiz-practice-container">
        <!-- 题目卡片 -->
        <div class="question-card">
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
      const pointsPerQuestion = this.getPointsPerQuestion();
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
    const pointsPerQuestion = this.getPointsPerQuestion();
    feedback.textContent = isCorrect ? `✅ 正确！+${pointsPerQuestion}分` : '❌ 错误！';
    feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  }

  updateNavigationButtons() {
    // 使用 this.container.querySelector 确保只获取当前模式的按钮
    const prevButton = this.container.querySelector('#prev-question');
    const nextButton = this.container.querySelector('#next-question');

    if (prevButton) {
      // 第一题禁用上一题按钮
      prevButton.disabled = this.currentIndex === 0;
    }

    if (nextButton) {
      // 最后一题禁用下一题按钮
      const isLastQuestion = this.currentIndex === this.questions.length - 1;
      // 只有当前题目已回答且不是最后一题时，才启用下一题按钮
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

    const percentage = Math.round((this.score / this.questions.length) * 100);

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
        } else {
          message = '🎯 继续加油学习吧！';
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
      try {
        await this.playDialogueAudioThreeTimes(textToPlay);
      } catch (error) {
        // console.error('英文对话音频播放失败:', error);
      }
      return; // 直接返回，不执行下面的通用逻辑
    } else {
      textToPlay = currentQuestion.question.english || '';
    }

    if (textToPlay) {
      // 统一使用speak方法
      audioPlayer.speak(textToPlay).then(() => {
        // console.log('Question audio played successfully');
      }).catch(error => {
        // console.error('Error playing question audio:', error);
      });
    }
  }

  // 英文对话模式：1倍速读题目
  async playDialogueAudioThreeTimes(text) {
    try {
      // console.log('英文对话模式开始读题目:', text);

      // 1倍速读一遍
      // console.log('调用音频播放器，语速1.0');
      await audioPlayer.speak(text, { speed: 1.0 });

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

      audioPlayer.speak(word).then(() => {
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
  const quiz = new QuizMode('english-dialogue-content', 'english-dialogue');
  quiz.init();
  return quiz;
}