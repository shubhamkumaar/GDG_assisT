import { configureStore } from "@reduxjs/toolkit";
import { workingPageSlice } from "../features/workingPage/workingPageSlice";
import { joinPageSlice } from "../features/joinPage/joinPageSlice";
import { classroomPageSlice } from "../features/classroomPage/classroomPageSlice";
import { isSidebarSlice } from "../features/isSidebar/isSidebarSlice";
import { isTeacherSlice } from "../features/isTeacher/isTeacherSlice";
import { feedbackPageSlice } from "../features/feedbackType/feedbackTypeSlice";
import { addAssigementSlice } from "../features/addAssigement/addAssigementSlice";
import { isAddStudentSlice } from "../features/addStudent/addStudentSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import authReducer from "./auth/authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  workingPage: workingPageSlice.reducer,
  joinPage: joinPageSlice.reducer,
  classroomPage: classroomPageSlice.reducer,
  isSidebarPage: isSidebarSlice.reducer,
  isTeacherPage: isTeacherSlice.reducer,
  feedbackPage: feedbackPageSlice.reducer,
  addAssigement: addAssigementSlice.reducer,
  isAddStudent: isAddStudentSlice.reducer,
});

// ✅ Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Persist only auth state
};

// ✅ Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

// ✅ Create persistor for Redux Persist
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
