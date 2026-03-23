import { getAllWords } from '../utils/vocabulary.js';

export function initPlaylistPage() {
  const content = document.getElementById('playlist-content');
  const words = getAllWords();

  content.innerHTML = `
    <div class="playlist-page">
      <div class="playlist-header">
        <h3>📚 我的单词播放列表</h3>
        <p>共 ${words.length} 个单词</p>
      </div>

      <div class="playlist-controls">
        <button class="control-btn" id="select-all">全选</button>
        <button class="control-btn" id="deselect-all">取消全选</button>
        <button class="control-btn primary" id="play-selected">播放选中的单词</button>
        <button class="control-btn" id="shuffle-random">随机选择20个</button>
      </div>

      <div class="playlist-filters">
        <h4>分类筛选</h4>
        <div class="filter-buttons">
          <button class="filter-btn active" data-category="all">全部</button>
          <button class="filter-btn" data-category="numbers">数字</button>
          <button class="filter-btn" data-category="colors">颜色</button>
          <button class="filter-btn" data-category="actions">动作</button>
          <button class="filter-btn" data-category="foods">食物</button>
          <button class="filter-btn" data-category="body">身体</button>
          <button class="filter-btn" data-category="animals">动物</button>
          <button class="filter-btn" data-category="family">家庭</button>
          <button class="filter-btn" data-category="adjectives">形容词</button>
        </div>
      </div>

      <div class="playlist-search">
        <input type="text" id="search-input" placeholder="搜索单词或中文意思...">
      </div>

      <div class="playlist-container" id="playlist-container">
        ${renderPlaylistItems(words)}
      </div>

      <div class="playlist-summary">
        <div class="summary-item">
          <span class="summary-label">已选择:</span>
          <span class="summary-value" id="selected-count">0</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">显示:</span>
          <span class="summary-value" id="visible-count">${words.length}</span>
        </div>
      </div>
    </div>
  `;

  // 存储当前状态
  let selectedWords = new Set();
  let currentCategory = 'all';
  let searchQuery = '';
  let displayedWords = [...words];

  // 事件监听
  setupEventListeners();
}

function renderPlaylistItems(words) {
  return `
    <div class="playlist-grid">
      ${words.map(word => `
        <div class="playlist-card" data-word="${word.english}" data-chinese="${word.chinese}">
          <div class="playlist-checkbox">
            <input type="checkbox" class="word-checkbox" data-english="${word.english}">
          </div>
          <div class="playlist-word">
            <span class="word-english">${word.english}</span>
            <span class="word-chinese">${word.chinese}</span>
          </div>
          <button class="play-word-btn" data-word="${word.english}">🔊</button>
        </div>
      `).join('')}
    </div>
  `;
}

function setupEventListeners() {
  // 复选框事件
  document.querySelectorAll('.word-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const word = e.target.dataset.english;
      if (e.target.checked) {
        selectedWords.add(word);
      } else {
        selectedWords.delete(word);
      }
      updateSelectedCount();
    });
  });

  // 播放单个单词按钮
  document.querySelectorAll('.play-word-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const word = e.target.dataset.word;
      playSingleWord(word);
    });
  });

  // 控制按钮
  document.getElementById('select-all').addEventListener('click', selectAll);
  document.getElementById('deselect-all').addEventListener('click', deselectAll);
  document.getElementById('play-selected').addEventListener('click', playSelectedWords);
  document.getElementById('shuffle-random').addEventListener('click', selectRandomWords);

  // 分类筛选
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => filterByCategory(btn.dataset.category));
  });

  // 搜索功能
  document.getElementById('search-input').addEventListener('input', handleSearch);
}

function selectAll() {
  document.querySelectorAll('.word-checkbox').forEach(checkbox => {
    checkbox.checked = true;
    selectedWords.add(checkbox.dataset.english);
  });
  updateSelectedCount();
}

function deselectAll() {
  document.querySelectorAll('.word-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  selectedWords.clear();
  updateSelectedCount();
}

function playSelectedWords() {
  if (selectedWords.size === 0) {
    alert('请先选择要播放的单词');
    return;
  }

  const wordsToPlay = Array.from(selectedWords);
  playWordsSequence(wordsToPlay);
}

function selectRandomWords() {
  deselectAll();

  const allWords = getStoredWords();
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  const randomWords = shuffled.slice(0, 20);

  randomWords.forEach(word => {
    const checkbox = document.querySelector(`.word-checkbox[data-english="${word.english}"]`);
    if (checkbox) {
      checkbox.checked = true;
      selectedWords.add(word.english);
    }
  });

  updateSelectedCount();
}

function filterByCategory(category) {
  // 更新按钮状态
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  currentCategory = category;
  filterAndRenderWords();
}

function handleSearch(e) {
  searchQuery = e.target.value.toLowerCase();
  filterAndRenderWords();
}

function filterAndRenderWords() {
  let allWords = getStoredWords();

  // 分类筛选
  if (currentCategory !== 'all') {
    allWords = allWords.filter(word => {
      // 这里需要根据实际情况添加分类逻辑
      return true; // 暂时返回全部，实际需要实现分类逻辑
    });
  }

  // 搜索筛选
  if (searchQuery) {
    allWords = allWords.filter(word =>
      word.english.toLowerCase().includes(searchQuery) ||
      word.chinese.includes(searchQuery)
    );
  }

  displayedWords = allWords;

  // 重新渲染
  document.getElementById('playlist-container').innerHTML = renderPlaylistItems(allWords);
  document.getElementById('visible-count').textContent = allWords.length;

  // 重新绑定事件
  rebindEvents();
}

function rebindEvents() {
  // 清除旧的事件监听器，重新绑定
  document.querySelectorAll('.word-checkbox').forEach(checkbox => {
    checkbox.checked = selectedWords.has(checkbox.dataset.english);
    checkbox.addEventListener('change', (e) => {
      const word = e.target.dataset.english;
      if (e.target.checked) {
        selectedWords.add(word);
      } else {
        selectedWords.delete(word);
      }
      updateSelectedCount();
    });
  });

  document.querySelectorAll('.play-word-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const word = e.target.dataset.word;
      playSingleWord(word);
    });
  });
}

function updateSelectedCount() {
  document.getElementById('selected-count').textContent = selectedWords.size;
}

function playSingleWord(word) {
  import('../utils/audio.js').then(audioModule => {
    audioModule.default.speakWord(word).catch(() => {});
  });
}

function playWordsSequence(words) {
  let index = 0;

  function playNext() {
    if (index >= words.length) {
      alert('播放完成！');
      return;
    }

    const word = words[index];
    import('../utils/audio.js').then(audioModule => {
      audioModule.default.speakWord(word).then(() => {
        index++;
        setTimeout(playNext, 1000); // 间隔1秒
      }).catch(() => {
        index++;
        setTimeout(playNext, 1000);
      });
    });
  }

  playNext();
}

function getStoredWords() {
  return JSON.parse(localStorage.getItem('allWords') || '[]');
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .playlist-page {
    max-width: 1200px;
    margin: 0 auto;
  }

  .playlist-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .playlist-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .control-btn {
    padding: 0.8rem 1.5rem;
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .control-btn:hover {
    background: #667eea;
    color: white;
  }

  .control-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
  }

  .playlist-filters {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .playlist-filters h4 {
    margin-bottom: 1rem;
    color: #333;
  }

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #e9ecef;
    background: white;
    color: #666;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .filter-btn:hover {
    border-color: #667eea;
    color: #667eea;
  }

  .filter-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .playlist-search {
    margin-bottom: 1.5rem;
  }

  .playlist-search input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .playlist-search input:focus {
    outline: none;
    border-color: #667eea;
  }

  .playlist-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
  }

  .playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .playlist-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .playlist-card:hover {
    border-color: #667eea;
    background: #f8f9fa;
  }

  .playlist-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 0.5rem;
    accent-color: #667eea;
  }

  .playlist-word {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .word-english {
    font-weight: bold;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .word-chinese {
    color: #666;
    font-size: 0.9rem;
  }

  .play-word-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: transform 0.2s ease;
  }

  .play-word-btn:hover {
    transform: scale(1.1);
  }

  .playlist-summary {
    display: flex;
    justify-content: center;
    gap: 2rem;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .summary-label {
    color: #666;
  }

  .summary-value {
    font-weight: bold;
    color: #667eea;
    font-size: 1.2rem;
  }
`;
document.head.appendChild(style);