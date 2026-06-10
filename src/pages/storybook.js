import { getAllStories, getStoryById } from '../data/storyData.js';
import audioPlayer from '../utils/audio.js';

const container = () => document.getElementById('storybook-page');

// 播放状态
const playState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  preloaded: false,
  currentIndex: -1,
  sentences: [],
  voicesLoaded: false,
};

// ========== 页面：故事列表 ==========

export function initStorybook() {
  stopPlayback();
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
               style="background:white;border-radius:1rem;padding:1.25rem 1.5rem;border:1px solid rgba(0,0,0,0.05);box-shadow:0 2px 15px -3px rgba(0,0,0,0.07),0 10px 20px -2px rgba(0,0,0,0.04);cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;gap:1.25rem;">
            <div style="width:52px;height:52px;border-radius:0.75rem;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fas fa-book-open" style="color:white;font-size:1.25rem;"></i>
            </div>
            <div style="flex:1;min-width:0;">
              <h3 style="font-size:1.1rem;font-weight:600;color:#1e293b;margin:0 0 0.25rem;">${story.titleEn}</h3>
              <p style="font-size:0.9rem;color:#64748b;margin:0 0 0.35rem;">${story.titleCn}</p>
              <span style="font-size:0.8rem;color:#94a3b8;background:#f1f5f9;padding:2px 10px;border-radius:9999px;">${story.sentences.length} 个句子</span>
            </div>
            <i class="fas fa-chevron-right" style="color:#94a3b8;font-size:0.9rem;flex-shrink:0;"></i>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.storybook-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 12px 28px -5px rgba(59,130,246,0.15),0 8px 16px -3px rgba(59,130,246,0.1)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 2px 15px -3px rgba(0,0,0,0.07),0 10px 20px -2px rgba(0,0,0,0.04)';
    });
    card.addEventListener('click', () => {
      router.navigate(`/storybook/${card.dataset.storyId}`);
    });
  });
}

// ========== 页面：故事详情 ==========

export function initStorybookDetail(storyId) {
  stopPlayback();
  const el = container();
  const story = getStoryById(storyId);

  if (!story) {
    el.innerHTML = `
      <div class="mode-content-linear" style="text-align:center;padding:3rem;">
        <i class="fas fa-exclamation-circle" style="font-size:2.5rem;color:#94a3b8;margin-bottom:1rem;"></i>
        <p style="color:#64748b;font-size:1.1rem;">未找到该故事</p>
        <button class="back-btn-linear" style="margin-top:1.5rem;" onclick="router.navigate('/storybook')">
          <i class="fas fa-arrow-left"></i> 返回故事列表
        </button>
      </div>
    `;
    return;
  }

  playState.sentences = story.sentences;

  el.innerHTML = `
    <style>
      .story-sentence .cn-text {
        max-height:0;opacity:0;overflow:hidden;
        transition:max-height 0.3s ease,opacity 0.3s ease,margin 0.3s ease;
      }
      .story-sentence.show-cn .cn-text {
        max-height:100px;opacity:1;margin-top:0.5rem;
      }
      .story-sentence.playing {
        border-color:#3b82f6 !important;
        box-shadow:0 0 0 2px rgba(59,130,246,0.15),0 4px 12px rgba(59,130,246,0.1) !important;
        background:linear-gradient(135deg,#eff6ff 0%,#f8faff 100%) !important;
      }
      .story-sentence.playing .s-num {
        background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%) !important;
        animation:pulse-num 1.5s infinite;
      }
      @keyframes pulse-num {
        0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0.4);}
        50%{box-shadow:0 0 0 6px rgba(59,130,246,0);}
      }
      .story-player {
        position:sticky;top:65px;z-index:50;
        background:white;border-radius:1rem;
        padding:1rem 1.25rem;margin-bottom:1rem;
        box-shadow:0 4px 20px rgba(59,130,246,0.12);
        border:1px solid rgba(59,130,246,0.1);
      }
      .story-player .prog-track {
        width:100%;height:6px;background:#e2e8f0;border-radius:3px;
        overflow:hidden;cursor:pointer;
      }
      .story-player .prog-fill {
        height:100%;background:linear-gradient(90deg,#3b82f6,#2563eb);
        border-radius:3px;transition:width 0.3s ease;
      }
      .story-player .cb {
        width:40px;height:40px;border-radius:50%;border:none;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;transition:all 0.2s ease;font-size:1rem;
      }
      .story-player .cb:hover{transform:scale(1.1);}
      .story-player .cb:active{transform:scale(0.95);}
      .story-player .cb.main {
        background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);
        color:white;width:48px;height:48px;font-size:1.2rem;
        box-shadow:0 3px 12px rgba(59,130,246,0.35);
      }
      .story-player .cb.sec {background:#f1f5f9;color:#475569;}
      .story-player .cb:disabled {opacity:0.4;cursor:not-allowed;transform:none !important;}
      .dark .story-player {background:#1e293b;border-color:rgba(59,130,246,0.2);}
      .dark .story-sentence.playing {background:linear-gradient(135deg,#1e3a5f 0%,#1e293b 100%) !important;}
      /* 播放按钮 loading spinner */
      .story-player .cb.main.loading {
        pointer-events:none;
        position:relative;
      }
      .story-player .cb.main.loading i {
        animation:spin 0.8s linear infinite;
      }
      @keyframes spin {
        from{transform:rotate(0deg);}
        to{transform:rotate(360deg);}
      }
      /* 单句播放按钮 loading */
      .s-play-btn.loading {
        pointer-events:none;
        opacity:0.8;
      }
      .s-play-btn.loading i {
        animation:spin 0.8s linear infinite;
      }
    </style>
    <div class="mode-content-linear">
      <div class="page-header-linear">
        <button class="back-btn-linear" onclick="router.navigate('/storybook')">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <h2 style="flex:1;font-size:1.25rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          <i class="fas fa-book-open" style="color:#3b82f6;margin-right:0.5rem;"></i>${story.titleEn}
        </h2>
      </div>

      <div style="margin:0.75rem 0 0.5rem;display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
        <span style="font-size:0.9rem;color:#64748b;">${story.titleCn}</span>
        <span style="font-size:0.8rem;color:#3b82f6;background:#eff6ff;padding:2px 10px;border-radius:9999px;font-weight:500;">${story.sentences.length} 个句子</span>
      </div>

      <!-- 播放器 -->
      <div class="story-player" id="sp">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
          <button class="cb sec" id="cb-prev" disabled title="上一句"><i class="fas fa-step-backward"></i></button>
          <button class="cb main" id="cb-play" title="播放"><i class="fas fa-play" id="play-icon"></i></button>
          <button class="cb sec" id="cb-next" disabled title="下一句"><i class="fas fa-step-forward"></i></button>
          <button class="cb sec" id="cb-stop" title="停止"><i class="fas fa-stop"></i></button>
          <div style="flex:1;text-align:right;">
            <span id="sp-status" style="font-size:0.85rem;color:#64748b;">点击播放按钮开始</span>
          </div>
        </div>
        <div class="prog-track" id="prog-track">
          <div class="prog-fill" id="prog-fill" style="width:0%;"></div>
        </div>
      </div>

      <!-- 句子列表 -->
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        ${story.sentences.map((s, i) => `
          <div class="story-sentence" data-idx="${i}" style="background:white;border-radius:0.75rem;padding:1rem 1.25rem;border:1px solid rgba(0,0,0,0.05);box-shadow:0 1px 3px rgba(0,0,0,0.04);transition:all 0.3s ease;">
            <div style="display:flex;align-items:flex-start;gap:0.75rem;">
              <span class="s-num" style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:white;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;transition:all 0.3s ease;">${i + 1}</span>
              <div style="flex:1;min-width:0;">
                <p style="font-size:1.05rem;font-weight:600;color:#1e293b;margin:0;line-height:1.6;">${s.en}</p>
                <div class="cn-text">
                  <p style="font-size:0.95rem;color:#64748b;margin:0;line-height:1.5;">${s.cn}</p>
                </div>
              </div>
              <button class="s-play-btn" data-idx="${i}" style="flex-shrink:0;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:white;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(59,130,246,0.25);">
                <i class="fas fa-volume-up" style="font-size:0.85rem;"></i>
              </button>
            </div>
            <div style="margin-top:0.5rem;padding-left:36px;">
              <button class="toggle-cn" style="background:none;border:none;color:#3b82f6;font-size:0.8rem;cursor:pointer;padding:0;font-weight:500;">
                <i class="fas fa-eye" style="margin-right:0.25rem;"></i>查看中文释义
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  bindDetailEvents(story);
}

function bindDetailEvents(story) {
  // 中文释义切换
  document.querySelectorAll('.toggle-cn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.story-sentence');
      const showing = card.classList.toggle('show-cn');
      btn.innerHTML = showing
        ? '<i class="fas fa-eye-slash" style="margin-right:0.25rem;"></i>隐藏中文释义'
        : '<i class="fas fa-eye" style="margin-right:0.25rem;"></i>查看中文释义';
    });
  });

  // 单句播放
  document.querySelectorAll('.s-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      playSingle(idx);
    });
  });

  // 播放器按钮
  document.getElementById('cb-play').addEventListener('click', () => {
    if (playState.isPaused) {
      doResume();
    } else if (playState.isPlaying) {
      doPause();
    } else {
      playAll();
    }
  });

  document.getElementById('cb-prev').addEventListener('click', doPrev);
  document.getElementById('cb-next').addEventListener('click', doNext);
  document.getElementById('cb-stop').addEventListener('click', stopPlayback);

  // 进度条点击跳转
  document.getElementById('prog-track').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const target = Math.floor(ratio * playState.sentences.length);
    const wasPlaying = playState.isPlaying;
    stopPlayback();
    playState.currentIndex = Math.max(0, Math.min(target, playState.sentences.length - 1));
    updateUI();
    if (wasPlaying) {
      playFromCurrent();
    }
  });
}

// ========== 播放控制（使用 audioPlayer 统一接口） ==========

function setMainBtnLoading(loading) {
  const btn = document.getElementById('cb-play');
  const icon = document.getElementById('play-icon');
  if (!btn || !icon) return;
  if (loading) {
    btn.classList.add('loading');
    icon.className = 'fas fa-spinner';
    playState.isLoading = true;
  } else {
    btn.classList.remove('loading');
    playState.isLoading = false;
    // 图标由 updateUI 设置
  }
}

function setSingleBtnLoading(idx, loading) {
  const btns = document.querySelectorAll('.s-play-btn');
  const btn = btns[idx];
  if (!btn) return;
  const icon = btn.querySelector('i');
  if (loading) {
    btn.classList.add('loading');
    if (icon) icon.className = 'fas fa-spinner';
  } else {
    btn.classList.remove('loading');
    if (icon) icon.className = 'fas fa-volume-up';
  }
}

async function playAll() {
  if (playState.isPlaying) return;

  if (playState.currentIndex < 0 || playState.currentIndex >= playState.sentences.length) {
    playState.currentIndex = 0;
  }

  playState.isPlaying = true;
  playState.isPaused = false;
  playState.preloaded = false;
  setMainBtnLoading(true);
  updateUI();

  // 先预加载所有句子语音
  const texts = playState.sentences.map(s => s.en);
  try {
    await audioPlayer.preloadSentences(texts, 0.7, (loaded, total) => {
      setStatus(`正在预加载语音 ${loaded}/${total}...`);
    });
  } catch (e) {
    console.warn('[Storybook] Preload error:', e.message);
  }

  // 预加载完成，开始流畅播放
  if (!playState.isPlaying) return; // 用户可能已停止
  playState.preloaded = true;
  audioPlayer.suppressLoading = true; // 播放期间不弹全局加载遮罩
  // 清除预加载阶段残留的全局遮罩
  window.dispatchEvent(new CustomEvent('audio-loading-end'));
  setMainBtnLoading(false); // 结束 spinner，切为暂停图标
  setStatus('预加载完成，开始播放...');
  playFromCurrent();
}

function playFromCurrent() {
  playNext();
}

async function playNext() {
  if (!playState.isPlaying || playState.isPaused) return;
  if (playState.currentIndex >= playState.sentences.length) {
    onPlayComplete();
    return;
  }

  const idx = playState.currentIndex;
  highlight(idx);
  updateUI();
  setStatus(`正在播放第 ${idx + 1} / ${playState.sentences.length} 句`);

  const text = playState.sentences[idx].en;

  try {
    await audioPlayer.speak(text, { speed: 0.7 });

    if (!playState.isPlaying) return;
    playState.currentIndex++;
    if (playState.currentIndex >= playState.sentences.length) {
      onPlayComplete();
    } else {
      setTimeout(playNext, 400);
    }
  } catch (e) {
    console.warn('[Storybook] playNext error:', e.message);
    if (!playState.isPlaying) return;
    playState.currentIndex++;
    setTimeout(playNext, 100);
  }
}

async function playSingle(idx) {
  stopPlayback();
  playState.currentIndex = idx;
  playState.isPlaying = true;
  highlight(idx);
  setSingleBtnLoading(idx, true);
  setMainBtnLoading(true);
  updateUI();
  setStatus(`正在加载第 ${idx + 1} 句语音...`);

  const text = playState.sentences[idx].en;

  try {
    await audioPlayer.speak(text, { speed: 0.7 });

    playState.isPlaying = false;
    setSingleBtnLoading(idx, false);
    setMainBtnLoading(false);
    unhighlightAll();
    updateUI();
    setStatus('点击播放按钮开始');
  } catch (e) {
    console.warn('[Storybook] playSingle error:', e.message);
    playState.isPlaying = false;
    setSingleBtnLoading(idx, false);
    setMainBtnLoading(false);
    unhighlightAll();
    updateUI();
    setStatus('播放失败，请重试');
  }
}

function doPause() {
  // Web Speech API 支持暂停
  if (window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
  playState.isPaused = true;
  updateUI();
  setStatus(`已暂停 - 第 ${playState.currentIndex + 1} 句`);
}

function doResume() {
  if (window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
  playState.isPaused = false;
  playState.isPlaying = true;
  updateUI();
  setStatus(`正在播放第 ${playState.currentIndex + 1} / ${playState.sentences.length} 句`);
}

function doPrev() {
  audioPlayer.stop();
  if (playState.currentIndex > 0) {
    playState.currentIndex--;
  }
  playState.isPaused = false;
  playState.isPlaying = true;
  updateUI();
  setTimeout(playNext, 50);
}

function doNext() {
  audioPlayer.stop();
  if (playState.currentIndex < playState.sentences.length - 1) {
    playState.currentIndex++;
  }
  playState.isPaused = false;
  playState.isPlaying = true;
  updateUI();
  setTimeout(playNext, 50);
}

function stopPlayback() {
  audioPlayer.stop();
  audioPlayer.suppressLoading = false;
  playState.isPlaying = false;
  playState.isPaused = false;
  playState.isLoading = false;
  playState.preloaded = false;
  playState.currentIndex = -1;
  unhighlightAll();
  setMainBtnLoading(false);
  // 清除所有单句按钮 loading
  document.querySelectorAll('.s-play-btn.loading').forEach(btn => {
    btn.classList.remove('loading');
    const icon = btn.querySelector('i');
    if (icon) icon.className = 'fas fa-volume-up';
  });
  updateUI();
  setStatus('点击播放按钮开始');
  const fill = document.getElementById('prog-fill');
  if (fill) fill.style.width = '0%';
}

function onPlayComplete() {
  audioPlayer.suppressLoading = false;
  playState.isPlaying = false;
  playState.isPaused = false;
  playState.isLoading = false;
  playState.preloaded = false;
  playState.currentIndex = -1;
  unhighlightAll();
  setMainBtnLoading(false);
  updateUI();
  setStatus('播放完成');
}

// ========== UI 更新 ==========

function highlight(idx) {
  unhighlightAll();
  const cards = document.querySelectorAll('.story-sentence');
  if (cards[idx]) {
    cards[idx].classList.add('playing');
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function unhighlightAll() {
  document.querySelectorAll('.story-sentence.playing').forEach(c => c.classList.remove('playing'));
}

function updateUI() {
  const total = playState.sentences.length;
  const cur = playState.currentIndex >= 0 ? playState.currentIndex + 1 : 0;

  // 进度条
  const fill = document.getElementById('prog-fill');
  if (fill) fill.style.width = total > 0 ? `${(cur / total) * 100}%` : '0%';

  // 播放/暂停图标（loading 中保持 spinner，否则按状态显示）
  const icon = document.getElementById('play-icon');
  if (icon && !playState.isLoading) {
    icon.className = playState.isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }

  // 上/下句按钮
  const prev = document.getElementById('cb-prev');
  const next = document.getElementById('cb-next');
  if (prev) prev.disabled = playState.currentIndex <= 0;
  if (next) next.disabled = playState.currentIndex >= total - 1;
}

function setStatus(text) {
  const el = document.getElementById('sp-status');
  if (el) el.textContent = text;
}
