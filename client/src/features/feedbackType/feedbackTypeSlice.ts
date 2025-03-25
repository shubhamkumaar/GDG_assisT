import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface FeedbackPageState {
    feedbackType: string;
  }

  const initialState: FeedbackPageState = {
    feedbackType: "Strong",
  }


export const feedbackPageSlice = createSlice({
  name: 'feedbackPage',
  initialState,
  reducers: {
    getfeedbackType: (state, action: PayloadAction<string>) => {
        state.feedbackType = action.payload
      },
  },
})


export const { getfeedbackType } = feedbackPageSlice.actions

export default feedbackPageSlice.reducer