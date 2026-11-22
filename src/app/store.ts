import { configureStore } from '@reduxjs/toolkit';

import pollReducer from '@/slices/pollSlice';
import questionsReducer from '@/slices/questionsSlice';
import routerReducer from '@/slices/routerSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
    questions: questionsReducer,
    router: routerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
