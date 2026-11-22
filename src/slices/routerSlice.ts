import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const Routes = {
  StartScreen: 0,
  QuestionsScreen: 1,
  FinishScreen: 2,
} as const;

type RoutePath = (typeof Routes)[keyof typeof Routes];

interface RouterState {
  path: RoutePath;
}

const initialState: RouterState = {
  path: Routes.StartScreen,
};

const routerSlice = createSlice({
  name: 'router',
  initialState,
  reducers: {
    navigateTo: (state, action: PayloadAction<RoutePath>) => {
      state.path = action.payload;
    },
  },
});

export const { navigateTo } = routerSlice.actions;
export default routerSlice.reducer;
