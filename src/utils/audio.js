// 语音播放功能
class AudioPlayer {
  constructor() {
    this.audioPlayer = document.getElementById('audio-player');
    this.synth = window.speechSynthesis;
    this.isSpeaking = false;
    this.init();
  }

  init() {
    if (!this.synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // 延迟加载声音，确保页面完全加载
    setTimeout(() => {
      this.loadVoices();

      // 监听声音变化（某些浏览器需要）
      this.synth.onvoiceschanged = () => {
        this.loadVoices();
      };
    }, 100);
  }

  loadVoices() {
    try {
      this.voices = this.synth.getVoices();
      console.log('Available voices:', this.voices.length);

      // 等待声音加载
      if (this.voices.length === 0) {
        setTimeout(() => this.loadVoices(), 100);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  }

  // 使用浏览器TTS播放英语发音
  speak(text, options = {}) {
    if (!this.synth) {
      console.error('Speech synthesis not available');
      return Promise.reject('Speech synthesis not available');
    }

    // 停止当前播放
    this.synth.cancel();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);

        // 设置发音参数 - 适合小朋友的设置，并增强音量感知
        utterance.lang = 'en-US';
        utterance.rate = options.rate || 0.8; // 语速稍慢，更清晰
        utterance.pitch = options.pitch || 1.0; // 音调正常，避免过高影响音量
        utterance.volume = options.volume || 1.0; // 最大音量

        // 优先选择适合小朋友的英语声音
        if (this.voices && this.voices.length > 0) {
          // 优先选择女性声音，通常更适合小朋友
          const childFriendlyVoice = this.voices.find(voice =>
            voice.lang.startsWith('en') &&
            (voice.name.toLowerCase().includes('female') ||
             voice.name.toLowerCase().includes('samantha') ||
             voice.name.toLowerCase().includes('zira') ||
             voice.name.toLowerCase().includes('victoria'))
          );

          // 其次选择标准英语声音
          const englishVoice = childFriendlyVoice || this.voices.find(voice =>
            voice.lang.startsWith('en')
          ) || this.voices[0];

          if (englishVoice) {
            utterance.voice = englishVoice;
            console.log('Using voice:', englishVoice.name, 'Language:', englishVoice.lang);
          }
        } else {
          console.warn('No voices available, using default');
        }

        utterance.onend = () => {
          this.isSpeaking = false;
          console.log('Speech completed successfully');
          resolve();
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          console.error('Speech synthesis error:', event.error);
          console.error('Error details:', {
            error: event.error,
            name: event.name,
            message: event.message
          });
          reject(event.error);
        };

        // 开始播放
        this.synth.speak(utterance);
        this.isSpeaking = true;
        console.log('Speaking:', text, 'with rate:', utterance.rate);

        // 确保音频开始播放
        setTimeout(() => {
          if (this.synth.pending || this.synth.speaking) {
            console.log('Audio is playing');
          } else {
            console.warn('Audio may not have started');
          }
        }, 100);

      } catch (error) {
        this.isSpeaking = false;
        console.error('Error creating utterance:', error);
        reject(error);
      }
    });
  }

  // 停止播放
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // 是否正在播放
  isPlaying() {
    return this.isSpeaking;
  }

  // 播放单词发音
  speakWord(word) {
    console.log('speakWord called with:', word);
    return this.speak(word);
  }

  // 播放句子发音
  speakSentence(sentence) {
    console.log('speakSentence called with:', sentence);
    return this.speak(sentence, { rate: 0.9 }); // 句子语速稍快一点
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