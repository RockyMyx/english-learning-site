import { getAllWords } from '../utils/vocabulary.js';

export function initProgressPage() {
  const content = document.getElementById('progress-content');

  content.innerHTML = `
    <div class="progress-page">
      <div class="progress-overview">
        <h3>📊 学习进度概览</h3>
        <div class="progress-summary">
          <div class="progress-stat">
            <div class="stat-value" id="total-words-count">0</div>
            <div class="stat-label">总词汇量</div>
          </div>
          <div class="progress-stat">
            <div class="stat-value" id="learned-words-count">0</div>
            <div class="stat-label">已学单词</div>
          </div>
          <div class="progress-stat">
            <div class="stat-value" id="mastered-words-count">0</div>
            <div class="stat-label">已掌握</div>
          </div>
          <div class="progress-stat">
            <div class="stat-value" id="study-streak">0</div>
            <div class="stat-label">连续学习天数</div>
          </div>
        </div>
      </div>

      <div class="progress-details">
        <h3>📈 详细统计</h3>

        <div class="progress-section">
          <h4>学习活跃度</h4>
          <div class="activity-chart" id="activity-chart"></div>
        </div>

        <div class="progress-section">
          <h4>单词掌握程度</h4>
          <div class="mastery-levels">
            <div class="mastery-item">
              <div class="mastery-label">🟢 已掌握</div>
              <div class="mastery-bar">
                <div class="mastery-fill mastered" id="mastered-bar"></div>
              </div>
              <div class="mastery-count" id="mastered-count">0</div>
            </div>
            <div class="mastery-item">
              <div class="mastery-label">🟡 学习中</div>
              <div class="mastery-bar">
                <div class="mastery-fill learning" id="learning-bar"></div>
              </div>
              <div class="mastery-count" id="learning-count">0</div>
            </div>
            <div class="mastery-item">
              <div class="mastery-label">🔴 未学习</div>
              <div class="mastery-bar">
                <div class="mastery-fill not-learned" id="not-learned-bar"></div>
              </div>
              <div class="mastery-count" id="not-learned-count">0</div>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <h4>学习记录</h4>
          <div class="study-history" id="study-history"></div>
        </div>

        <div class="progress-section">
          <h4>学习成就</h4>
          <div class="achievements" id="achievements"></div>
        </div>
      </div>

      <div class="progress-actions">
        <button class="action-btn" id="export-progress">📥 导出学习数据</button>
        <button class="action-btn" id="reset-progress">🔄 重置进度</button>
      </div>
    </div>
  `;

  loadProgressData();
  setupEventListeners();
}

function loadProgressData() {
  const allWords = getAllWords();
  const progressData = loadProgressFromStorage();

  // 更新概览数据
  document.getElementById('total-words-count').textContent = allWords.length;
  document.getElementById('learned-words-count').textContent = progressData.learnedWords?.size || 0;
  document.getElementById('mastered-words-count').textContent = progressData.masteredWords?.size || 0;
  document.getElementById('study-streak').textContent = calculateStudyStreak(progressData);

  // 更新掌握程度
  updateMasteryLevels(allWords.length, progressData);

  // 更新活跃度图表
  updateActivityChart(progressData);

  // 更新学习记录
  updateStudyHistory(progressData);

  // 更新成就
  updateAchievements(progressData);
}

function loadProgressFromStorage() {
  const defaultProgress = {
    learnedWords: new Set(),
    masteredWords: new Set(),
    studyHistory: [],
    achievements: [],
    startDate: Date.now()
  };

  try {
    const savedProgress = localStorage.getItem('studyProgress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      return {
        ...defaultProgress,
        ...parsed,
        learnedWords: new Set(parsed.learnedWords || []),
        masteredWords: new Set(parsed.masteredWords || [])
      };
    }
  } catch (error) {
    console.error('加载进度数据失败:', error);
  }

  return defaultProgress;
}

function calculateStudyStreak(progressData) {
  if (!progressData.studyHistory || progressData.studyHistory.length === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  // 检查连续学习天数
  for (let i = 0; i < 365; i++) { // 最多检查一年
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasStudyOnDay = progressData.studyHistory.some(record =>
      record.date === dateStr && record.wordsLearned > 0
    );

    if (hasStudyOnDay) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i === 0) {
      // 今天没有学习，检查昨天
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
}

function updateMasteryLevels(totalWords, progressData) {
  const masteredCount = progressData.masteredWords?.size || 0;
  const learnedCount = progressData.learnedWords?.size || 0;
  const learningCount = learnedCount - masteredCount;
  const notLearnedCount = totalWords - learnedCount;

  document.getElementById('mastered-count').textContent = masteredCount;
  document.getElementById('learning-count').textContent = learningCount;
  document.getElementById('not-learned-count').textContent = notLearnedCount;

  // 更新进度条
  const masteredPercentage = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;
  const learningPercentage = totalWords > 0 ? (learningCount / totalWords) * 100 : 0;
  const notLearnedPercentage = totalWords > 0 ? (notLearnedCount / totalWords) * 100 : 0;

  document.getElementById('mastered-bar').style.width = masteredPercentage + '%';
  document.getElementById('learning-bar').style.width = learningPercentage + '%';
  document.getElementById('not-learned-bar').style.width = notLearnedPercentage + '%';
}

function updateActivityChart(progressData) {
  const chartContainer = document.getElementById('activity-chart');
  const studyHistory = progressData.studyHistory || [];

  // 获取最近7天的数据
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayData = studyHistory.find(record => record.date === dateStr);
    last7Days.push({
      date: dateStr,
      wordsLearned: dayData?.wordsLearned || 0,
      quizScore: dayData?.quizScore || 0
    });
  }

  // 渲染图表
  chartContainer.innerHTML = `
    <div class="chart-bars">
      ${last7Days.map(day => `
        <div class="chart-bar-container">
          <div class="chart-bar" style="height: ${Math.min(day.wordsLearned * 5, 100)}%">
            <div class="bar-tooltip">
              ${day.date}<br>
              学习: ${day.wordsLearned}词<br>
              测试: ${day.quizScore}分
            </div>
          </div>
          <div class="bar-label">${formatDate(day.date)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function updateStudyHistory(progressData) {
  const historyContainer = document.getElementById('study-history');
  const studyHistory = (progressData.studyHistory || []).slice(-10).reverse();

  if (studyHistory.length === 0) {
    historyContainer.innerHTML = '<p class="no-data">暂无学习记录</p>';
    return;
  }

  historyContainer.innerHTML = `
    <div class="history-list">
      ${studyHistory.map(record => `
        <div class="history-item">
          <div class="history-date">${formatDate(record.date)}</div>
          <div class="history-details">
            <span>学习 ${record.wordsLearned} 个单词</span>
            <span>测试得分: ${record.quizScore}</span>
            <span>学习时长: ${formatDuration(record.duration)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function updateAchievements(progressData) {
  const achievementsContainer = document.getElementById('achievements');
  const achievements = progressData.achievements || [];

  const allAchievements = [
    { id: 'first_step', name: '初学者', description: '完成第一次学习', icon: '🌟', unlocked: achievements.includes('first_step') },
    { id: 'streak_7', name: '坚持一周', description: '连续学习7天', icon: '🔥', unlocked: achievements.includes('streak_7') },
    { id: 'words_50', name: '词汇达人', description: '学习50个单词', icon: '📚', unlocked: achievements.includes('words_50') },
    { id: 'master_10', name: '熟练掌握', description: '掌握10个单词', icon: '💯', unlocked: achievements.includes('master_10') },
    { id: 'quiz_perfect', name: '满分王者', description: '测试获得满分', icon: '🏆', unlocked: achievements.includes('quiz_perfect') },
    { id: 'streak_30', name: '月度冠军', description: '连续学习30天', icon: '👑', unlocked: achievements.includes('streak_30') }
  ];

  achievementsContainer.innerHTML = `
    <div class="achievement-grid">
      ${allAchievements.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function setupEventListeners() {
  document.getElementById('export-progress').addEventListener('click', exportProgress);
  document.getElementById('reset-progress').addEventListener('click', resetProgress);
}

function exportProgress() {
  const progressData = loadProgressFromStorage();
  const exportData = {
    ...progressData,
    learnedWords: Array.from(progressData.learnedWords),
    masteredWords: Array.from(progressData.masteredWords),
    exportDate: new Date().toISOString()
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `english-learning-progress-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetProgress() {
  if (confirm('确定要重置所有学习进度吗？此操作不可恢复！')) {
    localStorage.removeItem('studyProgress');
    localStorage.removeItem('trainingProgress');
    alert('学习进度已重置');
    loadProgressData();
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

function formatDuration(seconds) {
  if (!seconds) return '0分钟';
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}分钟` : '不到1分钟';
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .progress-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .progress-overview {
    text-align: center;
    margin-bottom: 3rem;
  }

  .progress-overview h3 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .progress-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }

  .progress-stat {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 1rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .progress-details h3 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }

  .progress-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .progress-section h4 {
    margin-bottom: 1.5rem;
    color: #667eea;
  }

  /* 活跃度图表 */
  .chart-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    padding-top: 2rem;
  }

  .chart-bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 80px;
  }

  .chart-bar {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    position: relative;
    min-height: 4px;
    transition: height 0.3s ease;
  }

  .bar-tooltip {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .chart-bar:hover .bar-tooltip {
    opacity: 1;
  }

  .bar-label {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #666;
  }

  /* 掌握程度 */
  .mastery-levels {
    space-y: 1.5rem;
  }

  .mastery-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .mastery-label {
    width: 100px;
    font-weight: 500;
    color: #333;
  }

  .mastery-bar {
    flex: 1;
    height: 24px;
    background: #e9ecef;
    border-radius: 12px;
    overflow: hidden;
  }

  .mastery-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .mastery-fill.mastered {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  }

  .mastery-fill.learning {
    background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  }

  .mastery-fill.not-learned {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  }

  .mastery-count {
    width: 50px;
    text-align: right;
    font-weight: bold;
    color: #667eea;
  }

  /* 学习记录 */
  .history-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .history-date {
    font-weight: bold;
    color: #667eea;
    width: 100px;
  }

  .history-details {
    flex: 1;
    display: flex;
    gap: 1.5rem;
    color: #666;
    font-size: 0.9rem;
  }

  .no-data {
    text-align: center;
    color: #999;
    padding: 2rem;
  }

  /* 成就 */
  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .achievement-card {
    text-align: center;
    padding: 1.5rem 1rem;
    border-radius: 8px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
  }

  .achievement-card.unlocked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
  }

  .achievement-card.locked {
    background: #f8f9fa;
    opacity: 0.6;
  }

  .achievement-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .achievement-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .achievement-description {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  /* 操作按钮 */
  .progress-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .action-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    background: white;
    color: #667eea;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .action-btn:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;
document.head.appendChild(style);