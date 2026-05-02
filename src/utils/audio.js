class AudioPlayer {
  constructor() {
    this.audio = null;
    this.isSpeaking = false;
    this.speakQueue = [];
    this.isProcessingQueue = false;

    // Kokoro TTS 配置（自建服务）
    this.kokoroApiUrl = import.meta.env.VITE_KOKORO_API_URL || '';
    this.kokoroApiKey = import.meta.env.VITE_KOKORO_API_KEY || '';

    // 检测设备类型
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Web Speech API
    this.webSpeechVoices = [];
    this.loadWebSpeechVoices();

    // IndexedDB 缓存（仅 Kokoro 使用）
    this.dbName = 'AudioCache';
    this.storeName = 'audioCache';
    this.db = null;
    this.initDB();
  }

  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  getCacheKey(text, speed) {
    return `kokoro:${speed}:${text}`;
  }

  async getFromCache(key) {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveToCache(key, blob) {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, blob, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  triggerLoadingStart() {
    window.dispatchEvent(new CustomEvent('audio-loading-start'));
  }

  triggerLoadingEnd() {
    window.dispatchEvent(new CustomEvent('audio-loading-end'));
  }

  loadWebSpeechVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      this.webSpeechVoices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  getEnglishVoice() {
    const englishVoices = this.webSpeechVoices.filter(v => v.lang && v.lang.startsWith('en'));
    const preferred = englishVoices.find(v =>
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
    );
    return preferred || englishVoices.find(v => v.lang === 'en-US') || englishVoices[0] || null;
  }

  isSingleWord(text) {
    if (!text) return false;
    const cleaned = text.trim().replace(/[.,!?;:'"()\[\]{}]/g, '');
    const words = cleaned.split(/\s+/);
    return words.length === 1;
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/【[^】]*】/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[""''']/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\s+\,/g, ',')
      .replace(/\s+\?/g, '?')
      .replace(/\s+\!/g, '!')
      .replace(/[,\.\?!]$/, '')
      .trim();
  }

  // 有道发音（单词）
  speakYoudao(text) {
    return new Promise((resolve, reject) => {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }

      const useProxy = window.location.protocol === 'https:';
      const encodedText = encodeURIComponent(text);
      const audioUrl = useProxy
        ? `/api/youdao?text=${encodedText}`
        : `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=2`;

      this.audio = new Audio();
      this.audio.volume = 1.0;
      this.audio.preload = 'auto';

      let playAttempted = false;

      this.audio.oncanplaythrough = () => {
        if (!playAttempted) {
          playAttempted = true;
          this.audio.play().catch(err => {
            console.warn('[AudioPlayer] Youdao play failed:', err.message);
            reject(err);
          });
        }
      };

      this.audio.onended = () => resolve();
      this.audio.onerror = () => reject(new Error('有道发音加载失败'));

      this.audio.src = audioUrl;

      if (this.isMobile) {
        this.audio.play().then(() => {
          playAttempted = true;
        }).catch(() => {});
      }

      this.audio.load();
    });
  }

  // Kokoro TTS（句子）
  async speakKokoro(text, speed = 1.0) {
    const cacheKey = this.getCacheKey(text, speed);

    // 尝试从缓存读取
    try {
      const cachedBlob = await this.getFromCache(cacheKey);
      if (cachedBlob) {
        return cachedBlob;
      }
    } catch (e) {
      console.warn('[AudioPlayer] Cache read error:', e.message);
    }

    this.triggerLoadingStart();

    try {
      // 优先使用 Vercel 代理（解决 HTTPS → HTTP 的 Mixed Content 问题）
      const useProxy = window.location.protocol === 'https:';
      const apiUrl = useProxy ? '/api/tts' : this.kokoroApiUrl;

      if (!apiUrl) {
        throw new Error('Kokoro API URL not configured');
      }

      const headers = { 'Content-Type': 'application/json' };
      if (!useProxy && this.kokoroApiKey) {
        headers['Authorization'] = `Bearer ${this.kokoroApiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'kokoro',
          input: text,
          voice: 'af_bella',
          response_format: 'mp3',
          speed: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Kokoro API error: ${response.status}`);
      }

      const blob = await response.blob();

      // 保存到缓存
      try {
        await this.saveToCache(cacheKey, blob);
      } catch (e) {
        console.warn('[AudioPlayer] Cache save error:', e.message);
      }

      return blob;
    } finally {
      this.triggerLoadingEnd();
    }
  }

  // Web Speech API
  async callWebSpeechAPI(text, speed = 1.0) {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getEnglishVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = Math.max(0.1, Math.min(2.0, speed));
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve();
          return;
        }
        reject(new Error(`Web Speech error: ${e.error}`));
      };

      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    });
  }

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!text) {
        reject(new Error('文本为空'));
        return;
      }

      this.stop();
      const cleaned = this.cleanText(text);
      if (!cleaned) {
        reject(new Error('清理后的文本为空'));
        return;
      }

      this.speakQueue.push({
        text: cleaned,
        options: { speed: options.speed || 1.0 },
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  speakWord(word, options = {}) {
    return this.speak(word, options);
  }

  async processQueue() {
    if (this.isProcessingQueue || this.speakQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.speakQueue.length > 0) {
      const current = this.speakQueue.shift();

      try {
        await this.playItem(current.text, current.options);
        current.resolve();
      } catch (error) {
        current.reject(error);
      }

      await new Promise(r => setTimeout(r, 50));
    }

    this.isProcessingQueue = false;
  }

  async playItem(text, options) {
    // PC 端：全部使用 Web Speech
    if (!this.isMobile) {
      await this.callWebSpeechAPI(text, options.speed || 1.0);
      return;
    }

    // 手机端
    if (this.isSingleWord(text)) {
      // 单词：使用有道
      await this.speakYoudao(text);
      return;
    }

    // 句子：使用 Kokoro
    const useProxy = window.location.protocol === 'https:';
    if (useProxy || this.kokoroApiUrl) {
      try {
        const blob = await this.speakKokoro(text, options.speed || 1.0);
        await this.playBlob(blob);
        return;
      } catch (e) {
        console.warn('[AudioPlayer] Kokoro failed:', e.message);
      }
    }

    // 回退到 Web Speech
    await this.callWebSpeechAPI(text, options.speed || 1.0);
  }

  playBlob(blob) {
    return new Promise((resolve, reject) => {
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
        this.audio = null;
      }

      const url = URL.createObjectURL(blob);
      this.audio = new Audio();
      this.audio.src = url;
      this.audio.volume = 1.0;
      this.isSpeaking = true;

      const timeout = setTimeout(() => {
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback timeout'));
      }, 15000);

      this.audio.onloadeddata = () => clearTimeout(timeout);
      this.audio.onended = () => {
        clearTimeout(timeout);
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        resolve();
      };
      this.audio.onerror = () => {
        clearTimeout(timeout);
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback error'));
      };

      this.audio.play().catch(err => {
        clearTimeout(timeout);
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        reject(err);
      });
    });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.isSpeaking = false;
    this.speakQueue = [];
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.triggerLoadingEnd();
  }
}

const audioPlayer = new AudioPlayer();
export default audioPlayer;