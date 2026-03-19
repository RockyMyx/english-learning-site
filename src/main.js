// 主应用程序入口
import { getAllWords } from './utils/vocabulary.js';

// 导入各个页面模块
import { initListeningMode } from './pages/listeningMode.js';
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
        initEnglishToChineseMode();
        break;
      case 'chinese-to-english':
        initChineseToEnglishMode();
        break;
      case 'listening-to-chinese':
        initListeningToChineseMode();
        break;
      case 'english-dialogue':
        initEnglishDialogueMode();
        break;
      case 'word-to-sentence':
        initWordToSentenceMode();
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

    // 开始访问时间计时
    this.startVisitTimer();

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

  startVisitTimer() {
    // 初始化访问时间
    let visitTime = parseInt(localStorage.getItem('visitTime') || '0');
    let lastVisitTime = parseInt(localStorage.getItem('lastVisitTime') || Date.now());

    // 计算上次访问的时长
    const timeDiff = Math.floor((Date.now() - lastVisitTime) / 1000 / 60); // 转换为分钟
    if (timeDiff < 60) { // 如果上次访问在1小时内，累计时间
      visitTime += timeDiff;
    } else {
      visitTime = 0; // 超过1小时，重新开始计时
    }

    // 更新显示
    this.updateVisitTimeDisplay(visitTime);

    // 开始计时器
    setInterval(() => {
      visitTime++;
      localStorage.setItem('visitTime', visitTime.toString());
      localStorage.setItem('lastVisitTime', Date.now().toString());
      this.updateVisitTimeDisplay(visitTime);
    }, 60000); // 每分钟更新一次

    // 保存当前时间
    localStorage.setItem('lastVisitTime', Date.now().toString());
  }

  updateVisitTimeDisplay(minutes) {
    const visitTimeElement = document.getElementById('visit-time');
    if (visitTimeElement) {
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

  addPoints(points) {
    const today = new Date().toISOString().split('T')[0];
    const pointsData = JSON.parse(localStorage.getItem('pointsData') || '{}');
    pointsData[today] = (pointsData[today] || 0) + points;
    localStorage.setItem('pointsData', JSON.stringify(pointsData));

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

  console.log('🎓 小学英语学习应用已启动！');
});

// 全局样式补充
function addGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* 额外的全局样式 */
    .audio-button {
      background: #667eea;
      color: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .audio-button:hover {
      background: #764ba2;
      transform: scale(1.1);
    }

    .audio-option-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      transition: transform 0.2s ease;
    }

    .audio-option-button:hover {
      transform: scale(1.2);
    }

    .quiz-feedback {
      text-align: center;
      font-weight: bold;
      padding: 0.5rem;
      border-radius: 4px;
    }

    .quiz-feedback.correct {
      color: #28a745;
      background: #d4edda;
    }

    .quiz-feedback.incorrect {
      color: #dc3545;
      background: #f8d7da;
    }

    /* 播放列表样式补充 */
    .playlist-item.active {
      background: #f0f4ff;
      border-left: 3px solid #667eea;
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
      background: #667eea;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #764ba2;
    }
  `;
  document.head.appendChild(style);
}


