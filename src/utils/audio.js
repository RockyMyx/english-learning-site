class AudioPlayer {
  constructor() {
    this.audio = null;
    this.isSpeaking = false;
    this.speakQueue = [];
    this.isProcessingQueue = false;

    // 检测设备类型
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Web Speech API
    this.webSpeechVoices = [];
    this.loadWebSpeechVoices();

    // IndexedDB 缓存（仅 Azure 使用）
    this.dbName = 'AudioCache';
    this.storeName = 'audioCache';
    this.db = null;
    this.suppressLoading = false;
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
    return `azure:${speed}:${text}`;
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
    if (this.suppressLoading) return;
    window.dispatchEvent(new CustomEvent('audio-loading-start'));
  }

  triggerLoadingEnd() {
    if (this.suppressLoading) return;
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

  async waitForVoices(maxWait = 2000) {
    if (this.webSpeechVoices.length > 0) return;
    const start = Date.now();
    while (this.webSpeechVoices.length === 0 && Date.now() - start < maxWait) {
      this.webSpeechVoices = window.speechSynthesis.getVoices();
      if (this.webSpeechVoices.length === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
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

  // 有道发音（单词）— 带 IndexedDB 缓存
  async speakYoudao(text) {
    const cacheKey = `youdao:${text}`;

    // 尝试从缓存读取
    try {
      const cachedBlob = await this.getFromCache(cacheKey);
      if (cachedBlob) {
        await this.playBlob(cachedBlob);
        return;
      }
    } catch (e) {
      console.warn('[AudioPlayer] Youdao cache read error:', e.message);
    }

    this.triggerLoadingStart();

    try {
      const useProxy = window.location.protocol === 'https:';
      const encodedText = encodeURIComponent(text);
      const audioUrl = useProxy
        ? `/api/youdao?text=${encodedText}`
        : `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=2`;

      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error(`有道发音加载失败: ${response.status}`);

      const blob = await response.blob();

      // 保存到缓存
      try {
        await this.saveToCache(cacheKey, blob);
      } catch (e) {
        console.warn('[AudioPlayer] Youdao cache save error:', e.message);
      }

      await this.playBlob(blob);
    } catch (e) {
      this.triggerLoadingEnd();
      throw e;
    }
  }

  // Azure Cognitive Services TTS（句子）
  async speakAzure(text, speed = 1.0) {
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
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          voice: 'en-US-JennyNeural',
          response_format: 'mp3',
          speed: speed
        })
      });

      if (!response.ok) {
        throw new Error(`Azure TTS API error: ${response.status}`);
      }

      const blob = await response.blob();

      // 保存到缓存
      try {
        await this.saveToCache(cacheKey, blob);
      } catch (e) {
        console.warn('[AudioPlayer] Cache save error:', e.message);
      }

      return blob;
    } catch (e) {
      this.triggerLoadingEnd();
      throw e;
    }
  }

  // Web Speech API
  async callWebSpeechAPI(text, speed = 1.0) {
    this.triggerLoadingStart();
    try {
      return await new Promise(async (resolve, reject) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          reject(new Error('Web Speech API not available'));
          return;
        }

        await this.waitForVoices();

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

        utterance.onstart = () => this.triggerLoadingEnd();
        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          this.triggerLoadingEnd();
          if (e.error === 'canceled' || e.error === 'interrupted') {
            resolve();
            return;
          }
          reject(new Error(`Web Speech error: ${e.error}`));
        };

        window.speechSynthesis.speak(utterance);
      });
    } catch (e) {
      this.triggerLoadingEnd();
      throw e;
    }
  }

  // 预加载一组句子的语音到缓存（不播放）
  async preloadSentences(texts, speed = 1.0, onProgress) {
    // PC 端：Web Speech API 不需要预加载，只需预热语音引擎
    if (!this.isMobile) {
      await this.waitForVoices();
      // Chrome 已知问题：首次播放前几个词会被吞掉，发一个静默热身语音激活引擎
      await new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0.01;
        u.rate = 10;
        u.onend = resolve;
        u.onerror = resolve;
        window.speechSynthesis.speak(u);
        setTimeout(resolve, 300);
      });
      if (onProgress) {
        for (let i = 0; i < texts.length; i++) {
          onProgress(i + 1, texts.length);
        }
      }
      return;
    }

    // 移动端：逐句预加载到缓存
    for (let i = 0; i < texts.length; i++) {
      const text = this.cleanText(texts[i]);
      if (!text) {
        if (onProgress) onProgress(i + 1, texts.length);
        continue;
      }

      if (!this.isSingleWord(text)) {
        try {
          await this.speakAzure(text, speed);
        } catch (e) {
          console.warn('[AudioPlayer] Preload error:', e.message);
        }
      }

      if (onProgress) onProgress(i + 1, texts.length);
    }
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

    // 句子：使用 Azure TTS
    try {
      const blob = await this.speakAzure(text, options.speed || 1.0);
      await this.playBlob(blob);
      return;
    } catch (e) {
      console.warn('[AudioPlayer] Azure TTS failed:', e.message);
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
      this.audio.preload = 'auto';
      this.isSpeaking = true;

      let playAttempted = false;

      const timeout = setTimeout(() => {
        this.isSpeaking = false;
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback timeout'));
      }, 15000);

      this.audio.oncanplaythrough = () => {
        if (!playAttempted) {
          playAttempted = true;
          clearTimeout(timeout);
          this.audio.play().then(() => {
            this.triggerLoadingEnd();
          }).catch(err => {
            this.triggerLoadingEnd();
            this.isSpeaking = false;
            URL.revokeObjectURL(url);
            reject(err);
          });
        }
      };

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

      // 移动端可能需要预加载才能正常播放
      this.audio.load();
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