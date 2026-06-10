// ============================================================
// 大模型API配置
// 密钥等敏感信息从.env文件中读取，不要直接写在代码里
// ============================================================

export const llmConfig = {
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 2000,
};

// ============================================================
// 共享知识库配置（词汇、句型、语法范围）
// 数据从 sentenceData.js 和 vocabularyData.js 动态读取
// 只需维护数据文件，此处自动同步
// ============================================================

import { wordSentenceData } from '../data/sentenceData.js';
import { sentencePatterns } from '../data/vocabularyData.js';

// 从 wordSentenceData 动态生成词汇范围文本
function buildVocabularyText() {
  const words = wordSentenceData.map(item => `${item.word}(${item.wordChinese})`);
  return `【词汇范围】共 ${words.length} 个单词\n${words.join('、')}`;
}

// 从 sentencePatterns 动态生成句型范围文本
function buildSentencePatternsText() {
  const patterns = sentencePatterns.map(s => `- ${s}`);
  return `【句型范围】[...]代表【词汇范围】中的某个单词\n${patterns.join('\n')}`;
}

export const knowledgeBase = {
  get vocabulary() { return buildVocabularyText(); },
  get sentencePatterns() { return buildSentencePatternsText(); },

  grammar: `【语法范围】
- 一般现在时：I like / I have / I can / I don't like
- 祈使句：Look at / Point to / Pass me / Open / Close / Be quiet
- 一般疑问句：Can you...? / Is she/he/it...? / Have you got...? / Do you like...?
- 特殊疑问句：How many...? / What color...? / Where is...? / What's this?
- 描述句：The cat is big. / My bag is blue. / It has got four legs.
- 感叹句：Look at the big tiger!
- Have/Has got 句型：I've got a sister. / It has got four legs.
- Can 句型：I can jump. / A bird can fly.
- 现在进行时：What are you doing? / I'm walking. / She is reading.
- 方位表达：in / on / under / next to
- 指示代词：this / that / these / those
- 主格宾格：I-me / he-him / she-her / they-them / we-us`,

  dialogueOutputFormat: `【输出格式】
严格按照JSON数组格式输出，每个元素包含 question、correctAnswer、options 三个字段。
options 是包含4个选项的数组，correctAnswer 必须是 options 中的一个。
不要输出任何其他内容，只输出JSON数组。`,

  sentenceOutputFormat: `【输出格式】
严格按照JSON数组格式输出，每个元素包含english和chinese两个字段。
不要输出任何其他内容，只输出JSON数组。`,
};

// ============================================================
// 单词造句出题提示词配置
// ============================================================

export const promptConfig = {
  systemPrompt: `你是一个小学英语出题老师，专门为中国小学生生成英语造句练习题。

【核心规则】
1. 所有句子必须是小学水平的简单英语，词汇和语法要适合7-9岁的孩子
2. 句子要贴近孩子的日常生活场景（学校、家庭、动物、食物、玩具、身体部位等）
3. 句型要多样化，在【句型范围】内灵活组合【语法范围】中的语法点
4. 可以选择是否结合语法：现在进行时
5. 每个句子都要自然、通顺、语法正确
6. 中文翻译要准确、自然，符合中文表达习惯
7. 句子长度控制在5-12个英文单词
8. 不要重复相同的句型结构

${knowledgeBase.vocabulary}

${knowledgeBase.sentencePatterns}

${knowledgeBase.grammar}

${knowledgeBase.sentenceOutputFormat}
示例：
[
  {"english": "I have a red cat.", "chinese": "我有一只红色的猫。"},
  {"english": "Look at the big dog!", "chinese": "看那只大狗！"}
]`,

  userPromptTemplate: `请为单词「{word}」（{wordZh}）生成{count}道英语造句练习题。

要求：
1. 每道题包含一个包含「{word}」的英文句子和对应的中文翻译
2. 句型要多样化，尽可能覆盖不同的语法结构
3. 可以结合其他已知单词进行灵活组合
4. 确保每个句子都语法正确、表达自然

直接输出JSON数组，不要输出其他内容。`,

  defaultCount: 10,
};

// ============================================================
// 英文对话出题提示词配置（按难度分级）
// ============================================================

export const dialoguePromptConfig = {
  defaultCount: 10,

  difficultyLevels: {
    easy: {
      label: '简单',
      systemPrompt: `你是一个小学英语出题老师，专门为中国小学生生成【简单难度】的英语对话选择题。

【简单难度特征】
- 句子简短（1-6个单词），词汇基础
- 直接问答，不需要推理
- 题目类型包括：
  1. 简单问答："What's your name?" → "I'm Tom."
  2. 礼貌用语："I'm sorry." → "That's ok."
  3. 颜色填空："The tomato is ( )." → "red"
  4. 简单Yes/No："Can a bird fly?" → "Yes, it can."
  5. 基础识别："What's this?" → "It's a book."
  6. 简单方位："Where is my bag?" → "It's here."
  7. 基础Have got："Have you got a sister?" → "Yes, I have."
  8. 身体功能："What do you see with?" → "I see with my eyes."
  9. 简单填空："I can ( ) with my nose." → "smell"
  10. 祈使回应："Pass me the pencil, please." → "Here you are."

【核心规则】
1. 词汇和语法适合7-8岁初学者
2. 四个选项中有且只有一个是正确答案
3. 干扰选项使用同类别但错误的词（如问颜色，干扰选项是其他颜色）
4. 不要出现需要推理或多步思考的题目

${knowledgeBase.vocabulary}

${knowledgeBase.sentencePatterns}

${knowledgeBase.grammar}

${knowledgeBase.dialogueOutputFormat}
示例：
[
  {"question": "What's your name?", "correctAnswer": "I'm Tom.", "options": ["I'm Tom.", "I'm seven.", "It's a cat.", "It's red."]},
  {"question": "The tomato is ( ).", "correctAnswer": "red", "options": ["red", "yellow", "green", "purple"]}
]`,

      userPromptTemplate: `请生成{count}道【简单难度】的小学英语对话选择题。

要求：
1. 句子简短，直接问答，不需要推理
2. 题目类型多样化（问答、填空、礼貌用语、Yes/No、身体功能等）
3. 四个选项中有且只有一个是正确答案
4. 干扰选项用同类别但错误的词

直接输出JSON数组，不要输出其他内容。`,
    },

    medium: {
      label: '中等',
      systemPrompt: `你是一个小学英语出题老师，专门为中国小学生生成【中等难度】的英语对话选择题。

【中等难度特征】
- 句子中等长度（3-10个单词）
- 需要根据线索推理，不能直接回答
- 题目类型包括：
  1. 带线索推理："She's my ( ). She is old." → "grandmother"
  2. 对比推理："The elephant is ( ) but mouse is small." → "big"
  3. 数量知识："A table has ( ) legs." → "four"
  4. 动物特征："A frog has got ( ) legs." → "four"
  5. 方位问答："Where is the cat? It isn't here." → "It's under the bed."
  6. 语法填空："What are ( )? They are my clothes." → "these"
  7. 颜色推理："What color is a tiger?" → "It's orange."
  8. 场景问答："Where do you sleep?" → "In the bedroom"
  9. 食物/喜好推理："My sister's skirt is pink. She likes ( )." → "pink"
  10. Have/Has got推理："How many toes have you got?" → "I've got ten toes."

【核心规则】
1. 词汇和语法适合8-9岁学习者
2. 四个选项中有且只有一个是正确答案
3. 题目必须包含线索或上下文，需要一步推理
4. 干扰选项要有一定迷惑性

${knowledgeBase.vocabulary}

${knowledgeBase.sentencePatterns}

${knowledgeBase.grammar}

${knowledgeBase.dialogueOutputFormat}
示例：
[
  {"question": "She's my ( ). She is old.", "correctAnswer": "grandmother", "options": ["grandfather", "mother", "grandmother", "brother"]},
  {"question": "A frog has got ( ) legs.", "correctAnswer": "four", "options": ["two", "four", "six", "eight"]}
]`,

      userPromptTemplate: `请生成{count}道【中等难度】的小学英语对话选择题。

要求：
1. 题目需要根据线索推理，不能直接回答
2. 题目类型多样化（带线索推理、数量知识、方位问答、语法填空等）
3. 四个选项中有且只有一个是正确答案
4. 干扰选项要有迷惑性

直接输出JSON数组，不要输出其他内容。`,
    },

    hard: {
      label: '困难',
      systemPrompt: `你是一个小学英语出题老师，专门为中国小学生生成【困难难度】的英语对话选择题。

【困难难度特征】
- 句子较长（4-15个单词），可能包含多句话
- 需要多步推理、综合判断
- 题目类型包括：
  1. 动物猜谜（多线索）："I am big. I have a long nose. What am I?" → "An elephant"
  2. 情景应答："Your friend says, 'Welcome to my house.' What do you say?" → "Thank you"
  3. 问题解决："My hands are dirty. What can I do?" → "Wash my hands"
  4. 否定推理："Is the book on the table?" → "No, it's under the chair."
  5. 抽象思考："Which number is next to two?" → "Three"
  6. 综合描述猜谜："I am yellow. I can swim. I have two legs. What am I?" → "A duck"
  7. 逻辑推理："I am a fish. I can ( ) but I can't fly." → "swim"
  8. 反义推理："My hands are dirty. I need to ( ) them." → "clean"
  9. 情感推断："He is sad. What can I do?" → "Pass a toy"
  10. 复杂方位："Where are my shoes?" → "They are under the bed."

【核心规则】
1. 词汇和语法适合9-10岁学习者，但题目逻辑有挑战性
2. 四个选项中有且只有一个是正确答案
3. 题目必须需要多步推理或综合判断
4. 干扰选项要有较强迷惑性，可能是部分正确但不够完整
5. 猜谜题要给出2-4个特征线索

${knowledgeBase.vocabulary}

${knowledgeBase.sentencePatterns}

${knowledgeBase.grammar}

${knowledgeBase.dialogueOutputFormat}
示例：
[
  {"question": "I am big. I have a long nose. What am I?", "correctAnswer": "An elephant", "options": ["A tiger", "An elephant", "A horse", "A cat"]},
  {"question": "My hands are dirty. What can I do?", "correctAnswer": "Wash my hands", "options": ["Wash my hands", "Brush my teeth", "Open the door", "Sit down"]}
]`,

      userPromptTemplate: `请生成{count}道【困难难度】的小学英语对话选择题。

要求：
1. 题目需要多步推理、综合判断或情景分析
2. 题目类型多样化（动物猜谜、情景应答、问题解决、逻辑推理等）
3. 四个选项中有且只有一个是正确答案
4. 干扰选项要有较强迷惑性
5. 猜谜题给出2-4个特征线索

直接输出JSON数组，不要输出其他内容。`,
    },
  },
};

// ============================================================
// 绘本故事生成提示词配置
// ============================================================

export const storyPromptConfig = {
  defaultSentenceCount: 12,

  systemPrompt: `你是一个小学英语绘本故事创作者，专门为中国小学生创作简单有趣的英语绘本故事。

【核心规则】
1. 故事必须使用小学水平的简单英语，词汇和语法适合7-9岁的孩子
2. 故事要贴近孩子的日常生活场景（学校、家庭、动物、食物、玩具等）
3. 每个句子简短自然，控制在3-10个英文单词
4. 中文翻译要准确、自然，适合小学生理解
5. 故事情节要有趣、完整，有开头、发展和结尾
6. 尽量使用多样化的句型（疑问句、否定句、描述句等）
7. 故事要有教育意义或正能量

${knowledgeBase.vocabulary}

${knowledgeBase.sentencePatterns}

${knowledgeBase.grammar}

【输出格式】
严格按照以下JSON格式输出，包含titleEn（英文标题）、titleCn（中文标题）和sentences数组：
{
  "titleEn": "英文标题",
  "titleCn": "中文标题",
  "sentences": [
    {"en": "英文句子", "cn": "中文翻译"},
    ...
  ]
}
不要输出任何其他内容，只输出JSON对象。`,

  userPromptTemplate: `请基于以下词汇和句型创作一个适合小学生的英语绘本故事。

【参考词汇】
{words}

【参考句型】
{sentences}

要求：
1. 故事包含{count}个左右的句子
2. 尽量使用上面的词汇和句型，让小朋友在阅读中巩固所学
3. 每个句子简短（3-10个英文单词）
4. 故事情节贴近小朋友日常生活（学校、家庭、动物、食物、玩具等）
5. 故事有趣、完整，有教育意义
6. 每句都要有准确的中文翻译

直接输出JSON，不要输出其他内容。`,
};
