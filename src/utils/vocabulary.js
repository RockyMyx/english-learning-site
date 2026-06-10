// 词汇工具函数
import { vocabularyData } from '../data/vocabularyData.js';
import { wordSentenceData } from '../data/sentenceData.js';

// 自定义单词 localStorage 操作
const CUSTOM_WORDS_KEY = 'customWords';

// 从 wordSentenceData 提取所有单词（自动与造句模块同步）
function getWordsFromSentenceData() {
  return wordSentenceData.map(item => ({
    english: item.word,
    chinese: item.wordChinese
  }));
}

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
  // 检查是否已存在
  const existingWords = getWordsFromSentenceData();
  existingWords.push(...customWords);
  if (existingWords.some(w => w.english === english)) {
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

// 获取所有单词（从 sentenceData 自动提取，无需手动维护）
export function getAllWords() {
  const allWords = getWordsFromSentenceData();
  // 合并自定义单词
  const customWords = getCustomWords();
  allWords.push(...customWords);
  return allWords;
}

// 获取所有句型
export function getAllSentences() {
  return vocabularyData.sentences;
}

// 获取排除指定单词的所有单词（按单词本身过滤）
const excludedWords = [];

export function getAllWordsExcluding(wordsToExclude = excludedWords) {
  const allWords = getWordsFromSentenceData();
  return allWords.filter(w => !wordsToExclude.includes(w.english));
}

// 随机获取指定数量的单词（排除指定单词）
export function getRandomWordsExcluding(count = 10, wordsToExclude = excludedWords) {
  const words = getAllWordsExcluding(wordsToExclude);
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
export function getQuizOptions(correctAnswer, _category, count = 4) {
  let options = [correctAnswer];
  const allWords = getWordsFromSentenceData();

  // 从所有单词中随机添加干扰项
  while (options.length < count && allWords.length > 0) {
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }

  // 打乱选项顺序
  return options.sort(() => Math.random() - 0.5);
}

// 导出 vocabularyData 以供其他模块直接引用
export { vocabularyData };
