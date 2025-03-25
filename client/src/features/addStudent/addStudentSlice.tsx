import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface addAssigementState {
    isAddStudentValue: boolean;
  }

  const initialState: addAssigementState = {
    isAddStudentValue: false,
  }


export const isAddStudentSlice = createSlice({
  name: 'isAddStudent',
  initialState,
  reducers: {
    AddStudent: (state, action: PayloadAction<boolean>) => {
        state.isAddStudentValue = action.payload
      },
  },
})


export const { AddStudent } = isAddStudentSlice.actions

export default isAddStudentSlice.reducer