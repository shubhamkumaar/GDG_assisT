import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface isTeacherPageState {
  isTeacher: boolean;
}

const initialState: isTeacherPageState = {
  isTeacher: false,
};

export const isTeacherSlice = createSlice({
  name: "isTeacherPage",
  initialState,
  reducers: {
    isTeacherState: (state, action: PayloadAction<boolean>) => {
      state.isTeacher = action.payload;
    },
  },
});

export const { isTeacherState } = isTeacherSlice.actions;

export default isTeacherSlice.reducer;
