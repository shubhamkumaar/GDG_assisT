import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface joinPageState {
    isSidebar: boolean;
  }

  const initialState: joinPageState = {
    isSidebar: false,
  }


export const isSidebarSlice = createSlice({
  name: 'isSidebarPage',
  initialState,
  reducers: {
    isSidebarState: (state, action: PayloadAction<boolean>) => {
        state.isSidebar = action.payload
      }
  },
})


export const { isSidebarState } = isSidebarSlice.actions

export default isSidebarSlice.reducer