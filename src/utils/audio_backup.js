// 语音播放功能 - 改进版本
class AudioPlayer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.voicesLoaded = false;
    this.isSpeaking = false;
    this.init();
  }

  init() {
    if (!this.synth) {
      console.error('❌ Speech synthesis not supported in this browser');
      return;
    }

    // console.log('✅ AudioPlayer initialized, loading voices...');

    // 立即尝试加载声音
    this.loadVoices();

    // 监听声音变化事件（Chrome需要）
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        // console.log('🔊 Voices changed, reloading...');
        this.loadVoices();
      };
    }

    // 添加页面可见性监听，修复iOS音频问题
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.synth.cancel();
        // console.log('⏸️ Page hidden, speech cancelled');
      }
    });
  }

  loadVoices() {
    try {
      this.voices = this.synth.getVoices();

      if (this.voices.length > 0) {
        this.voicesLoaded = true;
        const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en'));
        // console.log(`✅ ${this.voices.length} voices loaded, ${englishVoices.length} English voices available`);

        // 显示可用的英语声音
        englishVoices.slice(0, 5).forEach(voice => {
          // console.log(`   - ${voice.name} (${voice.lang})`);
        });

        if (englishVoices.length === 0) {
          console.warn('⚠️ No English voices found, using first available voice');
        }
      } else {
        console.warn('⏳ No voices loaded yet, will retry...');
        // 声音可能还在加载中，稍后重试
        setTimeout(() => this.loadVoices(), 500);
      }
    } catch (error) {
      console.error('❌ Error loading voices:', error);
    }
  }

  // 使用浏览器TTS播放英语发音 - 改进版本
  speak(text, options = {}) {
    if (!this.synth) {
      console.error('❌ Speech synthesis not available');
      return Promise.reject('Speech synthesis not available');
    }

    // 停止当前播放
    this.synth.cancel();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);

        // 设置发音参数 - 使用更保守的默认值
        utterance.lang = options.lang || 'en-US';
        utterance.rate = options.rate !== undefined ? options.rate : 0.9; // 稍慢一点的语速更清晰
        utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
        utterance.volume = options.volume !== undefined ? options.volume : 1.0;

        // 选择最佳英语声音
        if (this.voices && this.voices.length > 0) {
          let selectedVoice = null;

          // 优先选择高质量英语声音（按优先级）
          const preferredVoices = [
            'Google US English',      // Chrome高质量
            'Microsoft David',         // Windows高质量
            'Samantha',               // macOS高质量
            'Alex',                   // macOS标准
            'Daniel',                 // iOS高质量
            'English (United States)' // 通用
          ];

          // 尝试找到首选声音
          for (const preferred of preferredVoices) {
            selectedVoice = this.voices.find(voice => voice.name.includes(preferred));
            if (selectedVoice) {
              // console.log(`🎯 Selected preferred voice: ${selectedVoice.name}`);
              break;
            }
          }

          // 如果没有找到首选声音，选择第一个英语声音
          if (!selectedVoice) {
            selectedVoice = this.voices.find(voice => voice.lang.startsWith('en'));
          }

          // 最后回退到第一个可用声音
          if (!selectedVoice) {
            selectedVoice = this.voices[0];
            console.warn('⚠️ Using fallback voice (not English)');
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
            // console.log(`🔊 Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
          }
        } else {
          console.warn('⚠️ No voices loaded yet, using browser default');
        }

        // 设置事件处理器
        utterance.onstart = () => {
          this.isSpeaking = true;
          // console.log(`▶️ Started speaking: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          // console.log('✅ Speech completed successfully');
          resolve();
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          console.error('❌ Speech synthesis error:', event.error);
          console.error('   Error details:', {
            error: event.error,
            name: event.name,
            elapsed: event.elapsedTime,
            charIndex: event.charIndex
          });

          // 特定错误处理
          if (event.error === 'interrupted') {
            console.warn('⚠️ Speech was interrupted (likely cancelled by new speech)');
            resolve(); // 中断不算真正的错误
          } else {
            reject(event.error);
          }
        };

        utterance.onpause = () => {
          // console.log('⏸️ Speech paused');
        };

        utterance.onresume = () => {
          // console.log('▶️ Speech resumed');
        };

        // 开始播放
        // console.log(`🚀 Attempting to speak: "${text}"`);
        this.synth.speak(utterance);
        this.isSpeaking = true;

        // 检查播放状态（延迟检查以处理初始化延迟）
        const checkInterval = setInterval(() => {
          if (this.synth.speaking) {
            // console.log('✅ Audio is actively playing');
            clearInterval(checkInterval);
          } else if (this.synth.pending) {
            // console.log('⏳ Audio is pending (waiting to start)');
          } else if (!this.isSpeaking) {
            // 如果已经结束了，停止检查
            clearInterval(checkInterval);
          } else {
            // 检查是否超时
            console.warn('⚠️ Audio may not have started (no speaking or pending state)');
            clearInterval(checkInterval);
          }
        }, 100);

        // 设置超时检查（最长10秒）
        setTimeout(() => {
          clearInterval(checkInterval);
          if (this.isSpeaking && !this.synth.speaking && !this.synth.pending) {
            console.error('❌ Audio playback timeout - no audio detected');
            reject('Audio playback timeout');
          }
        }, 10000);

      } catch (error) {
        this.isSpeaking = false;
        console.error('❌ Error creating utterance:', error);
        console.error('   Error details:', {
          message: error.message,
          stack: error.stack
        });
        reject(error);
      }
    });
  }

  // 停止播放
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      // console.log('🛑 Speech stopped');
    }
  }

  // 是否正在播放
  isPlaying() {
    return this.isSpeaking || (this.synth && (this.synth.speaking || this.synth.pending));
  }

  // 播放单词发音 - 添加重试机制
  speakWord(word) {
    return this.speakWithRetry(word);
  }

  // 播放句子发音
  speakSentence(sentence) {
    return this.speakWithRetry(sentence);
  }

  // 带重试机制的发音
  async speakWithRetry(text, options = {}, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // console.log(`🔄 Attempt ${attempt}/${maxRetries} to speak: "${text}"`);

        // 等待声音加载
        if (!this.voicesLoaded) {
          // console.log('⏳ Waiting for voices to load...');
          await this.waitForVoices(3000);
        }

        await this.speak(text, options);
        return; // 成功则返回

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error);

        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const waitTime = attempt * 1000; // 递增等待时间
          // console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));

          // 重新加载声音
          this.loadVoices();
        }
      }
    }

    // 所有尝试都失败了
    console.error('❌ All retry attempts failed:', lastError);
    throw lastError;
  }

  // 等待声音加载
  waitForVoices(timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.voicesLoaded && this.voices.length > 0) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (this.voicesLoaded && this.voices.length > 0) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Timeout waiting for voices to load'));
        }
      }, 100);
    });
  }

  // 获取可用的英语声音列表
  getEnglishVoices() {
    if (!this.voices || this.voices.length === 0) {
      return [];
    }
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  // 检查浏览器支持
  checkSupport() {
    const support = {
      speechSynthesis: 'speechSynthesis' in window,
      voicesAvailable: this.voicesLoaded && this.voices.length > 0,
      englishVoicesAvailable: this.getEnglishVoices().length > 0
    };

    // console.log('🔍 Audio support check:', support);
    return support;
  }
}

// 创建全局音频播放器实例
const audioPlayer = new AudioPlayer();

// 便捷函数
export function speakWord(word) {
  return audioPlayer.speakWord(word);
}

export function speakSentence(sentence) {
  return audioPlayer.speakSentence(sentence);
}

export function stopSpeaking() {
  audioPlayer.stop();
}

export function isSpeaking() {
  return audioPlayer.isPlaying();
}

export default audioPlayer;