# 快速启动指南

## 🔍 问题排查：样式没有显示

如果您发现页面样式没有显示，请尝试以下方法：

### 方法1：使用测试页面（推荐）
直接在浏览器中打开 `test.html` 文件，这是一个包含完整样式的测试版本。

```bash
# 在浏览器中打开
start test.html  # Windows
open test.html   # Mac
xdg-open test.html # Linux
```

### 方法2：安装依赖并运行开发服务器

1. **安装Node.js依赖**：
```bash
npm install
```

2. **启动开发服务器**：
```bash
npm run dev
```

3. **在浏览器中访问**：
   - 通常是 `http://localhost:5173`
   - 或查看终端输出的本地地址

### 方法3：直接构建并查看

1. **构建项目**：
```bash
npm run build
```

2. **预览构建结果**：
```bash
npm run preview
```

3. **访问预览地址**

## 📁 文件说明

- `test.html` - 独立的测试页面，包含所有样式，可以直接打开
- `index.html` - 主页面，需要通过Vite服务器运行
- `src/assets/styles.css` - 所有样式定义
- `src/main.js` - 主要JavaScript逻辑

## 🎨 样式特点

- 紫色渐变主题（#667eea 到 #764ba2）
- 卡片式布局
- 响应式设计
- 悬停动画效果
- 现代化UI设计

## 🛠️ 如果样式仍然不显示

1. **检查浏览器控制台**：
   - 按F12打开开发者工具
   - 查看Console标签页是否有错误信息

2. **检查网络请求**：
   - 在Network标签页中查看CSS文件是否加载成功

3. **清除缓存**：
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

4. **检查文件路径**：
   - 确保styles.css文件在正确的位置
   - 文件路径：`./src/assets/styles.css`

## 📱 测试页面功能

`test.html` 包含：
- ✅ 完整的样式渲染
- ✅ 导航栏交互
- ✅ 学习模式卡片
- ✅ 单词发音演示
- ✅ 响应式布局
- ✅ 统计数据显示

**建议：先打开 `test.html` 查看效果，确认样式正常后，再使用完整版本！**