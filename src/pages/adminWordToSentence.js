import { getAllWords, getCustomWords, addCustomWord, deleteCustomWord } from '../utils/vocabulary.js';
import { generateSentences } from '../utils/sentenceGenerator.js';
import { wordSentenceData } from '../data/sentenceData.js';

// 获取localStorage中的题目数据
function getStoredQuestions() {
  try {
    const data = localStorage.getItem('adminWordSentenceQuestions');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// 保存题目数据到localStorage
function saveStoredQuestions(data) {
  localStorage.setItem('adminWordSentenceQuestions', JSON.stringify(data));
}

// 获取硬编码的题目（从wordToSentenceMode.js导入的副本）
function getHardcodedQuestions() {
  return wordSentenceData;
}

// ========== 单词列表页 ==========
export class AdminWordList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.allWords = getAllWords();
    this.customWords = getCustomWords();
    this.searchKeyword = '';
  }

  init() {
    this.render();
    this.bindEvents();
  }

  getFilteredWords() {
    if (!this.searchKeyword.trim()) return this.allWords;
    const kw = this.searchKeyword.toLowerCase();
    return this.allWords.filter(w =>
      w.english.toLowerCase().includes(kw) ||
      w.chinese.toLowerCase().includes(kw)
    );
  }

  getQuestionCount(word) {
    const hardcoded = getHardcodedQuestions();
    const stored = getStoredQuestions();
    let count = 0;
    const hcItem = hardcoded.find(q => q.word === word);
    if (hcItem) count += hcItem.englishSentences.length;
    const storedItem = stored[word];
    if (storedItem) count += (storedItem.englishSentences?.length || 0);
    return count;
  }

  isCustomWord(word) {
    return this.customWords.some(w => w.english === word);
  }

  render() {
    const words = this.getFilteredWords();
    this.container.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <div class="admin-word-info">
            <h2>单词列表</h2>
            <span class="word-progress">共 ${words.length} 个单词</span>
          </div>
          <div class="admin-actions">
            <button class="admin-btn add-word-btn" id="add-word-btn">
              <i class="fas fa-plus"></i> 新增单词
            </button>
          </div>
        </div>

        <div class="admin-section">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input type="text" id="word-search" placeholder="搜索单词或中文..." value="${this.searchKeyword}">
          </div>
        </div>

        <div class="admin-section">
          <div class="word-list">
            ${words.length === 0 ? '<p class="empty-tip">暂无单词</p>' : ''}
            ${words.map(w => {
              const qCount = this.getQuestionCount(w.english);
              const isCustom = this.isCustomWord(w.english);
              return `
                <div class="word-item">
                  <div class="word-info">
                    <div class="word-en">${w.english}</div>
                    <div class="word-zh">${w.chinese}</div>
                  </div>
                  <div class="word-meta">
                    <span class="question-count">${qCount} 题</span>
                    <div class="word-actions">
                      <button class="admin-btn detail-btn" data-word="${w.english}">
                        <i class="fas fa-edit"></i> 详情
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 搜索
    const searchInput = this.container.querySelector('#word-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
        this.render();
        this.bindEvents();
      });
    }

    // 详情按钮
    this.container.querySelectorAll('.detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const word = e.currentTarget.dataset.word;
        window.router.navigate(`/admin/word-to-sentence/${word}`);
      });
    });

    // 新增单词
    const addBtn = this.container.querySelector('#add-word-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAddWord());
    }
  }

  handleAddWord() {
    window.router.navigate('/admin/add-word');
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

// ========== 单词出题详情页 ==========
export class AdminWordToSentence {
  constructor(containerId, wordEnglish) {
    this.container = document.getElementById(containerId);
    this.wordEnglish = wordEnglish;
    this.allWords = getAllWords();
    this.currentWord = this.allWords.find(w => w.english === wordEnglish);
    this.generatedQuestions = [];
    this.editingIndex = -1;
    this.isLoading = false;
    this.errorMessage = '';
  }

  init() {
    this.render();
    this.bindEvents();
  }

  // 获取合并后的题目（硬编码 + localStorage）
  getMergedQuestions(word) {
    const stored = getStoredQuestions();
    const hardcoded = getHardcodedQuestions();
    const hardcodedItem = hardcoded.find(q => q.word === word);
    const storedItem = stored[word];

    let englishSentences = [];
    let chineseSentences = [];

    if (hardcodedItem) {
      englishSentences = [...hardcodedItem.englishSentences];
      chineseSentences = [...hardcodedItem.chineseSentences];
    }

    if (storedItem) {
      englishSentences = [...englishSentences, ...storedItem.englishSentences];
      chineseSentences = [...chineseSentences, ...storedItem.chineseSentences];
    }

    return { englishSentences, chineseSentences };
  }

  render() {
    const word = this.currentWord;
    if (!word) {
      this.container.innerHTML = '<p class="empty-tip">单词不存在</p>';
      return;
    }

    const { englishSentences, chineseSentences } = this.getMergedQuestions(word.english);

    this.container.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <div class="admin-word-info">
            <h2>${word.english} <span class="word-chinese">${word.chinese}</span></h2>
            <span class="word-progress">${englishSentences.length} 题</span>
          </div>
          <div class="admin-actions">
            <button class="admin-btn back-btn" id="back-to-list">
              <i class="fas fa-arrow-left"></i> 返回列表
            </button>
            <button class="admin-btn generate-btn" id="generate-questions" ${this.isLoading ? 'disabled' : ''}>
              <i class="fas fa-magic"></i> ${this.isLoading ? '出题中...' : '出题'}
            </button>
          </div>
        </div>

        ${this.errorMessage ? `
          <div class="admin-section">
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> ${this.errorMessage}
            </div>
          </div>
        ` : ''}

        ${this.isLoading ? `
          <div class="admin-section">
            <div class="loading-indicator">
              <div class="loading-spinner"></div>
              <span>AI正在生成题目，请稍候...</span>
            </div>
          </div>
        ` : ''}

        <div class="admin-section">
          <h3><i class="fas fa-list"></i> 已有题目 (${englishSentences.length}题)</h3>
          <div class="existing-questions">
            ${englishSentences.length === 0 ? '<p class="empty-tip">暂无题目</p>' : ''}
            ${englishSentences.map((en, idx) => `
              <div class="question-item ${this.editingIndex === idx ? 'editing' : ''}" data-index="${idx}">
                <div class="question-content">
                  <div class="question-en">${en}</div>
                  <div class="question-zh">${chineseSentences[idx] || ''}</div>
                </div>
                <div class="question-actions">
                  ${this.editingIndex === idx ? `
                    <button class="admin-btn update-btn" data-index="${idx}">
                      <i class="fas fa-save"></i> 更新
                    </button>
                    <button class="admin-btn cancel-btn" data-index="${idx}">
                      <i class="fas fa-times"></i> 取消
                    </button>
                  ` : `
                    <button class="admin-btn edit-btn" data-index="${idx}">
                      <i class="fas fa-edit"></i> 编辑
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="admin-section generated-section" id="generated-section" style="display: ${this.generatedQuestions.length > 0 ? 'block' : 'none'};">
          <h3><i class="fas fa-magic"></i> 生成题目 (${this.generatedQuestions.length}题)</h3>
          <div class="generated-questions">
            ${this.generatedQuestions.map((q, idx) => `
              <div class="question-item generated" data-gen-index="${idx}">
                <div class="question-content">
                  <div class="question-en">${q.english}</div>
                  <div class="question-zh">${q.chinese}</div>
                </div>
                <div class="question-actions">
                  <button class="admin-btn add-btn" data-gen-index="${idx}">
                    <i class="fas fa-plus"></i> 加入题目
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 返回列表
    const backBtn = this.container.querySelector('#back-to-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.router.navigate('/admin/word-to-sentence');
      });
    }

    // 出题按钮
    const generateBtn = this.container.querySelector('#generate-questions');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    // 编辑按钮
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleEdit(index);
      });
    });

    // 更新按钮
    this.container.querySelectorAll('.update-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleUpdate(index);
      });
    });

    // 取消按钮
    this.container.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editingIndex = -1;
        this.render();
        this.bindEvents();
      });
    });

    // 加入题目按钮
    this.container.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.genIndex);
        this.handleAdd(index);
      });
    });
  }

  async handleGenerate() {
    const word = this.currentWord;
    this.errorMessage = '';
    this.isLoading = true;
    this.generatedQuestions = [];
    this.render();
    this.bindEvents();

    try {
      this.generatedQuestions = await generateSentences(word.english, word.chinese, 10);
      if (this.generatedQuestions.length === 0) {
        this.errorMessage = '未能生成有效题目，请重试';
      }
    } catch (error) {
      this.errorMessage = `出题失败：${error.message}`;
      this.generatedQuestions = [];
    } finally {
      this.isLoading = false;
      this.render();
      this.bindEvents();
    }
  }

  handleEdit(index) {
    this.editingIndex = index;
    this.render();
    this.bindEvents();

    // 将对应题目替换为输入框
    const item = this.container.querySelector(`.question-item[data-index="${index}"]`);
    if (item) {
      const word = this.currentWord;
      const { englishSentences, chineseSentences } = this.getMergedQuestions(word.english);
      const content = item.querySelector('.question-content');
      content.innerHTML = `
        <div class="edit-field">
          <label>英文句子</label>
          <textarea class="edit-en" rows="2">${englishSentences[index]}</textarea>
        </div>
        <div class="edit-field">
          <label>中文句子</label>
          <textarea class="edit-zh" rows="2">${chineseSentences[index]}</textarea>
        </div>
      `;
    }
  }

  handleUpdate(index) {
    const item = this.container.querySelector(`.question-item[data-index="${index}"]`);
    if (!item) return;

    const enInput = item.querySelector('.edit-en');
    const zhInput = item.querySelector('.edit-zh');
    if (!enInput || !zhInput) return;

    const newEn = enInput.value.trim();
    const newZh = zhInput.value.trim();
    if (!newEn || !newZh) {
      alert('中英文句子都不能为空');
      return;
    }

    const word = this.currentWord;
    const stored = getStoredQuestions();
    const hardcoded = getHardcodedQuestions();
    const hardcodedItem = hardcoded.find(q => q.word === word.english);

    if (hardcodedItem && index < hardcodedItem.englishSentences.length) {
      // 修改硬编码中的题目 - 采用覆盖策略
      if (!stored[word.english]) {
        stored[word.english] = {
          word: word.english,
          wordChinese: word.chinese,
          englishSentences: [],
          chineseSentences: []
        };
      }
      if (!stored[word.english]._overrides) {
        stored[word.english]._overrides = {};
      }
      stored[word.english]._overrides[index] = { english: newEn, chinese: newZh };
    } else {
      // 编辑的是localStorage中的题目
      if (!stored[word.english]) {
        stored[word.english] = {
          word: word.english,
          wordChinese: word.chinese,
          englishSentences: [],
          chineseSentences: []
        };
      }
      const hcCount = hardcodedItem ? hardcodedItem.englishSentences.length : 0;
      const localIndex = index - hcCount;
      if (localIndex >= 0) {
        stored[word.english].englishSentences[localIndex] = newEn;
        stored[word.english].chineseSentences[localIndex] = newZh;
      }
    }

    saveStoredQuestions(stored);
    this.editingIndex = -1;
    this.render();
    this.bindEvents();
  }

  handleAdd(genIndex) {
    const q = this.generatedQuestions[genIndex];
    if (!q) return;

    const word = this.currentWord;
    const stored = getStoredQuestions();
    if (!stored[word.english]) {
      stored[word.english] = {
        word: word.english,
        wordChinese: word.chinese,
        englishSentences: [],
        chineseSentences: []
      };
    }

    stored[word.english].englishSentences.push(q.english);
    stored[word.english].chineseSentences.push(q.chinese);
    saveStoredQuestions(stored);

    // 从生成列表中移除
    this.generatedQuestions.splice(genIndex, 1);
    this.render();
    this.bindEvents();
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

export function initAdminWordList() {
  const admin = new AdminWordList('admin-word-to-sentence-content');
  admin.init();
  return admin;
}

export function initAdminWordToSentence(wordEnglish) {
  const admin = new AdminWordToSentence('admin-word-to-sentence-content', wordEnglish);
  admin.init();
  return admin;
}
