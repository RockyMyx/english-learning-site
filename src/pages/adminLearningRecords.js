import learningRecords, { getRecords, getRecordStats, clearRecords } from '../utils/learningRecords.js';

// 管理后台 - 学习记录页面
export class AdminLearningRecords {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const records = getRecords();
    const stats = getRecordStats();

    this.container.innerHTML = `
      <div class="admin-dashboard">
        <div class="dashboard-header">
          <h2><i class="fas fa-chart-line"></i> 学习记录</h2>
          <div style="display:flex;gap:0.5rem;">
            <button class="admin-btn back-btn" id="records-back">
              <i class="fas fa-arrow-left"></i> 返回
            </button>
            <button class="admin-btn" id="records-clear" style="background:#fee2e2;color:#dc2626;">
              <i class="fas fa-trash-alt"></i> 清空记录
            </button>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin-bottom:1.5rem;">
          <div style="background:white;border-radius:0.75rem;padding:1rem;text-align:center;border:1px solid rgba(0,0,0,0.05);">
            <div style="font-size:1.5rem;font-weight:700;color:#3b82f6;">${stats.total}</div>
            <div style="font-size:0.8rem;color:#64748b;">总答题数</div>
          </div>
          <div style="background:white;border-radius:0.75rem;padding:1rem;text-align:center;border:1px solid rgba(0,0,0,0.05);">
            <div style="font-size:1.5rem;font-weight:700;color:#22c55e;">${stats.correct}</div>
            <div style="font-size:0.8rem;color:#64748b;">正确</div>
          </div>
          <div style="background:white;border-radius:0.75rem;padding:1rem;text-align:center;border:1px solid rgba(0,0,0,0.05);">
            <div style="font-size:1.5rem;font-weight:700;color:#ef4444;">${stats.incorrect}</div>
            <div style="font-size:0.8rem;color:#64748b;">错误</div>
          </div>
          <div style="background:white;border-radius:0.75rem;padding:1rem;text-align:center;border:1px solid rgba(0,0,0,0.05);">
            <div style="font-size:1.5rem;font-weight:700;color:#f59e0b;">${stats.accuracy}%</div>
            <div style="font-size:0.8rem;color:#64748b;">正确率</div>
          </div>
        </div>

        <!-- 记录表格 -->
        <div style="background:white;border-radius:1rem;overflow:hidden;border:1px solid rgba(0,0,0,0.05);">
          ${records.length === 0 ? `
            <div style="text-align:center;padding:3rem;color:#94a3b8;">
              <i class="fas fa-inbox" style="font-size:2.5rem;margin-bottom:1rem;display:block;"></i>
              <p>暂无学习记录</p>
            </div>
          ` : `
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                <thead>
                  <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
                    <th style="padding:0.75rem 1rem;text-align:left;color:#64748b;font-weight:600;">序号</th>
                    <th style="padding:0.75rem 1rem;text-align:left;color:#64748b;font-weight:600;">学习模块</th>
                    <th style="padding:0.75rem 1rem;text-align:left;color:#64748b;font-weight:600;">学习题目</th>
                    <th style="padding:0.75rem 1rem;text-align:left;color:#64748b;font-weight:600;">回答结果</th>
                    <th style="padding:0.75rem 1rem;text-align:left;color:#64748b;font-weight:600;">学习时间</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.slice().reverse().map((r, i) => `
                    <tr style="border-bottom:1px solid #f1f5f9;transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
                      <td style="padding:0.625rem 1rem;color:#94a3b8;">${records.length - i}</td>
                      <td style="padding:0.625rem 1rem;">
                        <span style="display:inline-block;padding:2px 10px;border-radius:6px;font-size:0.8rem;font-weight:600;background:#eff6ff;color:#2563eb;">${this.getModuleLabel(r.module)}</span>
                      </td>
                      <td style="padding:0.625rem 1rem;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this.escapeHtml(r.question)}">${this.escapeHtml(r.question)}</td>
                      <td style="padding:0.625rem 1rem;">
                        ${r.result === 'correct'
                          ? '<span style="display:inline-flex;align-items:center;gap:4px;color:#16a34a;font-weight:600;"><i class="fas fa-check-circle"></i> 正确</span>'
                          : '<span style="display:inline-flex;align-items:center;gap:4px;color:#dc2626;font-weight:600;"><i class="fas fa-times-circle"></i> 错误</span>'
                        }
                      </td>
                      <td style="padding:0.625rem 1rem;color:#64748b;font-size:0.85rem;">${r.time}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    // 暗色模式适配
    this.applyDarkMode();
  }

  applyDarkMode() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      this.container.querySelectorAll('[style*="background:white"]').forEach(el => {
        el.style.background = '#1e293b';
        el.style.borderColor = 'rgba(255,255,255,0.05)';
      });
      this.container.querySelectorAll('th[style]').forEach(el => {
        el.style.background = '#0f172a';
        el.style.borderBottomColor = '#334155';
        el.style.color = '#94a3b8';
      });
      this.container.querySelectorAll('td[style]').forEach(el => {
        if (el.style.color === '#64748b' || el.style.color === '#94a3b8') {
          el.style.color = '#94a3b8';
        }
      });
      const table = this.container.querySelector('table');
      if (table) {
        table.style.color = '#f1f5f9';
      }
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  getModuleLabel(module) {
    const labels = {
      'english-to-chinese': '看英文选中文',
      'chinese-to-english': '看中文选英文',
      'listening-to-chinese': '听读音选中文',
      'english-dialogue': '英文对话',
      'word-to-sentence': '单词造句',
      'listening': '单词听写'
    };
    return labels[module] || module || '未知';
  }

  bindEvents() {
    const backBtn = this.container.querySelector('#records-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.router.navigate('/admin');
      });
    }

    const clearBtn = this.container.querySelector('#records-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有学习记录吗？清空后系统将重新开始新一轮练习。')) {
          clearRecords();
          this.render();
          this.bindEvents();
        }
      });
    }
  }

  cleanup() {
    this.container.innerHTML = '';
  }
}

export function initAdminLearningRecords() {
  const page = new AdminLearningRecords('admin-learning-records-content');
  page.init();
  return page;
}
