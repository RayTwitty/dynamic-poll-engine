import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AnswerResult, Question } from '@/types/poll';

const initialState: Question[] = [];

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    /**
     * Добавляет один вопрос или массив вопросов в очередь, исключая дубликаты по id.
     */
    addQuestion: (state, action: PayloadAction<Question | Question[]>) => {
      const questions = Array.isArray(action.payload) ? action.payload : [action.payload];

      // Используем Map для защиты от дубликатов при повторном открытии веток
      const questionsMap = new Map(state.map((question) => [question.id, question]));
      questions.forEach((question) => questionsMap.set(question.id, { ...question }));

      return Array.from(questionsMap.values()).sort((q1, q2) => q1.id - q2.id);
    },

    /**
     * Удаляет один вопрос или массив вопросов по их id.
     */
    removeQuestion: (state, action: PayloadAction<number | number[]>) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      const questionsSet = new Set(ids);

      return state.filter((question) => !questionsSet.has(question.id));
    },

    /**
     * Сохраняет массив ответов пользователя для вопроса по его индексу в очереди.
     */
    saveAnswers: (state, action: PayloadAction<{ idx: number; answers: AnswerResult[] }>) => {
      const { idx, answers } = action.payload;
      if (state[idx]) {
        state[idx].answers_result = answers;
      }
    },

    setQuestions: (_, action: PayloadAction<Question[]>) => {
      return action.payload;
    },

    clearEmptyQuestions: (state) => {
      return state.filter((question) => (question.answers_result?.length ?? 0) > 0);
    },
  },
});

export const { addQuestion, removeQuestion, saveAnswers, setQuestions, clearEmptyQuestions } =
  questionsSlice.actions;
export default questionsSlice.reducer;
