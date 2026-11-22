import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { AnswerResult, PollData } from '@/types/poll';
import { pollApi } from '@/app/api';
import { RootState } from '@/app/store';

interface PollSliceMeta {
  curQuestionIdx: number;
  completed: boolean;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  submittedSuccessfully: boolean;
}

type PollState = PollSliceMeta & Partial<PollData>;

export const fetchPoll = createAsyncThunk<PollData, number, { rejectValue: string }>(
  'poll/fetchPoll',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollApi.fetchPoll(pollId);

      if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

      return (await response.json()) as PollData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка загрузки';
      return rejectWithValue(message);
    }
  }
);

export const submitPoll = createAsyncThunk<
  void,
  AnswerResult[],
  { rejectValue: string; state: RootState }
>(
  'poll/submitPoll',
  async (data, { rejectWithValue }) => {
    try {
      const response = await pollApi.submitPoll(data);

      if (!response.ok) throw new Error(`Ошибка отправки: ${response.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка отправки';
      return rejectWithValue(message);
    }
  },
  {
    // Отменяем запуск новой санки, если предыдущая отправка еще идет
    condition: (_, { getState }) => !getState().poll.isSubmitting,
  }
);

const initialState: PollState = {
  curQuestionIdx: 0,
  completed: false,
  // Состояние загрузки опроса (fetchPoll)
  isLoading: true,
  error: null,
  // Состояние отправки ответов (submitPoll)
  isSubmitting: false,
  submitError: null,
  submittedSuccessfully: false,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
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
        state.error = action.payload ?? action.error.message ?? 'Ошибка загрузки';
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
        state.submitError = action.payload ?? action.error.message ?? 'Ошибка отправки';
      });
  },
});

export const { incQuestionIdx, decQuestionIdx, setPollFinished } = pollSlice.actions;
export default pollSlice.reducer;
