import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CLassroomPageState {
    classroomType: string;
  }

  const initialState: CLassroomPageState = {
    classroomType: "Announcement",
  }


export const classroomPageSlice = createSlice({
  name: 'classroomPage',
  initialState,
  reducers: {
    getClassroomType: (state, action: PayloadAction<string>) => {
        state.classroomType = action.payload
      },
  },
})


export const { getClassroomType } = classroomPageSlice.actions
export default classroomPageSlice.reducer