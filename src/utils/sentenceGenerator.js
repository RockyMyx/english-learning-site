// ============================================================
// 句子生成器 - 基于大模型API
// 出题逻辑由 llmConfig.js 中的提示词配置控制
// ============================================================

import { llmConfig, promptConfig, dialoguePromptConfig } from './llmConfig.js';

/**
 * 调用大模型API生成句子题目
 * @param {string} word - 英文单词
 * @param {string} wordChinese - 中文释义
 * @param {number} count - 生成数量
 * @returns {Promise<Array<{english: string, chinese: string}>>}
 */
export async function generateSentences(word, wordChinese, count) {
  count = count || promptConfig.defaultCount;

  const userPrompt = promptConfig.userPromptTemplate
    .replace(/\{word\}/g, word)
    .replace(/\{wordZh\}/g, wordChinese)
    .replace(/\{count\}/g, count);

  try {
    const response = await fetch(`${llmConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: 'system', content: promptConfig.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: llmConfig.temperature,
        max_tokens: llmConfig.max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('API返回内容为空');
    }

    // 解析JSON结果
    return parseAIResponse(content);
  } catch (error) {
    console.error('生成句子失败:', error);
    throw error;
  }
}

/**
 * 解析AI返回的JSON内容
 */
function parseAIResponse(content) {
  // 尝试提取JSON数组（可能被markdown代码块包裹）
  let jsonStr = content;

  // 去掉markdown代码块标记
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // 去掉可能的前后文字，找到JSON数组
  const arrayStart = jsonStr.indexOf('[');
  const arrayEnd = jsonStr.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1) {
    jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('返回内容不是数组');
    }

    // 标准化字段名
    return parsed.map(item => ({
      english: item.english || item.en || item.English || '',
      chinese: item.chinese || item.zh || item.Chinese || '',
    })).filter(item => item.english && item.chinese);
  } catch (e) {
    console.error('解析AI返回内容失败:', e, '原始内容:', content);
    throw new Error('无法解析AI返回的题目，请重试');
  }
}

/**
 * 调用大模型API生成英文对话选择题
 * @param {string} difficulty - 难度级别: 'easy' | 'medium' | 'hard'
 * @param {number} count - 生成数量
 * @param {string} focusWords - 聚焦单词（可选）
 * @returns {Promise<Array<{question: string, correctAnswer: string, options: string[]}>>}
 */
export async function generateDialogueQuestions(difficulty, count, focusWords) {
  difficulty = difficulty || 'easy';
  count = count || dialoguePromptConfig.defaultCount;
  focusWords = focusWords || '';

  const levelConfig = dialoguePromptConfig.difficultyLevels[difficulty];
  if (!levelConfig) {
    throw new Error(`无效的难度级别: ${difficulty}`);
  }

  let userPrompt = levelConfig.userPromptTemplate
    .replace(/\{count\}/g, count);

  // 如果有聚焦单词，用强约束追加到用户提示词中
  if (focusWords.trim()) {
    const words = focusWords.split(/[,，、\s]+/).filter(w => w.trim());
    if (words.length > 0) {
      userPrompt += `

【聚焦单词（必须遵守）】
以下单词必须出现在题目的 question 或 correctAnswer 或 options 中：${words.join(', ')}
规则：
1. 每道题的 question 或 correctAnswer 中必须包含至少一个聚焦单词
2. 聚焦单词要尽量均匀分布在各题中，不要全部集中在一两道题
3. 除聚焦单词外，题目中使用的其他词汇仍必须在系统【词汇范围】内
4. 聚焦单词可以出现在填空题的答案中，也可以出现在题干中作为线索`;
    }
  }

  try {
    const response = await fetch(`${llmConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: 'system', content: levelConfig.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: llmConfig.temperature,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('API返回内容为空');
    }

    return parseDialogueResponse(content);
  } catch (error) {
    console.error('生成对话题目失败:', error);
    throw error;
  }
}

/**
 * 解析AI返回的对话题目JSON
 */
function parseDialogueResponse(content) {
  let jsonStr = content;

  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const arrayStart = jsonStr.indexOf('[');
  const arrayEnd = jsonStr.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1) {
    jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('返回内容不是数组');
    }

    return parsed.filter(item =>
      item.question &&
      item.correctAnswer &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.includes(item.correctAnswer)
    ).map(item => ({
      question: item.question,
      correctAnswer: item.correctAnswer,
      options: item.options,
    }));
  } catch (e) {
    console.error('解析对话题目失败:', e, '原始内容:', content);
    throw new Error('无法解析AI返回的对话题目，请重试');
  }
}
