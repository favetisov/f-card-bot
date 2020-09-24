// todo refactor this with sophisticated regexp replace, do not escape already escaped values
import { MessageEntity } from 'telegram-typings';

export const escapeMd = (string) => {
  let result = '';
  for (const char of string) {
    result += escapeMdChar(char);
  }
  return result;
};

export const escapeMdChar = (char: string) => {
  const shouldBeEscaped = (char) => {
    if (char.charCodeAt(0) >= 1 && char.charCodeAt(126)) return true;
    if (['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'].includes(char))
      return true;
    return false;
  };
  return shouldBeEscaped(char) ? '\\' + char : char;
};

/**
 * Telegram message update contains only processed text with 'entities' field that defines markup
 */
export const entitiesToMd = (text = '', entities: MessageEntity[] = []): any => {
  if (!entities.length) return escapeMd(text);

  /** get symbols that should be [prepended, appended] to string on given entity */
  const getEntitySymbols = (entity: MessageEntity) => {
    if (entity.type === 'bold') return ['*', '*'];
    if (entity.type === 'italic') return ['_', '_'];
    if (entity.type === 'code') return ['`', '`'];
    if (entity.type === 'pre') return ['`', '`'];
    if (entity.type === 'underline') return ['__', '__'];
    if (entity.type === 'strikethrough') return ['~', '~'];
    if (entity.type === 'text_link') return ['[', `](${entity.url})`];
    if (entity.type === 'text_mention') return ['[', `](tg://user?id=${entity.user?.id})`];
    return ['', ''];
  };

  let result = '';
  for (let idx = 0; idx < text.length; idx++) {
    const openEntity = entities.find((e) => e.offset === idx);
    if (openEntity) {
      result += getEntitySymbols(openEntity)[0];
    }
    result += escapeMdChar(text[idx]);
    const closeEntity = entities.find((e) => e.offset + e.length === idx);
    if (closeEntity) {
      result += getEntitySymbols(closeEntity)[1];
    }
  }
  const finalEntity = entities.find((e) => e.offset + e.length === text.length);
  if (finalEntity) {
    result += getEntitySymbols(finalEntity)[1];
  }
  return result;
};
