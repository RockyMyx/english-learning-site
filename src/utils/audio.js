class AudioPlayer {
  constructor() {
    this.audio = null;
    this.isSpeaking = false;
    this.speakQueue = [];
    this.isProcessingQueue = false;
    // 从环境变量读取 API Key，如果没有则使用空字符串
    this.zhipuApiKey = import.meta.env.VITE_ZHIPU_API_KEY || '';
    this.zhipuApiUrl = 'https://open.bigmodel.cn/api/paas/v4/audio/speech';
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
      // 注意：不要在这里调用 stop()，因为 processQueue 已经处理了队列逻辑
      // 停止当前音频播放，但不清空队列
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
        this.audio = null;
      }
      this.isSpeaking = false;

      // console.log('调用智谱AI TTS API:', cleanText, '语速:', options.speed || 1.2);

      // 调用智谱AI API，传入语速参数
      this.callZhipuAPI(cleanText, options.speed || 1.0)
        .then(audioBlob => {
          // 创建本地URL
          const audioUrl = URL.createObjectURL(audioBlob);

          this.audio = new Audio();
          this.audio.src = audioUrl;
          this.audio.volume = 1; // 设置音量为1

          // console.log('音频设置完成 - 音量:', this.audio.volume, 'URL:', audioUrl);

          // 设置超时
          const timeout = setTimeout(() => {
            this.isSpeaking = false;
            // console.error('音频播放超时:', cleanText);
            URL.revokeObjectURL(audioUrl);
            reject(new Error('音频播放超时'));
          }, 15000); // 15秒超时

          this.audio.onloadeddata = () => {
            clearTimeout(timeout);
            // console.log('智谱AI音频数据加载完成:', cleanText);
          };

          this.audio.onended = () => {
            clearTimeout(timeout);
            this.isSpeaking = false;
            // console.log('智谱AI发音播放完成:', cleanText);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          this.audio.onerror = (e) => {
            clearTimeout(timeout);
            this.isSpeaking = false;
            // console.error('智谱AI发音播放失败:', e);
            URL.revokeObjectURL(audioUrl);
            reject(e);
          };

          this.isSpeaking = true;

          this.audio.addEventListener('canplaythrough', () => {
            // console.log('音频可以播放，开始播放:', cleanText);
            this.audio.play().then(() => {
              // console.log('音频播放成功:', cleanText);
            }).catch(err => {
              clearTimeout(timeout);
              this.isSpeaking = false;
              // console.error('音频播放失败:', err);
              URL.revokeObjectURL(audioUrl);
              reject(err);
            });
          }, { once: true });

          this.audio.load();
        })
        .catch(error => {
          // // console.error('智谱AI API调用失败:', error);

          // 显示友好的错误提示
          const userFriendlyError = new Error(`发音服务暂时不可用，请稍后再试。详情: ${error.message}`);
          reject(userFriendlyError);
        });
    });
  }

  // 调用智谱AI TTS API
  async callZhipuAPI(text, speed = 1.0) {
    try {
      // console.log('发送智谱AI TTS请求:', text, '语速:', speed);

      const requestBody = {
        model: 'glm-tts',
        input: text,
        voice: 'tongtong',
        response_format: 'wav', // 改回wav格式
        stream: false,
        volume: 3,
        speed: speed // 使用传入的语速参数
      };

      // console.log('请求参数:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.zhipuApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.zhipuApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // console.log('智谱AI响应状态:', response.status, response.statusText);
      // console.log('智谱AI响应headers:', [...response.headers.entries()]);

      if (!response.ok) {
        // 尝试读取错误信息
        let errorMessage = `智谱AI API响应错误: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          // console.error('智谱AI错误详情:', errorData);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // console.error('无法解析错误响应');
        }
        throw new Error(errorMessage);
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      // console.log('智谱AI响应类型:', contentType);

      // 获取音频blob
      const audioBlob = await response.blob();
      // console.log('音频blob大小:', audioBlob.size, 'bytes');

      // 检查是否是有效的音频
      if (audioBlob.size === 0) {
        throw new Error('智谱AI返回了空的音频数据');
      }

      // 检查响应类型是否为音频
      if (!contentType || !contentType.includes('audio')) {
        // 如果不是音频类型，可能是错误信息
        const textResponse = await audioBlob.text();
        // console.error('智谱AI返回非音频数据:', textResponse);
        throw new Error(`智谱AI返回错误: ${textResponse}`);
      }

      // 尝试去除音频前面的提示音
      // console.log('开始处理音频，去除提示音');
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