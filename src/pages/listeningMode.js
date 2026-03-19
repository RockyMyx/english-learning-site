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
        <h3>📝 选择听写单词</h3>
        <p>选择10个单词进行听写练习</p>
      </div>

      <div class="selection-controls">
        <button class="primary-btn" id="random-select-btn">🎲 随机选择10个单词</button>
      </div>

      <div class="words-grid">
        ${allWords.map((word, index) => `
          <div class="word-block" data-index="${index}" data-word='${JSON.stringify(word)}'>
            <div class="word-english">${word.english}</div>
            <div class="word-chinese">${word.chinese}</div>
          </div>
        `).join('')}
      </div>

      <div class="selected-summary">
        <h4>已选择单词 (${selectedWords.length}/10)</h4>
        <div class="selected-words" id="selected-words"></div>
        <button class="primary-btn ${selectedWords.length === 10 ? '' : 'disabled'}" id="start-dictation-btn"
                ${selectedWords.length === 10 ? '' : 'disabled'}>
          开始听写 (${selectedWords.length}/10)
        </button>
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
  const selectedWordsContainer = document.getElementById('selected-words');
  const startBtn = document.getElementById('start-dictation-btn');

  // 更新选中的单词显示
  selectedWordsContainer.innerHTML = selectedWords.map(word => `
    <div class="selected-word">
      <span class="word-english">${word.english}</span>
      <span class="word-chinese">${word.chinese}</span>
    </div>
  `).join('');

  // 更新按钮状态
  if (selectedWords.length === 10) {
    startBtn.disabled = false;
    startBtn.textContent = `开始听写 (${selectedWords.length}/10)`;
    startBtn.classList.remove('disabled');
  } else {
    startBtn.disabled = true;
    startBtn.textContent = `开始听写 (${selectedWords.length}/10)`;
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
        <h3>🎧 单词听写练习</h3>
        <p>点击音频图标播放单词，根据孩子听写情况进行批改</p>
        <div class="progress-info">
          <span id="current-progress">0/10</span>
          <span>已批改：<span id="correct-count">0</span>题，<span id="wrong-count">0</span>题</span>
        </div>
      </div>

      <div class="practice-grid">
        ${selectedWords.map((word, index) => `
          <div class="dictation-item" data-index="${index}">
            <div class="dictation-header">
              <span class="dictation-number">题目 ${index + 1}</span>
              <span class="dictation-word" style="display: none;">${word.english}</span>
            </div>
            <div class="dictation-controls">
              <button class="audio-btn" data-word="${word.english}" data-index="${index}">
                🔊 播放
              </button>
            </div>
            <div class="dictation-result" id="result-${index}">
              <div class="result-buttons" id="buttons-${index}">
                <button class="result-btn correct-btn" data-index="${index}">✓ 答对</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="practice-controls">
        <button class="secondary-btn" id="back-to-selection-btn">返回选择</button>
        <button class="primary-btn" id="finish-dictation-btn">完成听写</button>
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
  const buttonsDiv = document.getElementById(`buttons-${index}`);
  const correctBtn = buttonsDiv.querySelector('.correct-btn');
  
  // 如果按钮已被禁用，直接返回
  if (correctBtn && correctBtn.disabled) return;
  
  dictationResults[index] = true;

  // 禁用按钮，确保只能点击一次
  if (correctBtn) {
    correctBtn.disabled = true;
    correctBtn.classList.add('disabled');
  }

  // 播放答对音效
  playFeedbackSound(true);

  // 显示答对结果
  buttonsDiv.innerHTML = `
    <div class="result-display correct">
      <span class="result-icon">✓</span>
      <span class="result-text">答对！</span>
      <div class="result-score">
        得分：<span class="score-value">2</span>
      </div>
    </div>
  `;
  buttonsDiv.classList.add('correct');
  
  // 加1分
  if (window.router) {
    window.router.addPoints(1);
  }

  updateDictationProgress();
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
    console.log('无法播放反馈音效:', error);
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
    <div class="dictation-result-summary">
      <div class="result-header">
        <h3>🎉 听写完成！</h3>
        <p>恭喜完成10个单词的听写练习</p>
      </div>

      <div class="result-stats">
        <div class="stat-item">
          <div class="stat-number">${correct}</div>
          <div class="stat-label">答对</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${wrong}</div>
          <div class="stat-label">答错</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${totalScore}</div>
          <div class="stat-label">总得分</div>
        </div>
      </div>

      <div class="result-actions">
        <button class="primary-btn" onclick="initListeningMode()">返回选择</button>
        <button class="secondary-btn" onclick="location.reload()">再次练习</button>
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