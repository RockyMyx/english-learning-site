// 学习进度管理
class LearningProgressManager {
  constructor() {
    this.storageKey = 'english_learning_progress';
    this.loadProgress();
  }

  loadProgress() {
    try {
      const today = new Date().toDateString();
      const savedData = localStorage.getItem(this.storageKey);

      if (savedData) {
        const data = JSON.parse(savedData);
        // 如果是新的一天，重置数据
        if (data.date !== today) {
          this.resetDailyProgress();
        } else {
          this.progress = data;
        }
      } else {
        this.resetDailyProgress();
      }
    } catch (error) {
      // console.error('加载学习进度失败:', error);
      this.resetDailyProgress();
    }
  }

  resetDailyProgress() {
    this.progress = {
      date: new Date().toDateString(),
      totalScore: 0,
      studyTime: 0,
      lastStudyTime: Date.now(),
      achievements: [],
      dailyGoal: 50 // 默认每日目标为50分
    };
    this.saveProgress();
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (error) {
      // console.error('保存学习进度失败:', error);
    }
  }

  addScore(points) {
    this.progress.totalScore += points;
    this.saveProgress();
    this.updateDisplay();
    this.checkAchievements();
  }

  addStudyTime(minutes) {
    this.progress.studyTime += minutes;
    this.saveProgress();
    this.updateDisplay();
    this.checkAchievements();
  }

  getCurrentScore() {
    return this.progress.totalScore;
  }

  getStudyTime() {
    return this.progress.studyTime;
  }

  checkAchievements() {
    // 每日学习目标：仅分数达到50分
    const scoreAchieved = this.progress.totalScore >= this.progress.dailyGoal;

    // 检查是否已经庆祝过
    if (scoreAchieved && !this.progress.achievements.includes('score_50')) {
      this.progress.achievements.push('score_50');
      this.saveProgress();
      this.showAchievement('score');
    }
  }

  showAchievement(type) {
    const celebration = new CelebrationEffect();
    if (type === 'score') {
      celebration.showScoreAchievement();
    } else if (type === 'time') {
      celebration.showTimeAchievement();
    }
  }

  updateDisplay() {
    // 更新所有页面的分数显示
    const scoreDisplays = document.querySelectorAll('.current-score');
    scoreDisplays.forEach(display => {
      display.textContent = this.getCurrentScore();
    });

    const totalScoreDisplays = document.querySelectorAll('.total-score');
    totalScoreDisplays.forEach(display => {
      display.textContent = this.getCurrentScore();
    });

    // 更新学习时间显示（格式化为时分秒）
    const studyTimeDisplays = document.querySelectorAll('.study-time');
    studyTimeDisplays.forEach(display => {
      const minutes = this.getStudyTime();
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0) {
        display.textContent = `${hours}:${String(mins).padStart(2, '0')}`;
      } else {
        display.textContent = `${mins}:00`;
      }
    });
  }

  getDailySummary() {
    return {
      score: this.progress.totalScore,
      time: this.progress.studyTime,
      scoreAchieved: this.progress.totalScore >= this.progress.dailyGoal,
      achievements: this.progress.achievements
    };
  }

  getGoalProgress() {
    const goal = this.progress.dailyGoal || 50;
    const current = this.progress.totalScore;
    const remaining = Math.max(0, goal - current);
    const percentage = Math.min(100, Math.round((current / goal) * 100));

    return {
      goal: goal,
      current: current,
      remaining: remaining,
      percentage: percentage,
      achieved: current >= goal
    };
  }
}

// 庆祝特效类
class CelebrationEffect {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
  }

  createCanvas() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.canvas.id = 'celebration-canvas';

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  createParticles() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -15 - 5,
        size: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.005,
        gravity: 0.2
      });
    }
  }

  animate() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle, index) => {
      // 更新位置
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;

      // 更新透明度
      particle.alpha -= particle.decay;

      // 绘制粒子
      if (particle.alpha > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });

    // 移除消失的粒子
    this.particles = this.particles.filter(p => p.alpha > 0);

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.cleanup();
    }
  }

  startFireworks() {
    this.createCanvas();
    this.createParticles();
    this.animate();
    this.playAchievementSound();
  }

  playAchievementSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 播放一段欢快的音乐
      const playNote = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // 简单的胜利音乐
      const notes = [523, 659, 784, 1047, 784, 659, 523]; // C E G C G E C
      notes.forEach((note, index) => {
        playNote(note, audioContext.currentTime + index * 0.15, 0.3);
      });

      // 添加一些"砰"的声音效果
      setTimeout(() => {
        const boomOsc = audioContext.createOscillator();
        const boomGain = audioContext.createGain();

        boomOsc.connect(boomGain);
        boomGain.connect(audioContext.destination);

        boomOsc.frequency.setValueAtTime(150, audioContext.currentTime);
        boomOsc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
        boomOsc.type = 'square';

        boomGain.gain.setValueAtTime(0.5, audioContext.currentTime);
        boomGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        boomOsc.start(audioContext.currentTime);
        boomOsc.stop(audioContext.currentTime + 0.5);
      }, 300);

    } catch (error) {
      // console.warn('播放音效失败:', error);
    }
  }

  showScoreAchievement() {
    this.showAchievementModal('🎉 太棒了！', '今日得分已突破50分！', 'score');
  }

  showTimeAchievement() {
    this.showAchievementModal('⏰ 厉害！', '今日学习时间超过30分钟！', 'time');
  }

  showAchievementModal(title, message, type) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'achievement-modal';
    modal.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${type === 'score' ? '🏆' : '⭐'}</div>
        <h2 class="achievement-title">${title}</h2>
        <p class="achievement-message">${message}</p>
        <button class="achievement-btn">太棒了！</button>
      </div>
    `;

    document.body.appendChild(modal);

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .achievement-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in;
      }

      .achievement-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        color: white;
        animation: scaleIn 0.4s ease-out;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .achievement-icon {
        font-size: 80px;
        margin-bottom: 20px;
        animation: bounce 1s ease-in-out infinite;
      }

      .achievement-title {
        font-size: 32px;
        margin-bottom: 15px;
        font-weight: bold;
      }

      .achievement-message {
        font-size: 18px;
        margin-bottom: 30px;
        opacity: 0.9;
      }

      .achievement-btn {
        background: white;
        color: #667eea;
        border: none;
        padding: 15px 40px;
        font-size: 18px;
        border-radius: 30px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s;
      }

      .achievement-btn:hover {
        transform: scale(1.05);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `;

    document.head.appendChild(style);

    // 启动烟花效果
    this.startFireworks();

    // 关闭按钮事件
    const closeBtn = modal.querySelector('.achievement-btn');
    closeBtn.addEventListener('click', () => {
      modal.remove();
      style.remove();
    });
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
  }
}

// 创建全局实例
const learningProgress = new LearningProgressManager();

// 导出工具函数
export function addScore(points) {
  learningProgress.addScore(points);
}

export function addStudyTime(minutes) {
  learningProgress.addStudyTime(minutes);
}

export function getCurrentScore() {
  return learningProgress.getCurrentScore();
}

export function getStudyTime() {
  return learningProgress.getStudyTime();
}

export function getDailySummary() {
  return learningProgress.getDailySummary();
}

export function updateScoreDisplay() {
  learningProgress.updateDisplay();
}

export function getGoalProgress() {
  return learningProgress.getGoalProgress();
}

export default learningProgress;