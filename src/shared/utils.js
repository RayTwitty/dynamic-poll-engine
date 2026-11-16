const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * Форматирует дату в строку по русской локали (ДД.ММ.ГГГГ).
 * @param {string} dateUTC - Дата в формате UTC или ISO.
 * @returns {string} Отформатированная дата или пустая строка при некорректных данных.
 */
export const dateFormat = (dateUTC) => {
  if (!dateUTC) return '';

  const date = new Date(dateUTC);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU');
};

/**
 * Возвращает правильное склонение слова в зависимости от переданного числа.
 * @param {number} count - Число или количество.
 * @param {string} word1 - Слово в именительном падеже, например "час".
 * @param {string} word2 - Слово в родительном падеже, ед. число, например "часа".
 * @param {string} word3 - Слово в родительном падеже, мн. число, например "часов".
 * @returns {string} Слово в правильном склонении.
 */
export const wordDeclension = (count, word1, word2, word3) => {
  const absCount = Math.abs(count);

  if (absCount % 10 === 1 && absCount % 100 !== 11) return word1;
  if (absCount % 10 >= 2 && absCount % 10 <= 4 && (absCount % 100 < 10 || absCount % 100 >= 20)) {
    return word2;
  }
  return word3;
};

/**
 * Возвращает переданный ID опроса из адресной строки.
 * @returns {number | null} ID опроса или null, если параметр отсутствует/некорректен.
 */
export const getInitialPollId = () => {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('pollId')?.trim();

  if (rawId && !Number.isNaN(Number(rawId))) {
    return Number(rawId);
  }

  // В режиме разработки с моками отдаем тестовый ID = 1, чтобы не вводить его в URL вручную
  return USE_MOCKS ? 1 : null;
};
