import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface isAutomationPageState {
  isAutomation: boolean;
}

const initialState: isAutomationPageState = {
  isAutomation: false,
};

export const isAutomationSlice = createSlice({
  name: "isAutomationPage",
  initialState,
  reducers: {
    isAutomationState: (state, action: PayloadAction<boolean>) => {
      state.isAutomation = action.payload;
    },
  },
});

export const { isAutomationState } = isAutomationSlice.actions;

export default isAutomationSlice.reducer;
