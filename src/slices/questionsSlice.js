import { createSlice } from '@reduxjs/toolkit';

const questionsSlice = createSlice({
  name: 'questions',
  initialState: [],
  reducers: {
    /**
     * Добавляет один вопрос или массив вопросов в очередь, исключая дубликаты по id.
     * @param {Object | Object[]} action.payload
     */
    addQuestion: (state, action) => {
      const questions = Array.isArray(action.payload) ? action.payload : [action.payload];

      // Используем Map для защиты от дубликатов при повторном открытии веток
      const questionsMap = new Map(state.map((question) => [question.id, question]));
      questions.forEach((question) => questionsMap.set(question.id, { ...question }));

      return Array.from(questionsMap.values()).sort((q1, q2) => q1.id - q2.id);
    },

    /**
     * Удаляет один вопрос или массив вопросов по их id.
     * @param {number | number[]} action.payload
     */
    removeQuestion: (state, action) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      const questionsSet = new Set(ids);

      return state.filter((question) => !questionsSet.has(question.id));
    },

    /**
     * Сохраняет массив ответов пользователя для вопроса по его индексу в очереди.
     * @param {{ idx: number, answers: Array<{ answer: number, answer_value: string | null }> }} action.payload
     */
    saveAnswers: (state, action) => {
      const { idx, answers } = action.payload;
      if (state[idx]) {
        state[idx].answers_result = answers;
      }
    },

    setQuestions: (state, action) => {
      return action.payload;
    },

    clearEmptyQuestions: (state) => {
      return state.filter((question) => question.answers_result?.length > 0);
    },
  },
});

export const { addQuestion, removeQuestion, saveAnswers, setQuestions, clearEmptyQuestions } =
  questionsSlice.actions;
export default questionsSlice.reducer;
