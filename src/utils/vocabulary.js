// 词汇工具函数 - 数据从 data/vocabularyData.js 导入
import { vocabularyData } from '../data/vocabularyData.js';

// 自定义单词 localStorage 操作
const CUSTOM_WORDS_KEY = 'customWords';

export function getCustomWords() {
  try {
    const data = localStorage.getItem(CUSTOM_WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addCustomWord(english, chinese, category = 'custom') {
  const customWords = getCustomWords();
  // 检查是否已存在（包括硬编码中）
  const allExisting = [];
  Object.keys(vocabularyData).forEach(key => {
    if (key !== 'sentences') {
      allExisting.push(...vocabularyData[key]);
    }
  });
  allExisting.push(...customWords);
  if (allExisting.some(w => w.english === english)) {
    return false;
  }
  customWords.push({ english, chinese, category });
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(customWords));
  return true;
}

export function deleteCustomWord(english) {
  const customWords = getCustomWords().filter(w => w.english !== english);
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(customWords));
  // 同时删除该单词的题目数据
  const storedQuestions = localStorage.getItem('adminWordSentenceQuestions');
  if (storedQuestions) {
    const data = JSON.parse(storedQuestions);
    delete data[english];
    localStorage.setItem('adminWordSentenceQuestions', JSON.stringify(data));
  }
}

// 获取所有单词
export function getAllWords() {
  const allWords = [];
  Object.keys(vocabularyData).forEach(key => {
    if (key !== 'sentences') {
      allWords.push(...vocabularyData[key]);
    }
  });
  // 合并自定义单词
  const customWords = getCustomWords();
  allWords.push(...customWords);
  return allWords;
}

// 获取所有句型
export function getAllSentences() {
  return vocabularyData.sentences;
}

// 按类别获取单词
export function getWordsByCategory(category) {
  return vocabularyData[category] || [];
}

// 获取排除指定分类的所有单词
const excludedCategories = ['numbers', 'colors'];

export function getAllWordsExcluding(categories = excludedCategories) {
  const allWords = [];
  Object.keys(vocabularyData).forEach(key => {
    if (key !== 'sentences' && !categories.includes(key)) {
      allWords.push(...vocabularyData[key]);
    }
  });
  return allWords;
}

// 随机获取指定数量的单词（排除指定分类）
export function getRandomWordsExcluding(count = 10, categories = excludedCategories) {
  const words = getAllWordsExcluding(categories);
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
}

// 随机获取指定数量的单词
export function getRandomWords(count = 10) {
  const allWords = getAllWords();
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allWords.length));
}

// 随机获取指定数量的句型
export function getRandomSentences(count = 10) {
  const allSentences = getAllSentences();
  const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allSentences.length));
}

// 获取题目选项（包括正确答案和干扰项）
export function getQuizOptions(correctAnswer, category, count = 4) {
  let options = [correctAnswer];
  const categoryWords = getWordsByCategory(category);

  // 随机添加干扰项
  while (options.length < count && categoryWords.length > 0) {
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }

  // 如果类别单词不够，从所有单词中补充
  if (options.length < count) {
    const allWords = getAllWords();
    while (options.length < count && allWords.length > 0) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      if (!options.includes(randomWord)) {
        options.push(randomWord);
      }
    }
  }

  // 打乱选项顺序
  return options.sort(() => Math.random() - 0.5);
}

// 导出 vocabularyData 以供其他模块直接引用
export { vocabularyData };
