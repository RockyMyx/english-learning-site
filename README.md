# 英语学习

一个专门为小学生设计的英语单词和句型学习网站，包含多种学习模式和互动练习。

## 🎯 功能特点

### 学习模式
- **随身听模式** - 支持后台播放、锁屏继续、自由组合播放列表
- **训练模式** - 跟读练习、可配置重复次数、自动播放
- **看英文选中文** - 看英文单词选择正确的中文意思
- **看中文选英文** - 看中文意思选择正确的英文单词
- **听读音选中文** - 听英文发音选择对应的中文意思
- **英文对话** - 听英文句子选择符合对话内容的英文回答，题目和答案都是有意义的对话组合

### 核心功能
- 📚 包含100+个小学英语单词和句型
- 🔊 使用浏览器内置语音合成进行发音
- 📊 学习进度跟踪和统计
- 🎵 自定义播放列表
- 🏆 学习成就系统
- 📱 响应式设计，支持手机和平板

## 🚀 快速开始

### 安装依赖
```bash
cd elementary-english-learning
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📖 项目结构

```
elementary-english-learning/
├── index.html              # 主HTML文件
├── package.json            # 项目配置
├── vite.config.js         # Vite配置
├── src/
│   ├── main.js            # 应用入口
│   ├── assets/
│   │   └── styles.css     # 全局样式
│   ├── pages/             # 各个页面模块
│   │   ├── listeningMode.js    # 随身听模式
│   │   ├── trainingMode.js     # 训练模式
│   │   ├── quizMode.js         # 测试模式（通用）
│   │   ├── playlistPage.js     # 播放列表页面
│   │   └── progressPage.js     # 学习进度页面
│   └── utils/             # 工具函数
│       ├── vocabulary.js  # 单词和句型数据
│       └── audio.js       # 音频播放功能
```

## 📚 学习内容

网站包含以下分类的单词和句型：

- **数字** - one, two, three... ten
- **颜色** - red, blue, green, yellow...
- **动作** - listen, look, jump, swim...
- **食物** - cake, milk, egg, fruit...
- **身体部位** - eye, mouth, hand, leg...
- **动物** - cat, dog, bird, tiger...
- **家庭成员** - mother, father, sister...
- **形容词** - big, small, happy, sad...
- **句型** - What's your name?, How old are you?, Thank you...

## 🎮 使用说明

1. **首页** - 选择你想要的学习模式
2. **随身听模式** - 听发音、看意思，适合通勤时使用
3. **训练模式** - 跟读练习，可以标记已掌握或需加强
4. **测试模式** - 四选一的题目，测试学习效果
5. **我的播放列表** - 自定义要学习的单词
6. **学习进度** - 查看学习统计和成就

## 🛠️ 技术栈

- **前端框架**: 原生JavaScript (ES6+)
- **构建工具**: Vite
- **样式**: CSS3 + Flexbox + Grid
- **发音**: Web Speech API
- **数据存储**: LocalStorage

## 📱 浏览器支持

- Chrome/Edge (推荐)
- Firefox
- Safari
- 移动端浏览器

## 🎨 特色设计

- 渐变色主题设计
- 卡片式布局
- 平滑的动画效果
- 响应式设计
- 直观的用户界面

## 📝 学习数据

所有学习数据都保存在浏览器的LocalStorage中，包括：
- 学习进度
- 掌握程度
- 学习历史
- 成就解锁
- 自定义播放列表

数据可以导出为JSON文件进行备份。

## 🌟 未来规划

- [ ] 添加更多学习内容
- [ ] 支持自定义单词导入
- [ ] 添加学习提醒功能
- [ ] 优化发音效果
- [ ] 添加学习统计图表
- [ ] 支持多用户切换

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交问题和改进建议！

---

**祝学习愉快！🎓✨**