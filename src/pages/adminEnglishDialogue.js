import { generateDialogueQuestions } from '../utils/sentenceGenerator.js';
import { dialoguePromptConfig } from '../utils/llmConfig.js';

export class AdminEnglishDialogue {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.generatedQuestions = [];
    this.editingIndex = -1;
    this.isLoading = false;
    this.errorMessage = '';
    this.confirmed = false;
    this.codeSnippet = '';
    this.difficulty = 'easy';
    this.focusWords = ''; // 可选的聚焦单词
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
            <h2>英文对话出题</h2>
          </div>
          <div class="admin-actions">
            <button class="admin-btn back-btn" id="back-to-dashboard">
              <i class="fas fa-arrow-left"></i> 返回后台
            </button>
          </div>
        </div>

        ${this.confirmed ? this.renderConfirmed() : `
        <div class="admin-section">
          <div class="dialogue-controls">
            <div class="control-row">
              <div class="control-group">
                <label class="control-label">难度</label>
                <div class="difficulty-options">
                  ${['easy', 'medium', 'hard'].map(d => {
                    const cfg = dialoguePromptConfig.difficultyLevels[d];
                    const isActive = this.difficulty === d;
                    return `<button class="difficulty-btn difficulty-${d} ${isActive ? 'active' : ''}" data-difficulty="${d}">${cfg.label}</button>`;
                  }).join('')}
                </div>
              </div>
              <div class="control-group control-action">
                <button class="admin-btn generate-btn" id="generate-btn" ${this.isLoading ? 'disabled' : ''}>
                  <i class="fas fa-magic"></i> ${this.isLoading ? '出题中...' : '出题'}
                </button>
              </div>
            </div>
            <div class="control-row" style="margin-top: 0.5rem;">
              <div class="control-group" style="flex: 1;">
                <label class="control-label">聚焦单词 <span class="control-hint">（可选，空格/逗号/顿号分隔，留空则自由出题）</span></label>
                <input type="text" class="focus-words-input" id="focus-words" placeholder="如：cat red big 或 cat,red,big" value="${this.escapeHtml(this.focusWords)}">
              </div>
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
              <span>AI正在生成【${dialoguePromptConfig.difficultyLevels[this.difficulty].label}】对话题目，请稍候...</span>
            </div>
          </div>
        ` : ''}

        ${hasGenerated && !this.isLoading ? `
          <div class="admin-section">
            <div class="section-header-with-actions">
              <h3><i class="fas fa-list-check"></i> 生成题目 (${this.generatedQuestions.length}题)</h3>
              <button class="admin-btn regenerate-btn" id="regenerate-btn">
                <i class="fas fa-redo"></i> 重新出题
              </button>
            </div>
            <div class="generated-questions">
              ${this.generatedQuestions.map((q, idx) => this.renderQuestionItem(q, idx)).join('')}
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

  renderQuestionItem(q, idx) {
    const isEditing = this.editingIndex === idx;

    if (isEditing) {
      return `
        <div class="question-item generated editing" data-index="${idx}">
          <div class="question-number">${idx + 1}</div>
          <div class="question-content">
            <div class="edit-field">
              <label>题目</label>
              <textarea class="edit-question" rows="2">${this.escapeHtml(q.question)}</textarea>
            </div>
            ${q.options.map((opt, oi) => `
              <div class="edit-field edit-option-row">
                <input type="radio" name="correct-${idx}" class="correct-radio" data-option-index="${oi}" ${opt === q.correctAnswer ? 'checked' : ''}>
                <label class="option-letter">${String.fromCharCode(65 + oi)}</label>
                <input type="text" class="edit-option" data-option-index="${oi}" value="${this.escapeHtml(opt)}">
              </div>
            `).join('')}
            <p class="edit-hint">点击左侧圆圈切换正确答案</p>
          </div>
          <div class="question-actions">
            <button class="admin-btn save-edit-btn" data-index="${idx}">
              <i class="fas fa-save"></i> 保存
            </button>
            <button class="admin-btn cancel-edit-btn" data-index="${idx}">
              <i class="fas fa-times"></i> 取消
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="question-item generated" data-index="${idx}">
        <div class="question-number">${idx + 1}</div>
        <div class="question-content">
          <div class="question-en">${this.escapeHtml(q.question)}</div>
          <div class="question-options">
            ${q.options.map((opt, oi) => `
              <span class="dialogue-option ${opt === q.correctAnswer ? 'correct-option' : ''}">${String.fromCharCode(65 + oi)}. ${this.escapeHtml(opt)}</span>
            `).join('')}
          </div>
        </div>
        <div class="question-actions">
          <button class="admin-btn edit-btn" data-index="${idx}">
            <i class="fas fa-edit"></i> 编辑
          </button>
          <button class="admin-btn delete-btn" data-index="${idx}">
            <i class="fas fa-trash"></i> 删除
          </button>
        </div>
      </div>
    `;
  }

  renderConfirmed() {
    return `
      <div class="admin-section">
        <div class="confirm-success">
          <div class="success-icon"><i class="fas fa-check-circle"></i></div>
          <h3>已加入题库！</h3>
          <p>已保存 ${this.generatedQuestions.length} 道【${dialoguePromptConfig.difficultyLevels[this.difficulty].label}】对话题目到 localStorage（即时生效）。</p>
          <p>为了永久保存，请将以下代码复制到 <code>src/pages/quizMode.js</code> 的 <code>dialogueQuestions.${this.difficulty}</code> 数组末尾：</p>
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
          <button class="admin-btn" id="back-to-dashboard2">
            <i class="fas fa-arrow-left"></i> 返回后台
          </button>
          <button class="admin-btn" id="add-another-btn">
            <i class="fas fa-plus"></i> 继续出题
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
    // 返回后台
    const backBtn = this.container.querySelector('#back-to-dashboard');
    if (backBtn) backBtn.addEventListener('click', () => window.router.navigate('/admin'));
    const backBtn2 = this.container.querySelector('#back-to-dashboard2');
    if (backBtn2) backBtn2.addEventListener('click', () => window.router.navigate('/admin'));

    // 继续出题
    const addAnotherBtn = this.container.querySelector('#add-another-btn');
    if (addAnotherBtn) {
      addAnotherBtn.addEventListener('click', () => {
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
          setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制代码'; }, 2000);
        }).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = this.codeSnippet;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
          setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制代码'; }, 2000);
        });
      });
    }

    // 读取聚焦单词（每次点击时读取）
    const getFocusWords = () => {
      const input = this.container.querySelector('#focus-words');
      if (input) this.focusWords = input.value.trim();
    };

    // 出题
    const generateBtn = this.container.querySelector('#generate-btn');
    if (generateBtn) generateBtn.addEventListener('click', () => { getFocusWords(); this.handleGenerate(); });
    const regenerateBtn = this.container.querySelector('#regenerate-btn');
    if (regenerateBtn) regenerateBtn.addEventListener('click', () => { getFocusWords(); this.handleGenerate(); });

    // 难度选择
    this.container.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        getFocusWords(); // 保存当前输入的单词
        this.difficulty = e.currentTarget.dataset.difficulty;
        this.render();
        this.bindEvents();
      });
    });

    // 编辑
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.editingIndex = parseInt(e.currentTarget.dataset.index);
        this.render();
        this.bindEvents();
      });
    });

    // 保存编辑
    this.container.querySelectorAll('.save-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSaveEdit(parseInt(e.currentTarget.dataset.index)));
    });

    // 取消编辑
    this.container.querySelectorAll('.cancel-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.editingIndex = -1;
        this.render();
        this.bindEvents();
      });
    });

    // 删除
    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.generatedQuestions.splice(parseInt(e.currentTarget.dataset.index), 1);
        this.editingIndex = -1;
        this.render();
        this.bindEvents();
      });
    });

    // 确认
    const confirmBtn = this.container.querySelector('#confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', () => this.handleConfirm());
  }

  async handleGenerate() {
    this.editingIndex = -1;
    this.errorMessage = '';
    this.isLoading = true;
    this.render();
    this.bindEvents();

    try {
      this.generatedQuestions = await generateDialogueQuestions(this.difficulty, dialoguePromptConfig.defaultCount, this.focusWords);
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

    const questionInput = item.querySelector('.edit-question');
    const optionInputs = item.querySelectorAll('.edit-option');
    const correctRadio = item.querySelector('.correct-radio:checked');

    const newQuestion = questionInput?.value?.trim();
    if (!newQuestion) { alert('题目不能为空'); return; }

    const newOptions = [];
    let hasEmpty = false;
    optionInputs.forEach(input => {
      const val = input.value.trim();
      if (!val) hasEmpty = true;
      newOptions.push(val);
    });
    if (hasEmpty) { alert('选项不能为空'); return; }

    // 正确答案由radio决定
    const correctIdx = correctRadio ? parseInt(correctRadio.dataset.optionIndex) : 0;
    const newCorrect = newOptions[correctIdx];

    this.generatedQuestions[index] = {
      question: newQuestion,
      correctAnswer: newCorrect,
      options: newOptions,
    };

    this.editingIndex = -1;
    this.render();
    this.bindEvents();
  }

  handleConfirm() {
    if (this.generatedQuestions.length === 0) {
      alert('请先生成题目');
      return;
    }

    // 1. 保存到 localStorage
    const key = 'adminDialogueQuestions';
    let stored = [];
    try {
      const data = localStorage.getItem(key);
      stored = data ? JSON.parse(data) : [];
    } catch (e) { stored = []; }

    stored.push(...this.generatedQuestions);
    localStorage.setItem(key, JSON.stringify(stored));

    // 2. 生成代码片段
    const lines = this.generatedQuestions.map(q => {
      const opts = q.options.map(o => `'${o.replace(/'/g, "\\'")}'`).join(', ');
      return `        { question: '${q.question.replace(/'/g, "\\'")}', correctAnswer: '${q.correctAnswer.replace(/'/g, "\\'")}', options: [${opts}] }`;
    });
    this.codeSnippet = lines.join(',\n');

    this.confirmed = true;
    this.render();
    this.bindEvents();
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

export function initAdminEnglishDialogue() {
  const page = new AdminEnglishDialogue('admin-english-dialogue-content');
  page.init();
  return page;
}
