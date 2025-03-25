import { configureStore } from '@reduxjs/toolkit'
import { workingPageSlice } from '../features/workingPage/workingPageSlice'
import { joinPageSlice } from '../features/joinPage/joinPageSlice'
import { classroomPageSlice } from '../features/classroomPage/classroomPageSlice'
import { isSidebarSlice } from '../features/isSidebar/isSidebarSlice'
import { isTeacherSlice } from '../features/isTeacher/isTeacherSlice'
import { feedbackPageSlice } from '../features/feedbackType/feedbackTypeSlice'
import { addAssigementSlice } from '../features/addAssigement/addAssigementSlice'
import { isAddStudentSlice } from '../features/addStudent/addStudentSlice'


export const store = configureStore({
  reducer: {
    workingPage: workingPageSlice.reducer,
    joinPage: joinPageSlice.reducer,
    classroomPage: classroomPageSlice.reducer,
    isSidebarPage: isSidebarSlice.reducer,
    isTeacherPage: isTeacherSlice.reducer,
    feedbackPage: feedbackPageSlice.reducer,
    addAssigement: addAssigementSlice.reducer,
    isAddStudent: isAddStudentSlice.reducer,
  },
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch