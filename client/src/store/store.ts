import { configureStore } from '@reduxjs/toolkit'
import { workingPageSlice } from '../features/workingPage/workingPageSlice'
import { joinPageSlice } from '../features/joinPage/joinPageSlice'

export const store = configureStore({
  reducer: {
    workingPage: workingPageSlice.reducer,
    joinPage: joinPageSlice.reducer,
  },
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch