import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import calendarReducer from './slices/calendarSlice';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import materialsReducer from './slices/materialsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    calendar: calendarReducer,
    students: studentsReducer,
    teachers: teachersReducer,
    materials: materialsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
