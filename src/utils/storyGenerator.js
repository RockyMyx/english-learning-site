// ============================================================
// 绘本故事生成器 - 基于DeepSeek API
// ============================================================

import { llmConfig, storyPromptConfig } from './llmConfig.js';
import { getRandomWords, getRandomSentences } from './vocabulary.js';

/**
 * 调用DeepSeek API生成绘本故事（自动从词汇库取词，无需指定主题）
 * @param {number} sentenceCount - 句子数量
 * @returns {Promise<{titleEn: string, titleCn: string, sentences: Array<{en: string, cn: string}>}>}
 */
export async function generateStory(sentenceCount) {
  sentenceCount = sentenceCount || storyPromptConfig.defaultSentenceCount;

  // 从词汇库随机取15个单词和5个句型作为参考素材
  const words = getRandomWords(15).map(w => `${w.english}(${w.chinese})`).join('、');
  const sentences = getRandomSentences(5).map(s => s.english).join('; ');

  const userPrompt = storyPromptConfig.userPromptTemplate
    .replace(/\{count\}/g, sentenceCount)
    .replace(/\{words\}/g, words)
    .replace(/\{sentences\}/g, sentences);

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
          { role: 'system', content: storyPromptConfig.systemPrompt },
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

    return parseStoryResponse(content);
  } catch (error) {
    console.error('生成故事失败:', error);
    throw error;
  }
}

/**
 * 解析AI返回的故事JSON
 */
function parseStoryResponse(content) {
  let jsonStr = content;

  // 去掉markdown代码块标记
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // 找到JSON对象
  const objStart = jsonStr.indexOf('{');
  const objEnd = jsonStr.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1) {
    jsonStr = jsonStr.substring(objStart, objEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);

    if (!parsed.titleEn || !parsed.titleCn || !Array.isArray(parsed.sentences)) {
      throw new Error('返回格式不正确，缺少titleEn/titleCn/sentences字段');
    }

    return {
      titleEn: parsed.titleEn,
      titleCn: parsed.titleCn,
      sentences: parsed.sentences
        .filter(s => s.en && s.cn)
        .map(s => ({ en: s.en, cn: s.cn })),
    };
  } catch (e) {
    console.error('解析故事内容失败:', e, '原始内容:', content);
    throw new Error('无法解析AI返回的故事内容，请重试');
  }
}
