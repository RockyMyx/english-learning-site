import { getAllWords } from '../utils/vocabulary.js';
import audioPlayer from '../utils/audio.js';

// 全局变量
let selectedWords = [];
let dictationResults = [];
let currentDictationIndex = 0;

export function initListeningMode() {
  const content = document.getElementById('listening-content');
  const allWords = getAllWords();

  // 重置变量
  selectedWords = [];
  dictationResults = new Array(10).fill(null);
  currentDictationIndex = 0;

  content.innerHTML = `
    <div class="dictation-selection">
      <div class="selection-header">
        <h3>选择听写单词</h3>
        <p>选择10个单词进行听写练习</p>
      </div>

      <div class="selection-controls">
        <button class="primary-btn" id="random-select-btn">随机选择</button>
      </div>

      <div class="words-grid">
        ${allWords.map((word, index) => `
          <div class="word-block" data-index="${index}" data-word='${JSON.stringify(word)}'>
            <div class="word-english">${word.english}</div>
            <div class="word-chinese">${word.chinese}</div>
          </div>
        `).join('')}
      </div>

      <!-- 底部固定操作栏 -->
      <div class="dictation-sticky-bar">
        <div class="sticky-bar-content">
          <div class="selected-info">
            <span class="selected-label">已选择</span>
            <span class="selected-count" id="sticky-selected-count">${selectedWords.length}</span>
            <span class="selected-total">/ 10</span>
          </div>
          <div class="selected-preview" id="selected-preview"></div>
          <button class="sticky-start-btn ${selectedWords.length === 10 ? '' : 'disabled'}" id="start-dictation-btn"
                  ${selectedWords.length === 10 ? '' : 'disabled'}>
            开始听写
          </button>
        </div>
      </div>
    </div>
  `;

  // 事件监听
  document.getElementById('random-select-btn').addEventListener('click', handleRandomSelect);
  document.getElementById('start-dictation-btn').addEventListener('click', startDictation);

  // 绑定单词方块点击事件
  bindWordBlockEvents();

  updateSelectedWords();
}

function bindWordBlockEvents() {
  document.querySelectorAll('.word-block').forEach(block => {
    block.addEventListener('click', () => {
      const word = JSON.parse(block.dataset.word);
      const index = parseInt(block.dataset.index);

      // 检查是否已经选中
      const existingIndex = selectedWords.findIndex(w => w.english === word.english);

      if (existingIndex !== -1) {
        // 取消选择
        selectedWords.splice(existingIndex, 1);
        block.classList.remove('selected');
      } else if (selectedWords.length < 10) {
        // 添加选择
        selectedWords.push(word);
        block.classList.add('selected');
      }

      updateSelectedWords();
    });
  });
}

function handleRandomSelect() {
  const allWords = getAllWords();

  // 如果已经选择了一些单词，先保留这些
  const currentSelected = [...selectedWords];

  // 计算还需要选择多少个
  const needed = 10 - currentSelected.length;

  if (needed > 0) {
    // 从未选择的单词中随机选择
    const unselectedWords = allWords.filter(word =>
      !currentSelected.some(selected => selected.english === word.english)
    );

    const randomWords = getRandomWords(unselectedWords, needed);
    selectedWords = [...currentSelected, ...randomWords];
  } else {
    // 如果已经选了10个，重新随机选择
    selectedWords = getRandomWords(allWords, 10);
  }

  // 更新UI高亮
  updateWordBlockSelections();
  updateSelectedWords();
}

function updateWordBlockSelections() {
  document.querySelectorAll('.word-block').forEach(block => {
    const word = JSON.parse(block.dataset.word);
    if (selectedWords.some(w => w.english === word.english)) {
      block.classList.add('selected');
    } else {
      block.classList.remove('selected');
    }
  });
}

function updateSelectedWords() {
  const stickyCount = document.getElementById('sticky-selected-count');
  const startBtn = document.getElementById('start-dictation-btn');
  const preview = document.getElementById('selected-preview');

  // 更新底部栏计数
  if (stickyCount) {
    stickyCount.textContent = selectedWords.length;
  }

  // 更新预览文字（显示前3个单词）
  if (preview) {
    if (selectedWords.length === 0) {
      preview.textContent = '请点击上方单词进行选择';
    } else {
      const previewWords = selectedWords.slice(0, 3).map(w => w.english).join(', ');
      const more = selectedWords.length > 3 ? ` 等${selectedWords.length}个` : '';
      preview.textContent = previewWords + more;
    }
  }

  // 更新按钮状态
  if (selectedWords.length === 10) {
    startBtn.disabled = false;
    startBtn.classList.remove('disabled');
  } else {
    startBtn.disabled = true;
    startBtn.classList.add('disabled');
  }
}

function startDictation() {
  if (selectedWords.length !== 10) return;

  // 重置结果
  dictationResults = new Array(10).fill(null);
  currentDictationIndex = 0;

  const content = document.getElementById('listening-content');

  content.innerHTML = `
    <div class="dictation-practice">
      <div class="practice-header">
        <h3>点击音频播放单词，听写正确后点击"答对"</h3>
      </div>

      <div class="stats-info-center">
        <span>答对: <strong id="correct-count">0</strong></span>
        <span>答错: <strong id="wrong-count">0</strong></span>
      </div>

      <div class="practice-list">
        ${selectedWords.map((word, index) => `
          <div class="dictation-item" data-index="${index}">
            <span class="dictation-number">${index + 1}</span>
            <button class="audio-btn" data-word="${word.english}" data-index="${index}">
              <i class="fas fa-volume-up"></i>
              <span>播放</span>
            </button>
            <div class="dictation-result" id="result-${index}">
              <button class="result-btn answer-btn" data-word="${word.english}" data-index="${index}">
                <i class="fas fa-eye"></i>
                <span>查看答案</span>
              </button>
              <button class="result-btn correct-btn" data-index="${index}">答对</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="practice-controls">
        <button class="nav-btn secondary-btn" id="back-to-selection-btn">返回</button>
        <button class="nav-btn primary-btn" id="finish-dictation-btn">完成</button>
      </div>
    </div>
  `;

  // 绑定音频按钮事件
  document.querySelectorAll('.audio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const word = btn.dataset.word;
      audioPlayer.speakWord(word).then(() => {
        btn.textContent = '🔊 已播放';
        setTimeout(() => {
          btn.textContent = '🔊 播放';
        }, 1000);
      }).catch(error => {
        console.error('播放失败:', error);
      });
    });
  });

  // 绑定答对按钮事件
  document.querySelectorAll('.result-btn.correct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      markResult(index);
    });
  });

  // 绑定查看答案按钮事件
  document.querySelectorAll('.result-btn.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const word = btn.dataset.word;
      const index = parseInt(btn.dataset.index);
      showAnswer(index, word, btn);
    });
  });

  // 绑定返回按钮
  document.getElementById('back-to-selection-btn').addEventListener('click', () => {
    selectedWords = [];
    initListeningMode();
  });

  // 绑定完成按钮
  document.getElementById('finish-dictation-btn').addEventListener('click', finishDictation);

  updateDictationProgress();
}

function markResult(index, isCorrect) {
  const resultDiv = document.getElementById(`result-${index}`);
  const correctBtn = resultDiv.querySelector('.correct-btn');

  // 如果按钮已被禁用，直接返回
  if (correctBtn && correctBtn.disabled) return;

  dictationResults[index] = true;

  // 修改按钮状态而不是替换整个内容
  correctBtn.disabled = true;
  correctBtn.classList.add('clicked', 'correct-clicked');

  // 更新按钮内容，添加勾选标记
  correctBtn.innerHTML = `
    <i class="fas fa-check"></i>
    <span>答对</span>
  `;

  // 播放答对音效
  playFeedbackSound(true);

  // 加2分
  if (window.router) {
    window.router.addPoints(2);
  }

  updateDictationProgress();
}

function showAnswer(index, word, button) {
  // 直接替换按钮内容为单词显示（小写）
  button.className = 'result-btn answer-display';
  button.innerHTML = `
    <span class="answer-word">${word.toLowerCase()}</span>
  `;
  button.disabled = true;

  // 移除事件监听器，防止重复点击
  const newButton = button.cloneNode(true);
  button.parentNode.replaceChild(newButton, button);
}

function playFeedbackSound(isCorrect) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 设置较大的音量
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);

    if (isCorrect) {
      // 答对：欢快的高音音效
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(659, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.2); // G5
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    } else {
      // 答错：低沉的低音音效
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    // console.log('无法播放反馈音效:', error);
  }
}

function updateDictationProgress() {
  const completed = dictationResults.filter(result => result !== null).length;
  const correct = dictationResults.filter(result => result === true).length;

  const progressElement = document.getElementById('current-progress');
  const correctElement = document.getElementById('correct-count');
  const wrongElement = document.getElementById('wrong-count');

  if (progressElement) progressElement.textContent = `${completed}/10`;
  if (correctElement) correctElement.textContent = correct;
  if (wrongElement) wrongElement.textContent = '0';
}

function finishDictation() {
  const correct = dictationResults.filter(result => result === true).length;
  const wrong = dictationResults.filter(result => result === false).length;
  const totalScore = correct * 2;

  const content = document.getElementById('listening-content');

  content.innerHTML = `
    <div class="quiz-summary" style="position: static; background: transparent; backdrop-filter: none;">
      <div class="summary-content">
        <div class="summary-icon">🎉</div>
        <h3>听写完成！</h3>
        <div class="summary-stats">
          <div class="stat-box">
            <span class="stat-value">${correct}</span>
            <span class="stat-label">答对</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="restart-btn secondary" onclick="location.reload()">再练一次</button>
          <button class="restart-btn" onclick="window.router.navigate('/')">返回首页</button>
        </div>
      </div>
    </div>
  `;

  // 保存练习结果到本地存储
  saveDictationResult(correct, wrong, totalScore);
}

function saveDictationResult(correct, wrong, score) {
  const today = new Date().toISOString().split('T')[0];
  const results = JSON.parse(localStorage.getItem('dictationResults') || '{}');

  if (!results[today]) {
    results[today] = [];
  }

  results[today].push({
    date: today,
    correct: correct,
    wrong: wrong,
    score: score,
    totalWords: 10
  });

  localStorage.setItem('dictationResults', JSON.stringify(results));
}

// 辅助函数：获取随机单词
function getRandomWords(words, count) {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 清理函数：用于页面切换时重置状态
export function cleanupListeningMode() {
  // 清理弹框
  const summary = document.getElementById('quiz-summary');
  if (summary) {
    summary.remove();
  }

  // 只清理听力模式相关的DOM状态
  const listeningContainer = document.getElementById('listening-content');
  if (listeningContainer) {
    const buttons = listeningContainer.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = false;
      button.classList.remove('clicked', 'correct-clicked', 'disabled');
    });

    // 重置所有输入框
    const inputs = listeningContainer.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.value = '';
      input.disabled = false;
    });

    // 重置进度显示
    const progressElements = listeningContainer.querySelectorAll('[id*="progress"], [id*="count"]');
    progressElements.forEach(element => {
      if (element.id === 'current-progress') element.textContent = '0/10';
      if (element.id === 'correct-count') element.textContent = '0';
      if (element.id === 'wrong-count') element.textContent = '0';
    });
  }

  // 停止音频播放
  audioPlayer.stop();

  // 重置全局变量
  selectedWords = [];
  dictationResults = [];
  currentDictationIndex = 0;

  console.log('听力模式已清理，相关状态已重置');
}