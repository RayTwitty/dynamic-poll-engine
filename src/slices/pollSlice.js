import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { pollApi } from '@/app/api';

export const fetchPoll = createAsyncThunk('poll/fetchPoll', async (pollId, { rejectWithValue }) => {
  try {
    const response = await pollApi.fetchPoll(pollId);

    if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const submitPoll = createAsyncThunk(
  'poll/submitPoll',
  async (data, { rejectWithValue }) => {
    try {
      const response = await pollApi.submitPoll(data);

      if (!response.ok) throw new Error(`Ошибка отправки: ${response.status}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    // Отменяем запуск новой санки, если предыдущая отправка еще идет
    condition: (_, { getState }) => !getState().poll.isSubmitting,
  }
);

const pollSlice = createSlice({
  name: 'poll',
  initialState: {
    curQuestionIdx: 0,
    completed: false,
    // Состояние загрузки опроса (fetchPoll)
    isLoading: true,
    error: null,
    // Состояние отправки ответов (submitPoll)
    isSubmitting: false,
    submitError: null,
    submittedSuccessfully: false,
  },
  reducers: {
    incQuestionIdx: (state) => {
      state.curQuestionIdx++;
    },

    decQuestionIdx: (state) => {
      // Защита от ухода индекса в отрицательное значение при двойном клике
      if (state.curQuestionIdx > 0) {
        state.curQuestionIdx--;
      }
    },

    setPollFinished: (state) => {
      state.curQuestionIdx = 0;
      state.completed = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Загрузка опроса
      .addCase(fetchPoll.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        // Сбрасываем индекс при загрузке нового опроса
        state.curQuestionIdx = 0;
      })
      .addCase(fetchPoll.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          completed: Boolean(action.payload.poll_result),
          isLoading: false,
        };
      })
      .addCase(fetchPoll.rejected, (state, action) => {
        state.isLoading = false;
        // Берем payload из rejectWithValue, а если его нет - системное сообщение
        state.error = action.payload || action.error.message;
      })

      // Отправка ответов
      .addCase(submitPoll.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitPoll.fulfilled, (state) => {
        state.isSubmitting = false;
        state.submittedSuccessfully = true;
      })
      .addCase(submitPoll.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload || action.error.message;
      });
  },
});

export const { incQuestionIdx, decQuestionIdx, setPollFinished } = pollSlice.actions;
export default pollSlice.reducer;
