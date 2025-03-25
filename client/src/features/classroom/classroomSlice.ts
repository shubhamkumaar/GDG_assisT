import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


export interface CLassroomState {
    classroomDetial:{
        name: string,
        teacherName: string,
        notification: boolean,
        assignment:[]
    } 
  }

  const initialState: CLassroomState = {
    classroomDetial:{
        name: "",
        teacherName: "",
        notification: false,
        assignment:[]
    }
  }


export const classroomDetialSlice = createSlice({
  name: 'classroomPage',
  initialState,
  reducers: {
    getClassroomDetial: (state, action: PayloadAction<string>) => {
        state.classroomDetial.name = action.payload
      },
  },
})


export const { getClassroomDetial } = classroomDetialSlice.actions
export default classroomDetialSlice.reducer