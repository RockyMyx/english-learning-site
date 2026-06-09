// 主应用程序入口
import { getAllWords } from './utils/vocabulary.js';
import learningProgress from './utils/learningProgress.js';

// 导入各个页面模块
import { initListeningMode, cleanupListeningMode } from './pages/listeningMode.js';
import { initWordToSentenceMode } from './pages/wordToSentenceMode.js';
import { initAdminWordList, initAdminWordToSentence } from './pages/adminWordToSentence.js';
import { initAdminAddWord } from './pages/adminAddWord.js';
import { initAdminDashboard } from './pages/adminDashboard.js';
import { initAdminEnglishDialogue } from './pages/adminEnglishDialogue.js';
import { initAdminLearningRecords } from './pages/adminLearningRecords.js';
import { initStorybook, initStorybookDetail } from './pages/storybook.js';
import { initAdminStorybook } from './pages/adminStorybook.js';
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

    // 启动全局学习时间计时器（秒级精度，页面不可见时暂停）
    this.startStudyTimer();

    // 定义路由
    this.routes = {
      '/': 'home',
      '/listening': 'listening',
      '/english-to-chinese': 'english-to-chinese',
      '/chinese-to-english': 'chinese-to-english',
      '/listening-to-chinese': 'listening-to-chinese',
      '/english-dialogue': 'english-dialogue',
      '/word-to-sentence': 'word-to-sentence',
      '/storybook': 'storybook',
      '/playlist': 'playlist',
      '/progress': 'progress',
      '/admin/word-to-sentence': 'admin-word-to-sentence',
      '/admin/add-word': 'admin-add-word',
      '/admin': 'admin-dashboard',
      '/admin/english-dialogue': 'admin-english-dialogue',
      '/admin/storybook': 'admin-storybook',
      '/admin/learning-records': 'admin-learning-records'
    };
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    const { route, params } = this.matchRoute(hash);

    if (this.currentRoute !== route || JSON.stringify(this.currentParams) !== JSON.stringify(params)) {
      this.currentRoute = route;
      this.currentParams = params;
      this.navigate(hash, false);
    }
  }

  matchRoute(path) {
    // 精确匹配
    if (this.routes[path]) {
      return { route: this.routes[path], params: {} };
    }
    // 参数化路由匹配 /admin/word-to-sentence/:word
    const adminDetailMatch = path.match(/^\/admin\/word-to-sentence\/(.+)$/);
    if (adminDetailMatch) {
      return { route: 'admin-word-to-sentence-detail', params: { word: decodeURIComponent(adminDetailMatch[1]) } };
    }
    // 参数化路由匹配 /storybook/:id
    const storyDetailMatch = path.match(/^\/storybook\/(.+)$/);
    if (storyDetailMatch) {
      return { route: 'storybook-detail', params: { storyId: decodeURIComponent(storyDetailMatch[1]) } };
    }
    return { route: 'home', params: {} };
  }

  navigate(path, updateHash = true) {
    if (updateHash) {
      window.location.hash = path;
    }

    const { route, params } = this.matchRoute(path);
    this.currentRoute = route;
    this.currentParams = params;

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
    let pageId = route;
    if (route === 'admin-word-to-sentence-detail') {
      pageId = 'admin-word-to-sentence';
    }
    if (route === 'storybook-detail') {
      pageId = 'storybook';
    }
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.initPage(route);
    } else {
      // console.error('未找到页面:', route);
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
      case 'storybook':
        initStorybook();
        break;
      case 'storybook-detail':
        initStorybookDetail(this.currentParams.storyId);
        break;
      case 'playlist':
        initPlaylistPage();
        break;
      case 'progress':
        initProgressPage();
        break;
      case 'admin-word-to-sentence':
        this.currentQuizInstance = initAdminWordList();
        break;
      case 'admin-word-to-sentence-detail':
        this.currentQuizInstance = initAdminWordToSentence(this.currentParams.word);
        break;
      case 'admin-add-word':
        this.currentQuizInstance = initAdminAddWord();
        break;
      case 'admin-dashboard':
        this.currentQuizInstance = initAdminDashboard();
        break;
      case 'admin-english-dialogue':
        this.currentQuizInstance = initAdminEnglishDialogue();
        break;
      case 'admin-storybook':
        this.currentQuizInstance = initAdminStorybook();
        break;
      case 'admin-learning-records':
        this.currentQuizInstance = initAdminLearningRecords();
        break;
    }
  }

  initHomePage() {
    // 初始化首页统计
    this.updateHomeStats();

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
    // 防止重复启动计时器
    if (this.studyTimerStarted) {
      return;
    }
    this.studyTimerStarted = true;

    // 存储已学习的秒数（用于当前会话的实时显示）
    this.sessionStudySeconds = 0;
    this.lastTickTime = Date.now();
    this.isTimerRunning = false;

    // 立即更新一次显示
    this.updateStudyTimeDisplay();

    // 每秒更新显示（使用秒级精度）
    this.studyTimerInterval = setInterval(() => {
      // 只在页面可见时计时
      if (!document.hidden && this.isTimerRunning) {
        const now = Date.now();
        const deltaSeconds = Math.floor((now - this.lastTickTime) / 1000);
        
        if (deltaSeconds > 0) {
          this.sessionStudySeconds += deltaSeconds;
          this.lastTickTime = now;
          
          // 每满60秒，保存到 learningProgress
          if (this.sessionStudySeconds >= 60) {
            const minutesToAdd = Math.floor(this.sessionStudySeconds / 60);
            if (window.learningProgress) {
              window.learningProgress.addStudyTime(minutesToAdd);
            }
            this.sessionStudySeconds = this.sessionStudySeconds % 60;
          }
          
          this.updateStudyTimeDisplay();
        }
      } else {
        // 如果计时器暂停，更新时间基准
        this.lastTickTime = Date.now();
      }
    }, 1000);

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时暂停计时
        this.isTimerRunning = false;
      } else {
        // 页面显示时恢复计时
        this.isTimerRunning = true;
        this.lastTickTime = Date.now();
      }
    });

    // 默认开始计时（如果页面可见）
    if (!document.hidden) {
      this.isTimerRunning = true;
      this.lastTickTime = Date.now();
    }
  }

  updateStudyTimeDisplay() {
    const visitTimeElement = document.getElementById('visit-time');
    if (visitTimeElement && window.learningProgress) {
      const savedMinutes = window.learningProgress.getStudyTime();
      const totalSeconds = savedMinutes * 60 + this.sessionStudySeconds;
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // 格式化显示：HH:MM:SS
      const formattedTime = 
        (hours > 0 ? String(hours).padStart(2, '0') + ':' : '') +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
      
      visitTimeElement.textContent = formattedTime;
    }
  }

  updateHomeStats() {
    // 更新今日积分
    const todayPoints = this.getTodayPoints();
    const todayPointsElement = document.getElementById('today-points');
    if (todayPointsElement) {
      todayPointsElement.textContent = todayPoints;
    }

    // 更新达标徽章显示
    this.updateGoalBadge(todayPoints);
  }

  updateGoalBadge(points) {
    const goalBadge = document.getElementById('goal-badge');
    const pointsCard = goalBadge?.closest('.hero-stat-card');

    if (goalBadge && pointsCard) {
      if (points >= 50) {
        // 显示达标徽章
        goalBadge.style.display = 'flex';
        pointsCard.classList.add('goal-completed');
      } else {
        // 隐藏达标徽章
        goalBadge.style.display = 'none';
        pointsCard.classList.remove('goal-completed');
      }
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

    // 更新达标徽章
    this.updateGoalBadge(pointsData[today]);
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

// 双击Logo进入管理后台（仅PC端）
document.addEventListener('DOMContentLoaded', () => {
  const logoEl = document.querySelector('.fa-graduation-cap')?.closest('.flex.items-center.gap-3');
  if (logoEl) {
    logoEl.addEventListener('dblclick', () => {
      // 检测是否为PC端（屏幕宽度大于768px）
      if (window.innerWidth > 768) {
        router.navigate('/admin');
      }
    });
  }
});

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

    /* 单词造句管理页面样式 */
    .admin-container {
      padding: 1rem 0;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04);
      border: 1px solid rgba(0,0,0,0.05);
    }

    .dark .admin-header {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }

    .admin-word-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .admin-word-info h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .dark .admin-word-info h2 {
      color: #f1f5f9;
    }

    .admin-word-info .word-chinese {
      font-size: 1rem;
      color: #64748b;
      font-weight: 500;
    }

    .dark .admin-word-info .word-chinese {
      color: #94a3b8;
    }

    .word-progress {
      font-size: 0.875rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
    }

    .dark .word-progress {
      color: #94a3b8;
      background: #334155;
    }

    .admin-actions {
      display: flex;
      gap: 0.75rem;
    }

    .admin-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .admin-btn:hover {
      transform: translateY(-1px);
    }

    .generate-btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
    }

    .generate-btn:hover {
      box-shadow: 0 4px 12px rgba(139,92,246,0.3);
    }

    .next-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    .next-btn:hover {
      box-shadow: 0 4px 12px rgba(59,130,246,0.3);
    }

    .edit-btn {
      background: #f1f5f9;
      color: #475569;
    }

    .edit-btn:hover {
      background: #e2e8f0;
    }

    .dark .edit-btn {
      background: #334155;
      color: #cbd5e1;
    }

    .dark .edit-btn:hover {
      background: #475569;
    }

    .update-btn {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
    }

    .cancel-btn {
      background: #f1f5f9;
      color: #475569;
    }

    .add-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .add-btn:hover {
      box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    }

    .admin-section {
      margin-bottom: 1.5rem;
    }

    .admin-section h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dark .admin-section h3 {
      color: #f1f5f9;
    }

    .question-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 0.75rem;
      margin-bottom: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.2s ease;
    }

    .question-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .dark .question-item {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }

    .question-item.editing {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }

    .question-item.generated {
      border-left: 4px solid #f59e0b;
    }

    .question-content {
      flex: 1;
      min-width: 0;
    }

    .question-en {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
      margin-bottom: 0.25rem;
      word-break: break-word;
    }

    .dark .question-en {
      color: #f1f5f9;
    }

    .question-zh {
      font-size: 0.9rem;
      color: #64748b;
      word-break: break-word;
    }

    .dark .question-zh {
      color: #94a3b8;
    }

    .question-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .edit-field {
      margin-bottom: 0.75rem;
    }

    .edit-field label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dark .edit-field label {
      color: #94a3b8;
    }

    .edit-field textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      color: #1e293b;
      background: white;
      resize: vertical;
      font-family: inherit;
    }

    .edit-field textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }

    .dark .edit-field textarea {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }

    .empty-tip {
      text-align: center;
      color: #94a3b8;
      padding: 2rem;
      font-style: italic;
    }

    @media (max-width: 640px) {
      .admin-header {
        flex-direction: column;
        align-items: stretch;
      }

      .admin-actions {
        justify-content: flex-end;
      }

      .question-item {
        flex-direction: column;
      }

      .question-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    /* 单词列表页样式 */
    .search-box {
      position: relative;
      margin-bottom: 0.75rem;
    }

    .search-box .search-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .search-box input {
      width: 100%;
      padding: 0.625rem 0.875rem 0.625rem 2.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      color: #1e293b;
      background: white;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-box input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }

    .dark .search-box input {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }

    .word-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .word-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.125rem;
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.2s ease;
    }

    .word-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .dark .word-item {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }

    .word-item.custom-word {
      border-left: 3px solid #f59e0b;
    }

    .word-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .word-en {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .dark .word-en {
      color: #f1f5f9;
    }

    .word-zh {
      font-size: 0.875rem;
      color: #64748b;
    }

    .dark .word-zh {
      color: #94a3b8;
    }

    .custom-badge {
      font-size: 0.65rem;
      font-weight: 600;
      color: #92400e;
      background: #fef3c7;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .dark .custom-badge {
      color: #fcd34d;
      background: rgba(245,158,11,0.15);
    }

    .word-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .question-count {
      font-size: 0.8rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .dark .question-count {
      color: #94a3b8;
      background: #334155;
    }

    .word-actions {
      display: flex;
      gap: 0.5rem;
    }

    .detail-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      font-size: 0.8rem;
      padding: 0.375rem 0.75rem;
    }

    .detail-btn:hover {
      box-shadow: 0 4px 12px rgba(59,130,246,0.3);
    }

    .delete-btn {
      background: #fee2e2;
      color: #dc2626;
      font-size: 0.8rem;
      padding: 0.375rem 0.75rem;
    }

    .delete-btn:hover {
      background: #fecaca;
    }

    .dark .delete-btn {
      background: rgba(239,68,68,0.15);
      color: #f87171;
    }

    .dark .delete-btn:hover {
      background: rgba(239,68,68,0.25);
    }

    .add-word-btn {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
    }

    .add-word-btn:hover {
      box-shadow: 0 4px 12px rgba(34,197,94,0.3);
    }

    .back-btn {
      background: #f1f5f9;
      color: #475569;
    }

    .back-btn:hover {
      background: #e2e8f0;
    }

    .dark .back-btn {
      background: #334155;
      color: #cbd5e1;
    }

    .dark .back-btn:hover {
      background: #475569;
    }

    @media (max-width: 640px) {
      .word-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .word-meta {
        width: 100%;
        justify-content: space-between;
      }
    }

    /* 添加单词页面样式 */
    .add-word-form {
      background: white;
      border-radius: 1rem;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }

    .dark .add-word-form {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-field label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.375rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dark .form-field label {
      color: #94a3b8;
    }

    .form-field input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: #1e293b;
      background: white;
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .form-field input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }

    .dark .form-field input {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }

    .form-actions {
      display: flex;
      justify-content: flex-start;
    }

    .section-header-with-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .section-header-with-actions h3 {
      margin-bottom: 0 !important;
    }

    .regenerate-btn {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
      font-size: 0.8rem;
      padding: 0.375rem 0.75rem;
    }

    .regenerate-btn:hover {
      box-shadow: 0 4px 12px rgba(6,182,212,0.3);
    }

    .save-edit-btn {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      font-size: 0.8rem;
      padding: 0.375rem 0.75rem;
    }

    .confirm-section {
      display: flex;
      justify-content: center;
      padding: 1rem 0;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      font-size: 1rem;
      padding: 0.75rem 2rem;
      border-radius: 0.75rem;
    }

    .confirm-btn:hover {
      box-shadow: 0 4px 12px rgba(34,197,94,0.3);
    }

    /* 加载和错误状态 */
    .loading-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
      color: #64748b;
      font-size: 0.95rem;
    }

    .dark .loading-indicator {
      background: #1e293b;
      border-color: rgba(255,255,255,0.05);
      color: #94a3b8;
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .dark .loading-spinner {
      border-color: #334155;
      border-top-color: #60a5fa;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      padding: 0.75rem 1rem;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dark .error-message {
      background: rgba(239,68,68,0.15);
      color: #fca5a5;
    }

    .admin-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    /* 确认成功页 */
    .confirm-success {
      text-align: center;
      padding: 2rem 0;
    }

    .confirm-success .success-icon {
      font-size: 3rem;
      color: #22c55e;
      margin-bottom: 1rem;
    }

    .confirm-success h3 {
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
      color: #22c55e;
    }

    .confirm-success p {
      margin: 0.5rem 0;
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .confirm-success code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #e11d48;
    }

    .dark .confirm-success p { color: #94a3b8; }
    .dark .confirm-success code { background: #334155; color: #fb7185; }

    .code-snippet-wrapper {
      margin: 1.5rem 0;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .dark .code-snippet-wrapper { border-color: #334155; }

    .code-snippet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.85rem;
      color: #64748b;
    }

    .dark .code-snippet-header { background: #1e293b; border-color: #334155; color: #94a3b8; }

    .copy-code-btn {
      padding: 4px 12px !important;
      font-size: 0.8rem !important;
      background: #3b82f6 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
    }

    .copy-code-btn:hover { background: #2563eb !important; }

    pre.code-snippet {
      margin: 0;
      padding: 1rem;
      background: #1e293b;
      color: #e2e8f0;
      font-size: 0.8rem;
      line-height: 1.6;
      overflow-x: auto;
      white-space: pre;
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .confirm-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    /* ========== Admin Dashboard ========== */
    .admin-dashboard {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem 0;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .dashboard-header h2 i {
      color: #64748b;
      margin-right: 0.5rem;
    }

    .dark .dashboard-header h2 { color: #f1f5f9; }

    .dashboard-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .dashboard-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      background: white;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dashboard-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      border-color: #cbd5e1;
    }

    .dark .dashboard-card {
      background: #1e293b;
      border-color: #334155;
    }

    .dark .dashboard-card:hover {
      border-color: #475569;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }

    .dashboard-card .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dashboard-card .card-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .dashboard-card .card-body {
      flex: 1;
      min-width: 0;
    }

    .dashboard-card .card-body h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .dashboard-card .card-body p {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .dark .dashboard-card .card-body h3 { color: #f1f5f9; }
    .dark .dashboard-card .card-body p { color: #94a3b8; }

    .dashboard-card .card-arrow {
      color: #94a3b8;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .dashboard-card:hover .card-arrow { color: #3b82f6; }

    /* 对话题目选项样式 */
    .question-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .dialogue-option {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 0.85rem;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .dialogue-option.correct-option {
      background: #dcfce7;
      color: #166534;
      border-color: #86efac;
      font-weight: 600;
    }

    .dark .dialogue-option { background: #334155; color: #cbd5e1; border-color: #475569; }
    .dark .dialogue-option.correct-option { background: #14532d; color: #86efac; border-color: #166534; }

    .edit-option-field {
      margin-top: 0.25rem;
    }

    .edit-option-field input {
      width: 100%;
    }

    .section-desc {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .dark .section-desc { color: #94a3b8; }

    /* 难度选择器 */
    .difficulty-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0.75rem 0;
    }

    .difficulty-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #475569;
    }

    .dark .difficulty-label { color: #cbd5e1; }

    .difficulty-options {
      display: flex;
      gap: 0.5rem;
    }

    .difficulty-btn {
      padding: 6px 20px;
      border-radius: 20px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dark .difficulty-btn {
      background: #1e293b;
      border-color: #334155;
      color: #94a3b8;
    }

    .difficulty-btn.difficulty-easy.active {
      background: #22c55e;
      border-color: #22c55e;
      color: white;
    }

    .difficulty-btn.difficulty-medium.active {
      background: #f59e0b;
      border-color: #f59e0b;
      color: white;
    }

    .difficulty-btn.difficulty-hard.active {
      background: #ef4444;
      border-color: #ef4444;
      color: white;
    }

    .difficulty-btn:hover:not(.active) {
      border-color: #94a3b8;
    }

    .difficulty-options {
      display: flex;
      gap: 0.6rem;
    }

    /* 对话出题控制区 */
    .dialogue-controls {
      padding: 0;
    }

    .control-row {
      display: flex;
      align-items: flex-end;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .control-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }

    .dark .control-label { color: #cbd5e1; }

    .control-hint {
      font-weight: 400;
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .focus-words-input {
      padding: 6px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      width: 100%;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .focus-words-input:focus {
      border-color: #3b82f6;
    }

    .dark .focus-words-input {
      background: #1e293b;
      border-color: #334155;
      color: #f1f5f9;
    }

    .control-action {
      justify-content: flex-end;
      margin-left: auto;
    }

    /* 编辑选项行（带radio） */
    .edit-option-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.3rem;
    }

    .edit-option-row input[type="radio"] {
      width: 18px;
      height: 18px;
      accent-color: #22c55e;
      cursor: pointer;
      flex-shrink: 0;
    }

    .option-letter {
      font-weight: 700;
      color: #3b82f6;
      min-width: 16px;
      font-size: 0.9rem;
    }

    .edit-option-row input[type="text"] {
      flex: 1;
      padding: 5px 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .dark .edit-option-row input[type="text"] {
      background: #1e293b;
      border-color: #334155;
      color: #f1f5f9;
    }

    .edit-hint {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0.25rem 0 0 0;
    }
  `;
  document.head.appendChild(style);
}


