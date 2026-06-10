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

// 播放会话 ID，用于解决 prev/next/stop 导致的竞态问题
let playbackId = 0;

// ========== 页面：故事列表 ==========

export function initStorybook() {
  stopPlayback();
  const el = container();
  const stories = getAllStories();

  el.innerHTML = `
    <div class="mode-content-linear">
      <div class="page-header-linear">
        <button class="back-btn-linear" id="story-list-back-btn">
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

  // 返回按钮
  document.getElementById('story-list-back-btn').addEventListener('click', () => {
    window.router.navigate('/');
  });

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
      window.router.navigate(`/storybook/${card.dataset.storyId}`);
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
        <button class="back-btn-linear" id="story-notfound-back-btn" style="margin-top:1.5rem;">
          <i class="fas fa-arrow-left"></i> 返回故事列表
        </button>
      </div>
    `;
    document.getElementById('story-notfound-back-btn').addEventListener('click', () => {
      window.router.navigate('/storybook');
    });
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
        -webkit-animation:spin 0.8s linear infinite;
        animation:spin 0.8s linear infinite;
      }
      @-webkit-keyframes spin {
        from{-webkit-transform:rotate(0deg);transform:rotate(0deg);}
        to{-webkit-transform:rotate(360deg);transform:rotate(360deg);}
      }
      @keyframes spin {
        from{-webkit-transform:rotate(0deg);transform:rotate(0deg);}
        to{-webkit-transform:rotate(360deg);transform:rotate(360deg);}
      }
    </style>
    <div class="mode-content-linear">
      <div class="page-header-linear">
        <button class="back-btn-linear" id="story-back-btn">
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
  // 返回按钮
  document.getElementById('story-back-btn').addEventListener('click', () => {
    stopPlayback();
    window.router.navigate('/storybook');
  });

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
    const wasPlaying = playState.isPlaying || playState.isPaused;
    const myId = ++playbackId;
    audioPlayer.stop();
    playState.isPaused = false;
    playState.isPlaying = wasPlaying;
    playState.currentIndex = Math.max(0, Math.min(target, playState.sentences.length - 1));
    updateUI();
    if (wasPlaying) {
      setTimeout(() => playNext(myId), 100);
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
    updateUI();
  }
}

// 暂停当前正在播放的音频（兼容 PC Web Speech + 移动端 HTML Audio）
function pauseCurrentAudio() {
  // HTML Audio（移动端 Azure TTS）
  if (audioPlayer.audio && !audioPlayer.audio.paused) {
    audioPlayer.audio.pause();
  }
  // Web Speech API（PC 端）
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

// 恢复当前暂停的音频
function resumeCurrentAudio() {
  // HTML Audio（移动端 Azure TTS）
  if (audioPlayer.audio && audioPlayer.audio.paused) {
    audioPlayer.audio.play().catch(() => {});
  }
  // Web Speech API（PC 端）
  if (window.speechSynthesis && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

async function playAll() {
  if (playState.isPlaying) return;

  if (playState.currentIndex < 0 || playState.currentIndex >= playState.sentences.length) {
    playState.currentIndex = 0;
  }

  const myId = ++playbackId;
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
  if (myId !== playbackId) return; // 用户已停止或操作了 prev/next
  playState.preloaded = true;
  audioPlayer.suppressLoading = true;
  window.dispatchEvent(new CustomEvent('audio-loading-end'));
  setMainBtnLoading(false);
  setStatus('预加载完成，开始播放...');
  playNext(myId);
}

function playNext(id) {
  if (id !== playbackId) return; // 已被新操作取代
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

  audioPlayer.speak(text, { speed: 0.7 }).then(() => {
    if (id !== playbackId) return; // 已被新操作取代
    if (!playState.isPlaying) return;

    playState.currentIndex++;
    if (playState.currentIndex >= playState.sentences.length) {
      onPlayComplete();
    } else {
      setTimeout(() => playNext(id), 400);
    }
  }).catch((e) => {
    // speak 被 stop() 中断时会 reject，检查是否被新操作取代
    if (id !== playbackId) return;
    console.warn('[Storybook] playNext error:', e.message);
    if (!playState.isPlaying) return;
    playState.currentIndex++;
    setTimeout(() => playNext(id), 100);
  });
}

function doPause() {
  pauseCurrentAudio();
  playState.isPaused = true;
  updateUI();
  setStatus(`已暂停 - 第 ${playState.currentIndex + 1} 句`);
}

function doResume() {
  playState.isPaused = false;
  playState.isPlaying = true;
  resumeCurrentAudio();
  updateUI();
  setStatus(`正在播放第 ${playState.currentIndex + 1} / ${playState.sentences.length} 句`);
}

function doPrev() {
  if (playState.currentIndex <= 0) return;
  const myId = ++playbackId; // 让旧的 playNext 自动退出
  audioPlayer.stop();
  playState.currentIndex--;
  playState.isPaused = false;
  playState.isPlaying = true;
  updateUI();
  // 同步调用以保持在用户手势上下文中（移动端需要）
  playNext(myId);
}

function doNext() {
  if (playState.currentIndex >= playState.sentences.length - 1) return;
  const myId = ++playbackId; // 让旧的 playNext 自动退出
  audioPlayer.stop();
  playState.currentIndex++;
  playState.isPaused = false;
  playState.isPlaying = true;
  updateUI();
  // 同步调用以保持在用户手势上下文中（移动端需要）
  playNext(myId);
}

function stopPlayback() {
  playbackId++; // 让所有 pending 的 playNext 自动退出
  audioPlayer.stop();
  audioPlayer.suppressLoading = false;
  playState.isPlaying = false;
  playState.isPaused = false;
  playState.isLoading = false;
  playState.preloaded = false;
  playState.currentIndex = -1;
  unhighlightAll();
  setMainBtnLoading(false);
  updateUI();
  setStatus('点击播放按钮开始');
  const fill = document.getElementById('prog-fill');
  if (fill) fill.style.width = '0%';
  // 滚动到页面顶部，确保第一句可见
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function onPlayComplete() {
  playbackId++;
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

// 将指定卡片滚动到可视区域（避开固定导航栏和 sticky 播放器）
function scrollCardToVisible(card) {
  if (!card) return;
  const player = document.getElementById('sp');
  const playerH = player ? player.offsetHeight : 0;
  const navH = 60; // 固定导航栏高度
  const totalOffset = navH + playerH + 8; // 总遮挡高度 + 间距
  const cardRect = card.getBoundingClientRect();
  // 卡片顶部在可见区域内，不需要滚动
  if (cardRect.top >= totalOffset && cardRect.bottom <= window.innerHeight - 4) return;
  // 计算目标滚动位置：让卡片顶部刚好在导航栏+播放器下方
  const targetScrollTop = cardRect.top + window.scrollY - totalOffset;
  window.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
}

function highlight(idx) {
  unhighlightAll();
  const cards = document.querySelectorAll('.story-sentence');
  if (cards[idx]) {
    cards[idx].classList.add('playing');
    scrollCardToVisible(cards[idx]);
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

  // 播放/暂停图标：暂停中显示播放图标（点击恢复），播放中显示暂停图标（点击暂停）
  const icon = document.getElementById('play-icon');
  if (icon && !playState.isLoading) {
    const effectivePlaying = playState.isPlaying && !playState.isPaused;
    icon.className = effectivePlaying ? 'fas fa-pause' : 'fas fa-play';
  }

  // 上/下句按钮：未播放时都禁用，第一句时禁用上一句，最后一句时禁用下一句
  const prev = document.getElementById('cb-prev');
  const next = document.getElementById('cb-next');
  const noActivePlayback = !playState.isPlaying && !playState.isPaused;
  if (prev) prev.disabled = noActivePlayback || playState.currentIndex <= 0;
  if (next) next.disabled = noActivePlayback || playState.currentIndex >= total - 1;
}

function setStatus(text) {
  const el = document.getElementById('sp-status');
  if (el) el.textContent = text;
}
