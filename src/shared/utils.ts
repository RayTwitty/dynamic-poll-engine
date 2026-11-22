const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * Форматирует дату в строку по русской локали (ДД.ММ.ГГГГ).
 * @param dateUTC - Дата в формате UTC или ISO.
 * @returns Отформатированная дата или пустая строка при некорректных данных.
 */
export const dateFormat = (dateUTC: string | null): string => {
  if (!dateUTC) return '';

  const date = new Date(dateUTC);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU');
};

/**
 * Возвращает правильное склонение слова в зависимости от переданного числа.
 * @param count - Число или количество.
 * @param word1 - Слово в именительном падеже, например "час".
 * @param word2 - Слово в родительном падеже, ед. число, например "часа".
 * @param word3 - Слово в родительном падеже, мн. число, например "часов".
 * @returns Слово в правильном склонении.
 */
export const wordDeclension = (
  count: number,
  word1: string,
  word2: string,
  word3: string
): string => {
  const absCount = Math.abs(count);

  if (absCount % 10 === 1 && absCount % 100 !== 11) return word1;
  if (absCount % 10 >= 2 && absCount % 10 <= 4 && (absCount % 100 < 10 || absCount % 100 >= 20)) {
    return word2;
  }
  return word3;
};

/**
 * Возвращает переданный ID опроса из адресной строки.
 * @returns ID опроса или null, если параметр отсутствует/некорректен.
 */
export const getInitialPollId = (): number | null => {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('pollId')?.trim();

  if (rawId && !Number.isNaN(Number(rawId))) {
    return Number(rawId);
  }

  // В режиме разработки с моками отдаем тестовый ID = 1, чтобы не вводить его в URL вручную
  return USE_MOCKS ? 1 : null;
};
