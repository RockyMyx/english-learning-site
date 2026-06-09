import { getAllStories, getStoryById } from '../data/storyData.js';

const container = () => document.getElementById('storybook-page');

export function initStorybook() {
  const el = container();
  const stories = getAllStories();

  el.innerHTML = `
    <div class="mode-content-linear">
      <div class="page-header-linear">
        <button class="back-btn-linear" onclick="router.navigate('/')">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <h2 class="page-title-linear">
          <i class="fas fa-book-open"></i> 绘本故事
        </h2>
      </div>

      <p style="color: #64748b; margin: 1rem 0 1.5rem; font-size: 0.95rem;">
        选择一个绘本故事，开始沉浸式英语阅读吧！
      </p>

      <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
        ${stories.map(story => `
          <div class="storybook-card" data-story-id="${story.id}"
               style="
                 background: white;
                 border-radius: 1rem;
                 padding: 1.25rem 1.5rem;
                 border: 1px solid rgba(0,0,0,0.05);
                 box-shadow: 0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04);
                 cursor: pointer;
                 transition: all 0.3s ease;
                 display: flex;
                 align-items: center;
                 gap: 1.25rem;
               ">
            <div style="
              width: 52px; height: 52px;
              border-radius: 0.75rem;
              background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
            ">
              <i class="fas fa-book-open" style="color: white; font-size: 1.25rem;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
              <h3 style="
                font-size: 1.1rem; font-weight: 600;
                color: #1e293b; margin: 0 0 0.25rem;
              ">${story.titleEn}</h3>
              <p style="
                font-size: 0.9rem; color: #64748b; margin: 0 0 0.35rem;
              ">${story.titleCn}</p>
              <span style="
                font-size: 0.8rem; color: #94a3b8;
                background: #f1f5f9; padding: 2px 10px; border-radius: 9999px;
              ">${story.sentences.length} 个句子</span>
            </div>
            <i class="fas fa-chevron-right" style="color: #94a3b8; font-size: 0.9rem; flex-shrink: 0;"></i>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Dark mode styles for story cards
  document.querySelectorAll('.storybook-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 12px 28px -5px rgba(139, 92, 246, 0.15), 0 8px 16px -3px rgba(139, 92, 246, 0.1)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)';
    });

    card.addEventListener('click', () => {
      const storyId = card.dataset.storyId;
      router.navigate(`#/storybook/${storyId}`);
    });
  });
}

export function initStorybookDetail(storyId) {
  const el = container();
  const story = getStoryById(storyId);

  if (!story) {
    el.innerHTML = `
      <div class="mode-content-linear" style="text-align: center; padding: 3rem;">
        <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: #94a3b8; margin-bottom: 1rem;"></i>
        <p style="color: #64748b; font-size: 1.1rem;">未找到该故事</p>
        <button class="back-btn-linear" style="margin-top: 1.5rem;" onclick="router.navigate('#/storybook')">
          <i class="fas fa-arrow-left"></i> 返回故事列表
        </button>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <style>
      .storybook-sentence-card .cn-text {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
      }
      .storybook-sentence-card.show-cn .cn-text {
        max-height: 100px;
        opacity: 1;
        margin-top: 0.5rem;
      }
    </style>
    <div class="mode-content-linear">
      <div class="page-header-linear">
        <button class="back-btn-linear" onclick="router.navigate('#/storybook')">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <h2 style="flex: 1; font-size: 1.25rem; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <i class="fas fa-book-open" style="color: #8b5cf6; margin-right: 0.5rem;"></i>${story.titleEn}
        </h2>
      </div>

      <div style="margin-top: 0.75rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <span style="font-size: 0.9rem; color: #64748b;">${story.titleCn}</span>
        <span style="
          font-size: 0.8rem; color: #8b5cf6;
          background: #f5f3ff; padding: 2px 10px; border-radius: 9999px;
          font-weight: 500;
        ">${story.sentences.length} 个句子</span>
        <button id="play-all-btn" style="
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: white; border: none; border-radius: 9999px;
          padding: 6px 16px; font-size: 0.85rem; cursor: pointer;
          transition: all 0.3s ease; font-weight: 500;
        ">
          <i class="fas fa-play"></i> 依次播放全部
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${story.sentences.map((sentence, index) => `
          <div class="storybook-sentence-card" data-index="${index}" data-en="${encodeURIComponent(sentence.en)}"
               style="
                 background: white;
                 border-radius: 0.75rem;
                 padding: 1rem 1.25rem;
                 border: 1px solid rgba(0,0,0,0.05);
                 box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                 transition: all 0.2s ease;
               ">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
              <span style="
                flex-shrink: 0;
                width: 28px; height: 28px;
                border-radius: 50%;
                background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                color: white;
                display: flex; align-items: center; justify-content: center;
                font-size: 0.8rem; font-weight: 600;
              ">${index + 1}</span>
              <div style="flex: 1; min-width: 0;">
                <p style="
                  font-size: 1.05rem; font-weight: 600;
                  color: #1e293b; margin: 0;
                  line-height: 1.6;
                ">${sentence.en}</p>
                <div class="cn-text">
                  <p style="
                    font-size: 0.95rem; color: #64748b; margin: 0;
                    line-height: 1.5;
                  ">${sentence.cn}</p>
                </div>
              </div>
              <button class="sentence-play-btn" data-en="${encodeURIComponent(sentence.en)}"
                      style="
                        flex-shrink: 0;
                        width: 36px; height: 36px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                        color: white; border: none;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
                      ">
                <i class="fas fa-volume-up" style="font-size: 0.85rem;"></i>
              </button>
            </div>
            <div style="margin-top: 0.5rem; padding-left: 36px;">
              <button class="toggle-cn-btn" style="
                background: none; border: none;
                color: #8b5cf6; font-size: 0.8rem;
                cursor: pointer; padding: 0;
                font-weight: 500;
                transition: color 0.2s ease;
              ">
                <i class="fas fa-eye" style="margin-right: 0.25rem;"></i>查看中文释义
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind toggle Chinese translation events
  document.querySelectorAll('.toggle-cn-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.storybook-sentence-card');
      const isShowing = card.classList.toggle('show-cn');
      btn.innerHTML = isShowing
        ? '<i class="fas fa-eye-slash" style="margin-right: 0.25rem;"></i>隐藏中文释义'
        : '<i class="fas fa-eye" style="margin-right: 0.25rem;"></i>查看中文释义';
    });
  });

  // Bind play audio events for individual sentences
  document.querySelectorAll('.sentence-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = decodeURIComponent(btn.dataset.en);
      if (window.audioPlayer) {
        window.audioPlayer.speak(text);
      }
      // Visual feedback
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
    });
  });

  // Bind play all button
  const playAllBtn = document.getElementById('play-all-btn');
  if (playAllBtn) {
    playAllBtn.addEventListener('click', async () => {
      const originalHTML = playAllBtn.innerHTML;
      playAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 播放中...';
      playAllBtn.disabled = true;

      for (let i = 0; i < story.sentences.length; i++) {
        const card = document.querySelectorAll('.storybook-sentence-card')[i];
        if (card) {
          card.style.borderColor = '#8b5cf6';
          card.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.15)';
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (window.audioPlayer) {
          await window.audioPlayer.speak(story.sentences[i].en);
        }

        if (card) {
          card.style.borderColor = 'rgba(0,0,0,0.05)';
          card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        }
      }

      playAllBtn.innerHTML = originalHTML;
      playAllBtn.disabled = false;
    });
  }
}
