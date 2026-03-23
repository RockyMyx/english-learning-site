import { getAllWords, getRandomWords } from '../utils/vocabulary.js';
import audioPlayer from '../utils/audio.js';

export function initTrainingMode() {
  const content = document.getElementById('training-content');
  const words = getRandomWords(20); // 随机选择20个单词进行训练
  let currentIndex = 0;
  let isPlaying = false;
  let repeatCount = 0;

  content.innerHTML = `
    <div class="training-container">
      <div class="training-header">
        <div class="progress-info">
          <span class="current-index">${currentIndex + 1}</span> / ${words.length}
        </div>
        <div class="repeat-info">重复次数: <span id="repeat-count">${repeatCount}</span></div>
      </div>

      <div class="current-word-display">
        <h3 id="training-word-english" class="word-english">${words[currentIndex].english}</h3>
        <p id="training-word-chinese" class="word-chinese">${words[currentIndex].chinese}</p>
      </div>

      <div class="audio-controls">
        <button class="control-btn" id="training-prev-btn">⏮️ 上一个</button>
        <button class="play-btn" id="training-play-btn">🎵 播放发音</button>
        <button class="control-btn" id="training-next-btn">⏭️ 下一个</button>
      </div>

      <div class="training-actions">
        <button class="action-btn" id="repeat-btn">🔄 重复播放</button>
        <button class="action-btn" id="mastered-btn">✅ 已掌握</button>
        <button class="action-btn" id="difficult-btn">❌ 需加强</button>
      </div>

      <div class="training-settings">
        <h4>训练设置</h4>
        <div class="setting-item">
          <label>重复次数:</label>
          <input type="number" id="repeat-target" min="1" max="5" value="3">
        </div>
        <div class="setting-item">
          <label>跟读间隔（秒）:</label>
          <input type="range" id="shadowing-interval" min="1" max="5" value="2">
          <span id="interval-value">2秒</span>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="auto-next" checked> 自动进入下一个
          </label>
        </div>
      </div>

      <div class="training-stats">
        <h4>学习统计</h4>
        <div class="stat-item">
          <span class="stat-label">已掌握:</span>
          <span class="stat-value" id="mastered-count">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">需加强:</span>
          <span class="stat-value" id="difficult-count">0</span>
        </div>
      </div>
    </div>
  `;

  let masteredCount = 0;
  let difficultCount = 0;

  // 事件监听
  document.getElementById('training-play-btn').addEventListener('click', playCurrentWord);
  document.getElementById('training-prev-btn').addEventListener('click', () => goToWord(currentIndex - 1));
  document.getElementById('training-next-btn').addEventListener('click', () => goToWord(currentIndex + 1));
  document.getElementById('repeat-btn').addEventListener('click', repeatWord);
  document.getElementById('mastered-btn').addEventListener('click', markAsMastered);
  document.getElementById('difficult-btn').addEventListener('click', markAsDifficult);
  document.getElementById('shadowing-interval').addEventListener('input', updateInterval);

  function updateCurrentWord() {
    document.getElementById('training-word-english').textContent = words[currentIndex].english;
    document.getElementById('training-word-chinese').textContent = words[currentIndex].chinese;
    document.querySelector('.current-index').textContent = currentIndex + 1;
    repeatCount = 0;
    updateRepeatCount();
  }

  async function playCurrentWord() {
    const word = words[currentIndex].english;
    updateUIPlaying(true);

    try {
      await audioPlayer.speakWord(word);

      // 跟读间隔
      const interval = getShadowingInterval();
      setTimeout(() => {
        updateUIPlaying(false);

        // 自动进入下一个
        if (isAutoNextEnabled() && repeatCount >= getRepeatTarget() - 1) {
          if (currentIndex < words.length - 1) {
            setTimeout(() => {
              goToWord(currentIndex + 1);
            }, 1000);
          }
        }
      }, interval * 1000);
    } catch (error) {
      // console.error('播放失败:', error);
      updateUIPlaying(false);
    }
  }

  function repeatWord() {
    repeatCount++;
    updateRepeatCount();
    playCurrentWord();
  }

  function updateRepeatCount() {
    document.getElementById('repeat-count').textContent = repeatCount;
  }

  function goToWord(index) {
    if (index < 0 || index >= words.length) return;

    currentIndex = index;
    updateCurrentWord();
  }

  function markAsMastered() {
    masteredCount++;
    updateStats();
    saveProgress(words[currentIndex].english, 'mastered');
    showFeedback('已掌握！', 'success');

    if (isAutoNextEnabled() && currentIndex < words.length - 1) {
      setTimeout(() => {
        goToWord(currentIndex + 1);
      }, 500);
    }
  }

  function markAsDifficult() {
    difficultCount++;
    updateStats();
    saveProgress(words[currentIndex].english, 'difficult');
    showFeedback('需要加强练习', 'warning');
  }

  function updateStats() {
    document.getElementById('mastered-count').textContent = masteredCount;
    document.getElementById('difficult-count').textContent = difficultCount;
  }

  function updateUIPlaying(playing) {
    const playBtn = document.getElementById('training-play-btn');
    playBtn.textContent = playing ? '⏳ 播放中...' : '🎵 播放发音';
    playBtn.disabled = playing;
  }

  function updateInterval() {
    const value = document.getElementById('shadowing-interval').value;
    document.getElementById('interval-value').textContent = value + '秒';
  }

  function getShadowingInterval() {
    return parseInt(document.getElementById('shadowing-interval').value);
  }

  function getRepeatTarget() {
    return parseInt(document.getElementById('repeat-target').value);
  }

  function isAutoNextEnabled() {
    return document.getElementById('auto-next').checked;
  }

  function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${type === 'success' ? '#28a745' : '#ffc107'};
      color: ${type === 'success' ? 'white' : '#333'};
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: bold;
      z-index: 1000;
      animation: fadeInOut 1.5s ease;
    `;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 1500);
  }

  function saveProgress(word, status) {
    const progress = JSON.parse(localStorage.getItem('trainingProgress') || '{}');
    if (!progress[word]) {
      progress[word] = { status, timestamp: Date.now() };
      localStorage.setItem('trainingProgress', JSON.stringify(progress));
    }
  }

  // 初始化
  updateInterval();

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .training-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .training-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .progress-info {
      font-size: 1.2rem;
      font-weight: bold;
      color: #667eea;
    }

    .current-index {
      font-size: 1.5rem;
    }

    .current-word-display {
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      margin-bottom: 2rem;
    }

    .current-word-display .word-english {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .current-word-display .word-chinese {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    .training-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }

    .action-btn {
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .action-btn:hover {
      transform: scale(1.05);
    }

    #repeat-btn {
      background: #17a2b8;
      color: white;
    }

    #mastered-btn {
      background: #28a745;
      color: white;
    }

    #difficult-btn {
      background: #dc3545;
      color: white;
    }

    .training-settings,
    .training-stats {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .training-stats h4,
    .training-settings h4 {
      margin-bottom: 1rem;
      color: #333;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .stat-value {
      font-weight: bold;
      color: #667eea;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}