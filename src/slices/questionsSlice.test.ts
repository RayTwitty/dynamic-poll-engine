import { describe, it, expect } from 'vitest';

import { Question } from '@/types/poll';
import questionsReducer, {
  addQuestion,
  removeQuestion,
  saveAnswers,
  clearEmptyQuestions,
} from './questionsSlice';

const mockQuestions: Question[] = [
  {
    id: 1,
    text: 'Первый вопрос',
    max_answer: 1,
    skippable: false,
    related_answer_id: null,
    answers: [{ id: 10, text: 'Да', media: null, votes: 5 }],
  },
  {
    id: 3,
    text: 'Третий вопрос',
    max_answer: 1,
    skippable: true,
    related_answer_id: null,
    answers: [{ id: 30, text: 'Нет', media: null, votes: 2 }],
  },
  {
    id: 2,
    text: 'Зависимый второй вопрос',
    max_answer: 2,
    skippable: false,
    related_answer_id: 10,
    answers: [{ id: 20, text: 'Вариант А', media: null, votes: 1 }],
  },
];

describe('slices/questionsSlice', () => {
  it('добавляет вопросы без дубликатов и сортирует их по id', () => {
    // Добавляем 1-й и 3-й вопросы
    let state = questionsReducer([], addQuestion([mockQuestions[0], mockQuestions[1]]));
    expect(state.map((q) => q.id)).toEqual([1, 3]);

    // Добавляем 2-й вопрос (зависимый) и дубликат 1-го вопроса
    state = questionsReducer(state, addQuestion([mockQuestions[2], mockQuestions[0]]));
    expect(state).toHaveLength(3);
    expect(state.map((q) => q.id)).toEqual([1, 2, 3]);
  });

  it('удаляет вопросы по массиву id', () => {
    const initialState = [mockQuestions[0], mockQuestions[2], mockQuestions[1]];
    const state = questionsReducer(initialState, removeQuestion([2, 3]));

    expect(state).toHaveLength(1);
    expect(state[0].id).toBe(1);
  });

  it('сохраняет ответы пользователя по индексу вопроса', () => {
    const state = questionsReducer(
      [mockQuestions[0]],
      saveAnswers({ idx: 0, answers: [{ answer: 10, answer_value: null }] })
    );

    expect(state[0].answers_result).toEqual([{ answer: 10, answer_value: null }]);
  });

  it('очищает вопросы без ответов при завершении опроса', () => {
    const stateWithOneAnswer = [
      { ...mockQuestions[0], answers_result: [{ answer: 10, answer_value: null }] },
      { ...mockQuestions[1], answers_result: [] },
    ];

    const state = questionsReducer(stateWithOneAnswer, clearEmptyQuestions());
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe(1);
  });
});
