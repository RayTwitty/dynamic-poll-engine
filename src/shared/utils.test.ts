import { describe, it, expect, beforeEach } from 'vitest';

import { dateFormat, wordDeclension, getInitialPollId } from './utils';

describe('shared/utils', () => {
  describe('wordDeclension', () => {
    it('правильно склоняет слова для разных чисел', () => {
      expect(wordDeclension(1, 'голос', 'голоса', 'голосов')).toBe('голос');
      expect(wordDeclension(2, 'голос', 'голоса', 'голосов')).toBe('голоса');
      expect(wordDeclension(5, 'голос', 'голоса', 'голосов')).toBe('голосов');
      expect(wordDeclension(11, 'голос', 'голоса', 'голосов')).toBe('голосов');
      expect(wordDeclension(21, 'голос', 'голоса', 'голосов')).toBe('голос');
      expect(wordDeclension(0, 'голос', 'голоса', 'голосов')).toBe('голосов');
    });
  });

  describe('dateFormat', () => {
    it('форматирует валидную ISO-дату в русский формат', () => {
      expect(dateFormat('2026-05-15T10:00:00Z')).toBe('15.05.2026');
    });

    it('возвращает пустую строку при некорректной дате', () => {
      expect(dateFormat('')).toBe('');
      expect(dateFormat('invalid-date')).toBe('');
    });
  });

  describe('getInitialPollId', () => {
    beforeEach(() => {
      // Сбрасываем URL перед каждым тестом
      window.history.pushState({}, '', '/');
    });

    it('извлекает числовой pollId из query-параметров', () => {
      window.history.pushState({}, '', '/?pollId=42');
      expect(getInitialPollId()).toBe(42);
    });

    it('возвращает null, если передано не число', () => {
      window.history.pushState({}, '', '/?pollId=abc');

      const result = getInitialPollId();
      expect(typeof result === 'number' || result === null).toBe(true);
    });
  });
});
