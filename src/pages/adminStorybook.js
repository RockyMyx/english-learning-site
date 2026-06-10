// ============================================================
// 绘本故事管理页面
// ============================================================

import { getAllStories } from '../data/storyData.js';
import { generateStory } from '../utils/storyGenerator.js';

export function initAdminStorybook() {
  const container = document.getElementById('admin-storybook-page');

  let generatedStory = null;
  let isGenerating = false;
  let isEditing = false;
  let errorMessage = '';
  let codeSnippet = '';
  let showCode = false;
  let expandedStoryId = null;

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function render() {
    const allStories = getAllStories();

    container.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <div class="admin-word-info">
            <h2><i class="fas fa-book-open"></i> 绘本故事管理</h2>
          </div>
          <div class="admin-actions">
            <button class="admin-btn back-btn" id="storybook-back-btn">
              <i class="fas fa-arrow-left"></i> 返回后台
            </button>
          </div>
        </div>

        ${errorMessage ? `
          <div class="admin-section">
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> ${escapeHtml(errorMessage)}
            </div>
          </div>
        ` : ''}

        <div class="admin-section">
          <h3><i class="fas fa-wand-magic-sparkles"></i> 生成新故事</h3>
          <div class="dialogue-controls">
            <div class="control-row">
              <div class="control-group" style="flex: 1;">
                <label class="control-label">句子数量</label>
                <input type="number" id="story-sentence-count" class="focus-words-input"
                  value="12" min="4" max="30" style="text-align: center; width: 120px;">
              </div>
              <div class="control-group" style="flex: 1;">
                <span class="text-sm text-slate-400" style="line-height: 2.5;">
                  <i class="fas fa-info-circle"></i> 系统将根据已学词汇和句型自动生成故事
                </span>
              </div>
              <div class="control-group control-action">
                <button class="admin-btn generate-btn" id="generate-story-btn" ${isGenerating ? 'disabled' : ''}>
                  <i class="fas fa-magic"></i> ${isGenerating ? '生成中...' : '生成故事'}
                </button>
              </div>
            </div>
          </div>
        </div>

        ${isGenerating ? `
          <div class="admin-section">
            <div class="loading-indicator">
              <div class="loading-spinner"></div>
              <span>AI正在生成故事，请稍候...</span>
            </div>
          </div>
        ` : ''}

        ${generatedStory && !isGenerating ? `
          <div class="admin-section">
            <div class="section-header-with-actions">
              <h3><i class="fas fa-eye"></i> 故事预览</h3>
              <div style="display: flex; gap: 0.5rem;">
                <button class="admin-btn" id="toggle-edit-btn">
                  <i class="fas fa-${isEditing ? 'eye' : 'edit'}"></i> ${isEditing ? '预览模式' : '编辑/调整'}
                </button>
                <button class="admin-btn generate-btn" id="gen-code-btn">
                  <i class="fas fa-code"></i> 生成代码
                </button>
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary, #e2e8f0);">
                ${escapeHtml(generatedStory.titleEn)}
              </div>
              <div style="color: var(--text-secondary, #94a3b8); font-size: 0.9rem;">
                ${escapeHtml(generatedStory.titleCn)}
              </div>
              <div style="color: var(--text-muted, #64748b); font-size: 0.8rem; margin-top: 0.25rem;">
                共 ${generatedStory.sentences.length} 句
              </div>
            </div>

            ${isEditing ? `
              <div class="edit-field" style="margin-bottom: 0.5rem;">
                <label style="font-weight: 600; margin-bottom: 0.25rem; display: block;">英文标题</label>
                <input type="text" id="edit-title-en" class="focus-words-input" value="${escapeHtml(generatedStory.titleEn)}">
              </div>
              <div class="edit-field" style="margin-bottom: 0.5rem;">
                <label style="font-weight: 600; margin-bottom: 0.25rem; display: block;">中文标题</label>
                <input type="text" id="edit-title-cn" class="focus-words-input" value="${escapeHtml(generatedStory.titleCn)}">
              </div>
              <label style="font-weight: 600; margin-bottom: 0.25rem; display: block;">句子内容 (JSON)</label>
              <textarea id="story-edit-area" class="edit-question"
                style="width: 100%; min-height: 300px; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85rem; line-height: 1.5; resize: vertical;">${escapeHtml(JSON.stringify(generatedStory.sentences, null, 2))}</textarea>
              <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                <button class="admin-btn save-edit-btn" id="save-edit-btn">
                  <i class="fas fa-save"></i> 保存修改
                </button>
                <button class="admin-btn cancel-edit-btn" id="cancel-edit-btn">
                  <i class="fas fa-times"></i> 取消
                </button>
              </div>
            ` : `
              <div class="generated-questions">
                ${generatedStory.sentences.map((s, i) => `
                  <div class="question-item generated" style="padding: 0.5rem 0.75rem;">
                    <div class="question-number">${i + 1}</div>
                    <div class="question-content">
                      <div class="question-en">${escapeHtml(s.en)}</div>
                      <div style="color: var(--text-secondary, #94a3b8); font-size: 0.85rem; margin-top: 0.15rem;">${escapeHtml(s.cn)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : ''}

        ${showCode ? `
          <div class="admin-section">
            <div class="code-snippet-wrapper">
              <div class="code-snippet-header">
                <span>复制以下代码添加到 storyData.js</span>
                <button class="admin-btn copy-code-btn" id="copy-story-code-btn">
                  <i class="fas fa-copy"></i> 复制代码
                </button>
              </div>
              <pre class="code-snippet"><code>${escapeHtml(codeSnippet)}</code></pre>
            </div>
          </div>
        ` : ''}

        <div class="admin-section">
          <h3><i class="fas fa-list"></i> 已有故事 (${allStories.length})</h3>
          <div class="generated-questions">
            ${allStories.map(story => `
              <div class="question-item generated" style="cursor: pointer;" data-story-id="${story.id}">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--text-primary, #e2e8f0);">
                    ${escapeHtml(story.titleEn)}
                    <span style="color: var(--text-secondary, #94a3b8); font-weight: 400; margin-left: 0.5rem;">
                      ${escapeHtml(story.titleCn)}
                    </span>
                  </div>
                  <div style="color: var(--text-muted, #64748b); font-size: 0.8rem; margin-top: 0.15rem;">
                    ${story.sentences.length} 句 · id: ${escapeHtml(story.id)}
                  </div>
                </div>
                <div style="color: var(--text-muted, #64748b);">
                  <i class="fas fa-chevron-${expandedStoryId === story.id ? 'up' : 'down'}"></i>
                </div>
              </div>
              ${expandedStoryId === story.id ? `
                <div style="padding: 0.5rem 0.75rem 1rem; border-left: 3px solid var(--accent, #3b82f6); margin: 0 0 0.5rem 1.5rem; background: var(--card-bg, rgba(30,41,59,0.5)); border-radius: 0 8px 8px 0;">
                  ${story.sentences.map((s, i) => `
                    <div style="padding: 0.3rem 0; ${i > 0 ? 'border-top: 1px solid rgba(100,116,139,0.15);' : ''}">
                      <span style="color: var(--text-muted, #64748b); font-size: 0.75rem; width: 24px; display: inline-block;">${i + 1}.</span>
                      <span style="color: var(--text-primary, #e2e8f0);">${escapeHtml(s.en)}</span>
                      <br>
                      <span style="color: var(--text-secondary, #94a3b8); font-size: 0.85rem; margin-left: 24px;">${escapeHtml(s.cn)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            `).join('')}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Back button
    const backBtn = container.querySelector('#storybook-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => window.router.navigate('/admin'));
    }

    // Generate story
    const genBtn = container.querySelector('#generate-story-btn');
    if (genBtn) {
      genBtn.addEventListener('click', handleGenerate);
    }

    // Toggle edit
    const toggleEditBtn = container.querySelector('#toggle-edit-btn');
    if (toggleEditBtn) {
      toggleEditBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        render();
      });
    }

    // Save edit
    const saveEditBtn = container.querySelector('#save-edit-btn');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', handleSaveEdit);
    }

    // Cancel edit
    const cancelEditBtn = container.querySelector('#cancel-edit-btn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        isEditing = false;
        render();
      });
    }

    // Generate code
    const genCodeBtn = container.querySelector('#gen-code-btn');
    if (genCodeBtn) {
      genCodeBtn.addEventListener('click', handleGenerateCode);
    }

    // Copy code
    const copyBtn = container.querySelector('#copy-story-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeSnippet).then(() => {
          copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
          setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制代码'; }, 2000);
        }).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = codeSnippet;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
          setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制代码'; }, 2000);
        });
      });
    }

    // Expand/collapse existing stories
    container.querySelectorAll('[data-story-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.storyId;
        expandedStoryId = expandedStoryId === id ? null : id;
        render();
      });
    });
  }

  async function handleGenerate() {
    const countInput = container.querySelector('#story-sentence-count');
    const sentenceCount = parseInt(countInput?.value) || 12;

    errorMessage = '';
    isGenerating = true;
    generatedStory = null;
    showCode = false;
    isEditing = false;
    render();

    try {
      generatedStory = await generateStory(sentenceCount);
    } catch (error) {
      errorMessage = `生成失败：${error.message}`;
      generatedStory = null;
    } finally {
      isGenerating = false;
      render();
    }
  }

  function handleSaveEdit() {
    const titleEnInput = container.querySelector('#edit-title-en');
    const titleCnInput = container.querySelector('#edit-title-cn');
    const editArea = container.querySelector('#story-edit-area');

    const newTitleEn = titleEnInput?.value?.trim();
    const newTitleCn = titleCnInput?.value?.trim();
    const sentencesText = editArea?.value?.trim();

    if (!newTitleEn || !newTitleCn) {
      alert('标题不能为空');
      return;
    }

    try {
      const parsed = JSON.parse(sentencesText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('sentences 必须是非空数组');
      }
      parsed.forEach((s, i) => {
        if (!s.en || !s.cn) {
          throw new Error(`第 ${i + 1} 句缺少 en 或 cn 字段`);
        }
      });
      generatedStory.titleEn = newTitleEn;
      generatedStory.titleCn = newTitleCn;
      generatedStory.sentences = parsed.map(s => ({ en: s.en, cn: s.cn }));
      isEditing = false;
      showCode = false;
      render();
    } catch (e) {
      alert(`JSON格式错误：${e.message}`);
    }
  }

  function handleGenerateCode() {
    if (!generatedStory) return;

    const id = slugify(generatedStory.titleEn);
    const sentenceLines = generatedStory.sentences.map(s =>
      `    { en: '${s.en.replace(/'/g, "\\'")}', cn: '${s.cn.replace(/'/g, "\\'")}' }`
    ).join(',\n');

    codeSnippet = `{
  id: '${id}',
  titleEn: '${generatedStory.titleEn.replace(/'/g, "\\'")}',
  titleCn: '${generatedStory.titleCn.replace(/'/g, "\\'")}',
  sentences: [
${sentenceLines}
  ]
}`;
    showCode = true;
    render();
  }

  render();
}
