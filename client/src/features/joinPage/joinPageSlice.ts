import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface joinPageState {
    isJoining: boolean;
    classCode: string;
  }

  const initialState: joinPageState = {
    isJoining: false,
    classCode: "",
  }


export const joinPageSlice = createSlice({
  name: 'joinPage',
  initialState,
  reducers: {
    isJoiningClass: (state, action: PayloadAction<boolean>) => {
        state.isJoining = action.payload
      },
    getClassCode: (state, action: PayloadAction<string>) => {
        state.classCode = action.payload
      },
  },
})


export const { isJoiningClass, getClassCode } = joinPageSlice.actions

export default joinPageSlice.reducer