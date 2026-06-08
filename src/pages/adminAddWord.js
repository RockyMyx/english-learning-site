import { addCustomWord } from '../utils/vocabulary.js';
import { generateSentences } from '../utils/sentenceGenerator.js';
import { promptConfig } from '../utils/llmConfig.js';

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

export class AdminAddWord {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.wordEnglish = '';
    this.wordChinese = '';
    this.generatedQuestions = [];
    this.editingIndex = -1;
    this.isLoading = false;
    this.errorMessage = '';
    this.confirmed = false;
    this.codeSnippet = '';
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const hasGenerated = this.generatedQuestions.length > 0;

    this.container.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <div class="admin-word-info">
            <h2>新增单词</h2>
          </div>
          <div class="admin-actions">
            <button class="admin-btn back-btn" id="back-to-list">
              <i class="fas fa-arrow-left"></i> 返回列表
            </button>
          </div>
        </div>

        ${this.confirmed ? this.renderConfirmed() : `
        <div class="admin-section">
          <div class="add-word-form">
            <div class="form-row">
              <div class="form-field">
                <label>英文单词</label>
                <input type="text" id="new-word-en" placeholder="请输入英文单词" value="${this.escapeHtml(this.wordEnglish)}">
              </div>
              <div class="form-field">
                <label>中文释义</label>
                <input type="text" id="new-word-zh" placeholder="请输入中文释义" value="${this.escapeHtml(this.wordChinese)}">
              </div>
            </div>
            <div class="form-actions">
              <button class="admin-btn generate-btn" id="generate-btn" ${this.isLoading ? 'disabled' : ''}>
                <i class="fas fa-magic"></i> ${this.isLoading ? '出题中...' : '出题'}
              </button>
            </div>
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

        ${hasGenerated && !this.isLoading ? `
          <div class="admin-section">
            <div class="section-header-with-actions">
              <h3><i class="fas fa-magic"></i> 生成题目 (${this.generatedQuestions.length}题)</h3>
              <button class="admin-btn regenerate-btn" id="regenerate-btn">
                <i class="fas fa-redo"></i> 重新出题
              </button>
            </div>
            <div class="generated-questions">
              ${this.generatedQuestions.map((q, idx) => `
                <div class="question-item generated ${this.editingIndex === idx ? 'editing' : ''}" data-index="${idx}">
                  <div class="question-content">
                    ${this.editingIndex === idx ? `
                      <div class="edit-field">
                        <label>英文句子</label>
                        <textarea class="edit-en" rows="2">${this.escapeHtml(q.english)}</textarea>
                      </div>
                      <div class="edit-field">
                        <label>中文句子</label>
                        <textarea class="edit-zh" rows="2">${this.escapeHtml(q.chinese)}</textarea>
                      </div>
                    ` : `
                      <div class="question-en">${this.escapeHtml(q.english)}</div>
                      <div class="question-zh">${this.escapeHtml(q.chinese)}</div>
                    `}
                  </div>
                  <div class="question-actions">
                    ${this.editingIndex === idx ? `
                      <button class="admin-btn save-edit-btn" data-index="${idx}">
                        <i class="fas fa-save"></i> 保存
                      </button>
                      <button class="admin-btn cancel-edit-btn" data-index="${idx}">
                        <i class="fas fa-times"></i> 取消
                      </button>
                    ` : `
                      <button class="admin-btn edit-btn" data-index="${idx}">
                        <i class="fas fa-edit"></i> 编辑
                      </button>
                      <button class="admin-btn delete-btn" data-index="${idx}">
                        <i class="fas fa-trash"></i> 删除
                      </button>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="admin-section confirm-section">
            <button class="admin-btn confirm-btn" id="confirm-btn">
              <i class="fas fa-check"></i> 确认加入题库
            </button>
          </div>
        ` : ''}
        `}
      </div>
    `;
  }

  renderConfirmed() {
    return `
      <div class="admin-section">
        <div class="confirm-success">
          <div class="success-icon"><i class="fas fa-check-circle"></i></div>
          <h3>已加入题库！</h3>
          <p>单词「${this.escapeHtml(this.wordEnglish)}」及 ${this.generatedQuestions.length} 道题目已保存到 localStorage（即时生效）。</p>
          <p>为了永久保存，请将以下代码复制到 <code>src/pages/wordToSentenceMode.js</code> 的硬编码数组中：</p>
        </div>
        <div class="code-snippet-wrapper">
          <div class="code-snippet-header">
            <span>复制以下代码</span>
            <button class="admin-btn copy-code-btn" id="copy-code-btn">
              <i class="fas fa-copy"></i> 复制代码
            </button>
          </div>
          <pre class="code-snippet"><code>${this.escapeHtml(this.codeSnippet)}</code></pre>
        </div>
        <div class="confirm-actions">
          <button class="admin-btn" id="back-to-list2">
            <i class="fas fa-arrow-left"></i> 返回列表
          </button>
          <button class="admin-btn" id="add-another-btn">
            <i class="fas fa-plus"></i> 继续添加
          </button>
        </div>
      </div>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  bindEvents() {
    // 返回列表
    const backBtn = this.container.querySelector('#back-to-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.router.navigate('/admin/word-to-sentence');
      });
    }

    const backBtn2 = this.container.querySelector('#back-to-list2');
    if (backBtn2) {
      backBtn2.addEventListener('click', () => {
        window.router.navigate('/admin/word-to-sentence');
      });
    }

    // 继续添加
    const addAnotherBtn = this.container.querySelector('#add-another-btn');
    if (addAnotherBtn) {
      addAnotherBtn.addEventListener('click', () => {
        this.wordEnglish = '';
        this.wordChinese = '';
        this.generatedQuestions = [];
        this.editingIndex = -1;
        this.confirmed = false;
        this.codeSnippet = '';
        this.errorMessage = '';
        this.render();
        this.bindEvents();
      });
    }

    // 复制代码
    const copyBtn = this.container.querySelector('#copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.codeSnippet).then(() => {
          copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制代码';
          }, 2000);
        }).catch(() => {
          // fallback
          const textarea = document.createElement('textarea');
          textarea.value = this.codeSnippet;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制代码';
          }, 2000);
        });
      });
    }

    // 出题按钮
    const generateBtn = this.container.querySelector('#generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    // 重新出题
    const regenerateBtn = this.container.querySelector('#regenerate-btn');
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => this.handleGenerate());
    }

    // 编辑按钮
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.editingIndex = index;
        this.render();
        this.bindEvents();
      });
    });

    // 保存编辑
    this.container.querySelectorAll('.save-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleSaveEdit(index);
      });
    });

    // 取消编辑
    this.container.querySelectorAll('.cancel-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editingIndex = -1;
        this.render();
        this.bindEvents();
      });
    });

    // 删除题目
    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.generatedQuestions.splice(index, 1);
        this.editingIndex = -1;
        this.render();
        this.bindEvents();
      });
    });

    // 确认加入题库
    const confirmBtn = this.container.querySelector('#confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.handleConfirm());
    }
  }

  async handleGenerate() {
    const enInput = this.container.querySelector('#new-word-en');
    const zhInput = this.container.querySelector('#new-word-zh');
    const en = enInput?.value?.trim();
    const zh = zhInput?.value?.trim();

    if (!en || !zh) {
      alert('请输入英文单词和中文释义');
      return;
    }

    this.wordEnglish = en;
    this.wordChinese = zh;
    this.editingIndex = -1;
    this.errorMessage = '';
    this.isLoading = true;
    this.render();
    this.bindEvents();

    try {
      this.generatedQuestions = await generateSentences(en, zh, promptConfig.defaultCount);
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

  handleSaveEdit(index) {
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

    this.generatedQuestions[index].english = newEn;
    this.generatedQuestions[index].chinese = newZh;
    this.editingIndex = -1;
    this.render();
    this.bindEvents();
  }

  handleConfirm() {
    if (this.generatedQuestions.length === 0) {
      alert('请先生成题目');
      return;
    }

    // 1. 保存到 localStorage（即时生效）
    addCustomWord(this.wordEnglish, this.wordChinese, 'custom');
    const stored = getStoredQuestions();
    if (!stored[this.wordEnglish]) {
      stored[this.wordEnglish] = {
        word: this.wordEnglish,
        wordChinese: this.wordChinese,
        englishSentences: [],
        chineseSentences: []
      };
    }
    for (const q of this.generatedQuestions) {
      stored[this.wordEnglish].englishSentences.push(q.english);
      stored[this.wordEnglish].chineseSentences.push(q.chinese);
    }
    saveStoredQuestions(stored);

    // 2. 生成可粘贴到源码的代码片段
    const enArr = this.generatedQuestions.map(q => `'${q.english.replace(/'/g, "\\'")}'`);
    const zhArr = this.generatedQuestions.map(q => `'${q.chinese.replace(/'/g, "\\'")}'`);
    this.codeSnippet = `    { word: '${this.wordEnglish.replace(/'/g, "\\'")}', wordChinese: '${this.wordChinese.replace(/'/g, "\\'")}', englishSentences: [\n      ${enArr.join(',\n      ')}\n    ], chineseSentences: [\n      ${zhArr.join(',\n      ')}\n    ] },`;

    this.confirmed = true;
    this.render();
    this.bindEvents();
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

export function initAdminAddWord() {
  const admin = new AdminAddWord('admin-add-word-content');
  admin.init();
  return admin;
}
