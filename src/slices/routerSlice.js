import { createSlice } from '@reduxjs/toolkit';

export const routes = {
  START_SCREEN: 0,
  QUESTIONS: 1,
  FINISH_SCREEN: 2,
};

const routerSlice = createSlice({
  name: 'router',
  initialState: {
    path: routes.START_SCREEN,
  },
  reducers: {
    navigateTo: (state, action) => {
      state.path = action.payload;
    },
  },
});

export const { navigateTo } = routerSlice.actions;
export default routerSlice.reducer;
