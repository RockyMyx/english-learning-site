// 管理员后台首页
export class AdminDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="admin-dashboard">
        <div class="dashboard-header">
          <h2><i class="fas fa-shield-alt"></i> 管理后台</h2>
          <button class="admin-btn back-btn" id="dashboard-back">
            <i class="fas fa-arrow-left"></i> 返回首页
          </button>
        </div>

        <div class="dashboard-cards">
          <div class="dashboard-card" data-target="/admin/word-to-sentence">
            <div class="card-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
              <i class="fas fa-spell-check"></i>
            </div>
            <div class="card-body">
              <h3>单词造句</h3>
              <p>管理单词造句题库，新增单词、编辑题目</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <div class="dashboard-card" data-target="/admin/english-dialogue">
            <div class="card-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
              <i class="fas fa-comments"></i>
            </div>
            <div class="card-body">
              <h3>英文对话</h3>
              <p>管理英文对话内容与场景配置</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <div class="dashboard-card" data-target="">
            <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
              <i class="fas fa-book-open"></i>
            </div>
            <div class="card-body">
              <h3>绘本故事</h3>
              <p>管理绘本故事内容与配套练习</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <div class="dashboard-card" data-target="">
            <div class="card-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-body">
              <h3>学习记录</h3>
              <p>查看学习数据统计与进度报告</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backBtn = this.container.querySelector('#dashboard-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.router.navigate('/');
      });
    }

    this.container.querySelectorAll('.dashboard-card').forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.target;
        if (target) {
          window.router.navigate(target);
        }
      });
    });
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

export function initAdminDashboard() {
  const dashboard = new AdminDashboard('admin-dashboard-content');
  dashboard.init();
  return dashboard;
}
