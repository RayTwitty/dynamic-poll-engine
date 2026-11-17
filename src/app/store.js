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
