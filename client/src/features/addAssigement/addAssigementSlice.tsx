import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface addAssigementState {
    isAddAssigementValue: boolean;

  }

  const initialState: addAssigementState = {
    isAddAssigementValue: false,

  }


export const addAssigementSlice = createSlice({
  name: 'addAssigement',
  initialState,
  reducers: {
    isAddAssigement: (state, action: PayloadAction<boolean>) => {
        state.isAddAssigementValue = action.payload
      },

  },
})


export const { isAddAssigement } = addAssigementSlice.actions

export default addAssigementSlice.reducer