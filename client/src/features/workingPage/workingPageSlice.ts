import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface WorkingPageState {
    pageName: string;
  }

  const initialState: WorkingPageState = {
    pageName: "Home",
  }


export const workingPageSlice = createSlice({
  name: 'workingPage',
  initialState,
  reducers: {
    getPageName: (state, action: PayloadAction<string>) => {
        state.pageName = action.payload
      },
  },
})


export const { getPageName } = workingPageSlice.actions

export default workingPageSlice.reducer