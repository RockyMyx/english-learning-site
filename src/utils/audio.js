class AudioPlayer {
  constructor() {
    this.audio = null;
    this.isSpeaking = false;
    this.speakQueue = [];
    this.isProcessingQueue = false;

    // 智谱 AI 配置
    this.zhipuApiKey = import.meta.env.VITE_ZHIPU_API_KEY || '';
    this.zhipuApiUrl = 'https://open.bigmodel.cn/api/paas/v4/audio/speech';

    // MiniMax 配置
    this.minimaxApiKey = import.meta.env.VITE_MINIMAX_API_KEY || '';
    this.minimaxApiUrl = 'https://api.minimaxi.com/v1/t2a_v2';

    // Web Speech API 配置（浏览器原生，免费）
    this.webSpeechVoices = [];

    // 自动检测最佳 TTS 方案
    const hasWebSpeech = typeof window !== 'undefined' && window.speechSynthesis;

    if (hasWebSpeech) {
      this.ttsProvider = 'web-speech';
      this.loadWebSpeechVoices();
    } else {
      this.ttsProvider = 'youdao-audio';
    }
  }

  // 加载 Web Speech API 语音列表
  loadWebSpeechVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      // console.log('[AudioPlayer] Web Speech API not available');
      return;
    }

    const loadVoices = () => {
      this.webSpeechVoices = window.speechSynthesis.getVoices();
      // console.log('[AudioPlayer] Web Speech voices loaded:', this.webSpeechVoices.length);
    };

    loadVoices();
    // 语音列表可能需要异步加载
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  // 获取适合英文的 Web Speech 语音
  getEnglishVoice() {
    // 优先选择英语语音
    const englishVoices = this.webSpeechVoices.filter(v => v.lang.startsWith('en'));
    // 优先选择 Google US English 或类似的高质量语音
    const preferredVoice = englishVoices.find(v => 
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
    );
    return preferredVoice || englishVoices[0] || this.webSpeechVoices[0];
  }

  async playYoudaoAudio(text) {
    return new Promise((resolve, reject) => {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }

      const encodedText = encodeURIComponent(text);
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=2`;

      this.audio = new Audio();
      this.audio.volume = 1.0;

      this.audio.oncanplaythrough = () => {
        this.audio.play().catch(err => reject(err));
      };

      this.audio.onended = () => {
        resolve();
      };

      this.audio.onerror = () => {
        reject(new Error('有道发音加载失败'));
      };

      this.audio.src = audioUrl;
      this.audio.load();
    });
  }

  // 调用 Web Speech API（浏览器原生，完全免费）
  async callWebSpeechAPI(text, speed = 1.0) {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        reject(new Error('浏览器不支持 Web Speech API'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
      const preferredVoice = englishVoices.find(v =>
        v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
      );
      const usVoice = englishVoices.find(v => v.lang === 'en-US');
      const voice = preferredVoice || usVoice || englishVoices[0] || null;

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = Math.max(0.1, Math.min(2.0, speed));
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      let resumeTimer = null;
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

      const clearResumeTimer = () => {
        if (resumeTimer) {
          clearInterval(resumeTimer);
          resumeTimer = null;
        }
      };

      utterance.onstart = () => {
        if (isMobile) {
          resumeTimer = setInterval(() => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
              window.speechSynthesis.resume();
            }
          }, 3000);
        }
      };

      utterance.onend = () => {
        clearResumeTimer();
        resolve();
      };

      utterance.onerror = (e) => {
        clearResumeTimer();
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve();
          return;
        }
        reject(new Error(`Web Speech API 错误: ${e.error}`));
      };

      const startSpeak = () => {
        window.speechSynthesis.speak(utterance);
        if (isMobile && window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        }
      };

      if (isMobile) {
        setTimeout(startSpeak, 50);
      } else {
        startSpeak();
      }
    });
  }

  // 清理文本，移除括号内容
  cleanText(text) {
    if (!text) return '';

    // console.log('原始文本:', text);

    // 移除各种类型的括号及其内容
    let cleaned = text
      // 移除全角中文括号（）及其内容
      .replace(/（[^）]*）/g, '')
      // 移除半角英文括号()及其内容
      .replace(/\([^)]*\)/g, '')
      // 移除方头括号【】及其内容
      .replace(/【[^】]*】/g, '')
      // 移除方括号[]及其内容
      .replace(/\[[^\]]*\]/g, '')
      // 移除花括号{}及其内容
      .replace(/\{[^}]*\}/g, '')
      // 移除尖括号<>及其内容
      .replace(/<[^>]*>/g, '')
      // 移除特殊字符，但保留基本的标点符号
      .replace(/[""''']/g, "'")     // 统一引号为撇号
      // 清理多余的空格（但保留必要的空格）
      .replace(/\s+/g, ' ')
      // 移除导致API错误的标点问题
      .replace(/\s+\./g, '.')        // 移除句号前的空格
      .replace(/\s+\,/g, ',')        // 移除逗号前的空格
      .replace(/\s+\?/g, '?')        // 移除问号前的空格
      .replace(/\s+\!/g, '!')        // 移除感叹号前的空格
      // 移除结尾的孤立标点符号（句子中间的标点保留）
      .replace(/[,\.\?!]$/, '')      // 移除句尾的逗号、句号、问号、感叹号
      .trim();                       // 移除首尾空格

    // console.log('清理后文本:', cleaned);

    return cleaned;
  }

  // 进一步清理文本，确保TTS API兼容性
  sanitizeText(text) {
    if (!text) return '';

    return text
      // 移除可能导致API问题的特殊字符，但保留基本标点
      .replace(/[^\w\s\u4e00-\u9fa5'?!.,\-]/g, '')
      // 处理一些特殊的有道API问题
      .replace(/^\.+$/, '')           // 移除只有句号的情况
      .replace(/^\?+$/, '')           // 移除只有问号的情况
      .replace(/^!+$/, '')            // 移除只有感叹号的情况
      // 确保空格正确
      .replace(/\s+/g, ' ')
      // 移除首尾空格
      .trim();
  }

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!text) {
        reject(new Error('文本为空'));
        return;
      }

      // console.log('开始处理音频请求:', text, '语速:', options.speed);

      // 清空现有队列，防止重复播放
      this.stop();

      // 清理文本，移除括号内容
      const cleaned = this.cleanText(text);
      if (!cleaned) {
        // console.warn('清理后的文本为空:', text);
        reject(new Error('清理后的文本为空'));
        return;
      }

      // 进一步清理特殊字符，但保留基本标点
      const finalText = this.sanitizeText(cleaned);
      if (!finalText || finalText.trim().length < 1) {
        // console.warn('最终文本过短或为空:', finalText);
        reject(new Error('最终文本过短或为空'));
        return;
      }

      // console.log('原始文本:', text);
      // console.log('最终处理文本:', finalText);

      // 将请求加入队列，支持自定义语速
      this.speakQueue.push({
        text: finalText,
        options: {
          ...options,
          speed: options.speed || 1.0 // 默认语速1.0倍
        },
        resolve: resolve,
        reject: reject
      });

      // console.log('音频请求已加入队列，当前队列长度:', this.speakQueue.length);

      // 处理队列
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.speakQueue.length === 0) {
      // console.log('队列正在处理或队列为空，跳过');
      return;
    }

    // console.log('开始处理音频队列，队列长度:', this.speakQueue.length);
    this.isProcessingQueue = true;

    while (this.speakQueue.length > 0) {
      const current = this.speakQueue.shift();
      // console.log('处理队列项:', current.text, '语速:', current.options.speed);

      try {
        await this.playAudio(current.text, current.options);
        // console.log('队列项播放成功');
        current.resolve();
      } catch (error) {
        // console.error('队列项播放失败:', error);
        current.reject(error);
      }

      // 添加小延迟，避免连续播放问题
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // console.log('音频队列处理完成');
    this.isProcessingQueue = false;
  }

  playAudio(cleanText, options = {}) {
    return new Promise((resolve, reject) => {
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
        this.audio = null;
      }
      this.isSpeaking = false;

      let apiCall;
      if (this.ttsProvider === 'web-speech') {
        this.callWebSpeechAPI(cleanText, options.speed || 1.0)
          .then(() => {
            this.isSpeaking = false;
            resolve();
          })
          .catch(error => {
            this.isSpeaking = false;
            reject(error);
          });
        return;
      } else if (this.ttsProvider === 'youdao-audio') {
        this.playYoudaoAudio(cleanText)
          .then(() => {
            this.isSpeaking = false;
            resolve();
          })
          .catch(error => {
            this.isSpeaking = false;
            reject(error);
          });
        return;
      } else if (this.ttsProvider === 'minimax') {
        apiCall = this.callMiniMaxAPI(cleanText, options.speed || 1.0);
      } else {
        apiCall = this.callZhipuAPI(cleanText, options.speed || 1.0);
      }
      
      apiCall
        .then(audioBlob => {
          const audioUrl = URL.createObjectURL(audioBlob);

          this.audio = new Audio();
          this.audio.src = audioUrl;
          this.audio.volume = 1;

          const timeout = setTimeout(() => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            reject(new Error('音频播放超时'));
          }, 15000);

          this.audio.onloadeddata = () => {
            clearTimeout(timeout);
          };

          this.audio.onended = () => {
            clearTimeout(timeout);
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          this.audio.onerror = (e) => {
            clearTimeout(timeout);
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            reject(e);
          };

          this.isSpeaking = true;

          this.audio.addEventListener('canplaythrough', () => {
            this.audio.play().catch(err => {
              clearTimeout(timeout);
              this.isSpeaking = false;
              URL.revokeObjectURL(audioUrl);
              reject(err);
            });
          }, { once: true });

          this.audio.load();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // 调用 MiniMax TTS API（HTTP 同步方式）
  async callMiniMaxAPI(text, speed = 1.0) {
    try {
      // console.log('发送 MiniMax TTS 请求:', text, '语速:', speed);

      // MiniMax API 使用 speed 范围是 0.5-2.0
      const adjustedSpeed = Math.max(0.5, Math.min(1.0, speed));

      const requestBody = {
        model: 'speech-2.8-hd',
        text: text,
        stream: false,
        voice_setting: {
          voice_id: 'English_radiant_girl',
          speed: adjustedSpeed,
          vol: 1,
          pitch: 0,
          emotion: 'happy'
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
          channel: 1
        },
        language_boost: 'English',
        subtitle_enable: false,
        output_format: 'hex'
      };

      // console.log('MiniMax 请求参数:', JSON.stringify(requestBody, null, 2));

      // 官方 HTTP 端点，只需要 Authorization header
      const response = await fetch(this.minimaxApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.minimaxApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // console.log('MiniMax 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `MiniMax API 响应错误: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('MiniMax 错误详情:', errorData);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          console.error('无法解析错误响应');
        }
        throw new Error(errorMessage);
      }

      // MiniMax 返回 JSON 格式，audio 数据在 data.audio 字段（hex 格式）
      const responseData = await response.json();
      // console.log('MiniMax 响应数据:', responseData);

      // 检查 base_resp 状态
      if (responseData.base_resp?.status_code !== 0) {
        throw new Error(`MiniMax API 错误: ${responseData.base_resp?.status_msg || '未知错误'}`);
      }

      // 获取 hex 格式的音频数据
      const audioHex = responseData.data?.audio;
      if (!audioHex) {
        throw new Error('MiniMax 返回的数据中没有音频');
      }

      // 将 hex 转换为 ArrayBuffer
      const audioBuffer = this.hexToArrayBuffer(audioHex);
      // console.log('MiniMax 音频大小:', audioBuffer.byteLength, 'bytes');

      // 创建 Blob（MP3 格式）
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      return audioBlob;

    } catch (error) {
      console.error('MiniMax API 调用失败:', error);
      throw error;
    }
  }

  // 将 hex 字符串转换为 ArrayBuffer
  hexToArrayBuffer(hexString) {
    // 移除可能的空格和换行
    const cleanHex = hexString.replace(/\s/g, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  // 调用智谱AI TTS API
  async callZhipuAPI(text, speed = 1.0) {
    try {
      const requestBody = {
        model: 'glm-tts',
        input: text,
        voice: 'tongtong',
        response_format: 'wav',
        stream: false,
        volume: 3,
        speed: speed
      };

      const response = await fetch(this.zhipuApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.zhipuApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = `智谱AI API响应错误: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      const audioBlob = await response.blob();

      if (audioBlob.size === 0) {
        throw new Error('智谱AI返回了空的音频数据');
      }

      if (!contentType || !contentType.includes('audio')) {
        const textResponse = await audioBlob.text();
        throw new Error(`智谱AI返回错误: ${textResponse}`);
      }

      return await this.removeAudioBeep(audioBlob);

    } catch (error) {
      console.error('智谱AI API调用失败:', error);
      throw error;
    }
  }

  // 去除音频前面的提示音
  async removeAudioBeep(audioBlob) {
    try {
      // 创建音频上下文来处理音频
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 去除前面1.8秒的音频
      const sampleRate = audioBuffer.sampleRate;
      const samplesToRemove = Math.floor(sampleRate * 1.8); // 1.8秒

      // console.log(`去除音频前${(samplesToRemove/sampleRate).toFixed(2)}秒的提示音，原始音频长度: ${(audioBuffer.length/sampleRate).toFixed(2)}秒`);

      if (audioBuffer.length > samplesToRemove) {
        // 创建新的音频缓冲区，去除前面的提示音
        const newBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          audioBuffer.length - samplesToRemove,
          sampleRate
        );

        // 复制音频数据（跳过前面的样本）
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const newChannelData = newBuffer.getChannelData(channel);

          for (let i = 0; i < newBuffer.length; i++) {
            newChannelData[i] = channelData[i + samplesToRemove];
          }
        }

        // console.log(`处理后音频长度: ${(newBuffer.length/sampleRate).toFixed(2)}秒`);

        // 将处理后的音频转换回blob
        const wavBlob = await this.audioBufferToWav(newBuffer);
        audioContext.close();
        return wavBlob;
      }

      // 如果音频太短，直接返回原音频
      // console.log('音频太短，无法去除提示音，返回原音频');
      audioContext.close();
      return audioBlob;

    } catch (error) {
      console.warn('音频处理失败，返回原音频:', error);
      // 确保关闭音频上下文
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      return audioBlob;
    }
  }

  // 将AudioBuffer转换为WAV Blob
  async audioBufferToWav(buffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);

    // WAV文件头
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    let offset = 0;
    writeString(offset, 'RIFF'); offset += 4;
    view.setUint32(offset, length - 8, true); offset += 4;
    writeString(offset, 'WAVE'); offset += 4;
    writeString(offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numberOfChannels, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * 2 * numberOfChannels, true); offset += 4;
    view.setUint16(offset, numberOfChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString(offset, 'data'); offset += 4;
    view.setUint32(offset, length - offset - 4, true); offset += 4;

    // 写入音频数据
    const floatTo16BitPCM = (output, offset, input) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    for (let channel = 0; channel < numberOfChannels; channel++) {
      floatTo16BitPCM(view, 44, buffer.getChannelData(channel));
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  isPlaying() {
    return this.isSpeaking;
  }

  speakWord(word) {
    return this.speak(word);
  }

  speakSentence(sentence) {
    return this.speak(sentence);
  }

  stop() {
    // 清空队列
    this.speakQueue = [];
    this.isProcessingQueue = false;

    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.isSpeaking = false;
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