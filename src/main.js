// 主应用程序入口
import { getAllWords } from './utils/vocabulary.js';
import learningProgress from './utils/learningProgress.js';

// 导入各个页面模块
import { initListeningMode, cleanupListeningMode } from './pages/listeningMode.js';
import { initWordToSentenceMode } from './pages/wordToSentenceMode.js';
import {
  initEnglishToChineseMode,
  initChineseToEnglishMode,
  initListeningToChineseMode,
  initEnglishDialogueMode
} from './pages/quizMode.js';
import { initPlaylistPage } from './pages/playlistPage.js';
import { initProgressPage } from './pages/progressPage.js';

// 路由管理
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.init();
  }

  init() {
    // 监听hash变化
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());

    // 初始化学习进度系统
    window.learningProgress = learningProgress;

    // 暴露全局函数供页面使用
    window.getTodayPoints = () => this.getTodayPoints();
    window.getStudyTime = () => this.getStudyTime();
    window.addPoints = (points) => this.addPoints(points);
    window.getGoalProgress = () => learningProgress.getGoalProgress();

    // 启动学习时间跟踪
    this.startStudyTimeTracking();

    // 监听页面可见性变化，准确跟踪学习时间
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pageHiddenTime = Date.now();
      } else {
        if (this.pageHiddenTime) {
          const hiddenDuration = Math.floor((Date.now() - this.pageHiddenTime) / 1000 / 60);
          if (hiddenDuration > 0) {
            learningProgress.addStudyTime(hiddenDuration);
          }
          this.pageHiddenTime = null;
        }
      }
    });

    // 定义路由
    this.routes = {
      '/': 'home',
      '/listening': 'listening',
      '/english-to-chinese': 'english-to-chinese',
      '/chinese-to-english': 'chinese-to-english',
      '/listening-to-chinese': 'listening-to-chinese',
      '/english-dialogue': 'english-dialogue',
      '/word-to-sentence': 'word-to-sentence',
      '/playlist': 'playlist',
      '/progress': 'progress'
    };
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes[hash] || 'home';

    if (this.currentRoute !== route) {
      this.currentRoute = route;
      this.navigate(hash, false);
    }
  }

  navigate(path, updateHash = true) {
    if (updateHash) {
      window.location.hash = path;
    }

    const route = this.routes[path] || 'home';
    this.currentRoute = route;

    // 清理所有quiz模式实例
    if (this.currentQuizInstance && typeof this.currentQuizInstance.cleanup === 'function') {
      this.currentQuizInstance.cleanup();
      this.currentQuizInstance = null;
    }

    // 清理听力模式
    if (typeof cleanupListeningMode === 'function') {
      cleanupListeningMode();
    }

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(`${route}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.initPage(route);
    } else {
      console.error('未找到页面:', route);
    }

    // 停止任何正在播放的音频
    if (window.audioPlayer) {
      window.audioPlayer.stop();
    }
  }

  initPage(route) {
    switch (route) {
      case 'home':
        this.initHomePage();
        break;
      case 'listening':
        initListeningMode();
        break;
      case 'english-to-chinese':
        this.currentQuizInstance = initEnglishToChineseMode();
        break;
      case 'chinese-to-english':
        this.currentQuizInstance = initChineseToEnglishMode();
        break;
      case 'listening-to-chinese':
        this.currentQuizInstance = initListeningToChineseMode();
        break;
      case 'english-dialogue':
        this.currentQuizInstance = initEnglishDialogueMode();
        break;
      case 'word-to-sentence':
        this.currentQuizInstance = initWordToSentenceMode();
        break;
      case 'playlist':
        initPlaylistPage();
        break;
      case 'progress':
        initProgressPage();
        break;
    }
  }

  initHomePage() {
    // 初始化首页统计
    this.updateHomeStats();

    // 开始学习时间计时（使用统一的 learningProgress 数据）
    this.startStudyTimer();

    // 延迟设置学习模式卡片点击事件，确保DOM完全渲染
    setTimeout(() => {
      document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
          const mode = card.dataset.mode;
          if (mode) {
            this.navigate(`/${mode}`);
          }
        });
      });
    }, 100);
  }

  startStudyTimer() {
    // 立即更新一次显示（使用 learningProgress 的数据）
    this.updateStudyTimeDisplay();

    // 每分钟更新一次显示
    setInterval(() => {
      // 通过 learningProgress 添加学习时间
      if (window.learningProgress) {
        window.learningProgress.addStudyTime(1);
      }
      this.updateStudyTimeDisplay();
    }, 60000);
  }

  updateStudyTimeDisplay() {
    const visitTimeElement = document.getElementById('visit-time');
    if (visitTimeElement && window.learningProgress) {
      const minutes = window.learningProgress.getStudyTime();
      if (minutes < 60) {
        visitTimeElement.textContent = minutes + '分钟';
      } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        visitTimeElement.textContent = `${hours}小时${mins}分钟`;
      }
    }
  }

  updateHomeStats() {
    // 更新今日积分
    const todayPoints = this.getTodayPoints();
    const todayPointsElement = document.getElementById('today-points');
    if (todayPointsElement) {
      todayPointsElement.textContent = todayPoints;
    }
  }

  getTodayPoints() {
    const today = new Date().toISOString().split('T')[0];
    const pointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
    return pointsData[today] || 0;
  }

  // 添加获取学习时间的全局函数
  getStudyTime() {
    if (window.learningProgress) {
      return window.learningProgress.getStudyTime();
    }
    return 0;
  }

  addPoints(points) {
    const today = new Date().toISOString().split('T')[0];
    const pointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
    pointsData[today] = (pointsData[today] || 0) + points;
    localStorage.setItem('pointsData', JSON.stringify(pointsData));

    // 同步到新的学习进度系统
    learningProgress.addScore(points);

    // 更新显示
    const todayPointsElement = document.getElementById('today-points');
    if (todayPointsElement) {
      todayPointsElement.textContent = pointsData[today];
    }
  }

  loadProgressData() {
    try {
      const savedProgress = localStorage.getItem('studyProgress');
      return savedProgress ? JSON.parse(savedProgress) : { studyHistory: [] };
    } catch (error) {
      return { studyHistory: [] };
    }
  }

  calculateStreak(progressData) {
    if (!progressData.studyHistory || progressData.studyHistory.length === 0) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasStudy = progressData.studyHistory.some(h =>
        h.date === dateStr && h.wordsLearned > 0
      );

      if (hasStudy) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    return streak;
  }

  startStudyTimeTracking() {
    // 每分钟更新一次学习时间
    setInterval(() => {
      learningProgress.addStudyTime(1);
    }, 60000); // 每分钟更新一次

    // 初始化时检查一次成就
    setTimeout(() => {
      learningProgress.checkAchievements();
    }, 1000);
  }

}

// 创建路由实例
const router = new Router();

// 将路由暴露到全局，以便HTML中的onclick使用
window.router = router;

// 存储所有单词到localStorage（用于其他页面）
function saveAllWords() {
  const allWords = getAllWords();
  localStorage.setItem('allWords', JSON.stringify(allWords));
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  // 保存单词数据
  saveAllWords();

  // 应用已启动，不再需要导航菜单

  // 添加全局样式补充
  addGlobalStyles();

  // console.log('🎓 英语学习应用已启动！');
});

// 全局样式补充
function addGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* 额外的全局样式 - Linear Style */
    .audio-button {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .audio-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .audio-option-button {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: none;
      border-radius: 50%;
      width: 2rem;
      height: 2rem;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      transition: none;
    }

    .audio-option-button i {
      font-size: 0.8rem;
      color: white;
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: white;
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .dark .quiz-header {
      background: #1e293b;
      border-color: rgba(255, 255, 255, 0.05);
    }

    .quiz-progress {
      font-size: 1rem;
      color: #64748b;
      font-weight: 600;
    }

    .dark .quiz-progress {
      color: #94a3b8;
    }

    .quiz-points {
      font-size: 1rem;
      color: #2563eb;
      font-weight: 700;
      background: #eff6ff;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
    }

    .dark .quiz-points {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
    }

    .quiz-score {
      font-size: 1rem;
      color: #22c55e;
      font-weight: 700;
    }

    .quiz-feedback {
      text-align: center;
      font-weight: 700;
      padding: 0.75rem;
      border-radius: 0.75rem;
    }

    .quiz-feedback.correct {
      color: #166534;
      background: #dcfce7;
    }

    .dark .quiz-feedback.correct {
      color: #86efac;
      background: rgba(34, 197, 94, 0.15);
    }

    .quiz-feedback.incorrect {
      color: #991b1b;
      background: #fee2e2;
    }

    .dark .quiz-feedback.incorrect {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.15);
    }

    /* 播放列表样式补充 */
    .playlist-item.active {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .dark .playlist-item.active {
      background: rgba(59, 130, 246, 0.15);
      border-left-color: #60a5fa;
    }

    /* 响应式补充 */
    @media (max-width: 480px) {
      .hero {
        padding: 1.5rem 1rem;
      }

      .hero h2 {
        font-size: 1.8rem;
      }

      .stat-number {
        font-size: 2rem;
      }

      .learning-modes {
        grid-template-columns: 1fr;
      }

      .mode-card {
        padding: 1.5rem;
      }
    }

    /* 动画效果 */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page.active {
      animation: fadeIn 0.3s ease;
    }

    /* 滚动条样式 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .dark ::-webkit-scrollbar-thumb {
      background: #334155;
    }

    .dark ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }

    /* 每日学习进度条样式 */
    .daily-progress-bar {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    .daily-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .daily-progress-title {
      font-size: 16px;
      font-weight: bold;
      color: #667eea;
    }

    .daily-progress-stats {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .daily-progress-item {
      text-align: center;
    }

    .daily-progress-label {
      font-size: 12px;
      color: #888;
      margin-bottom: 5px;
    }

    .daily-progress-value {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
    }

    .daily-progress-value.achieved {
      color: #28a745;
    }

    .progress-bar-container {
      margin-top: 15px;
    }

    .progress-bar-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #555;
    }

    .progress-bar-wrapper {
      background: #f0f0f0;
      border-radius: 10px;
      height: 20px;
      overflow: hidden;
      position: relative;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      transition: width 0.5s ease;
      position: relative;
      overflow: hidden;
    }

    .progress-bar-fill.achieved {
      background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
    }

    .progress-bar-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .progress-milestone {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      color: #888;
      font-weight: bold;
      z-index: 1;
    }

    /* 防止学习时间显示换行 */
    #visit-time {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;
      min-width: 120px;
      text-align: center;
    }

    /* 防止今日积分显示换行 */
    #today-points {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;
      min-width: 80px;
      text-align: center;
    }

    /* 在小屏幕上调整统计卡片样式 */
    @media (max-width: 640px) {
      .hero-stat-card {
        min-width: 140px;
        padding: 1rem;
      }

      #visit-time, #today-points {
        font-size: 1.25rem; /* 在小屏幕上适当减小字体 */
        min-width: 100px;
      }
    }

    /* 在更小屏幕上进一步调整 */
    @media (max-width: 480px) {
      .hero-stat-card {
        min-width: 120px;
        padding: 0.75rem;
      }

      #visit-time, #today-points {
        font-size: 1.1rem;
        min-width: 90px;
      }
    }
  `;
  document.head.appendChild(style);
}


