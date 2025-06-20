import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio?: string;
  instruments: string[];
  teachingExperience?: string;
  hourlyRate: number;
  maxStudents?: number;
}

interface TeachersState {
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeachersState = {
  teachers: [],
  selectedTeacher: null,
  loading: false,
  error: null,
};

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    fetchTeachersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTeachersSuccess(state, action: PayloadAction<Teacher[]>) {
      state.teachers = action.payload;
      state.loading = false;
    },
    fetchTeachersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    selectTeacher(state, action: PayloadAction<Teacher>) {
      state.selectedTeacher = action.payload;
    },
    clearSelectedTeacher(state) {
      state.selectedTeacher = null;
    },
    addTeacher(state, action: PayloadAction<Teacher>) {
      state.teachers.push(action.payload);
    },
    updateTeacher(state, action: PayloadAction<Teacher>) {
      const index = state.teachers.findIndex(teacher => teacher.id === action.payload.id);
      if (index !== -1) {
        state.teachers[index] = action.payload;
      }
    },
    deleteTeacher(state, action: PayloadAction<string>) {
      state.teachers = state.teachers.filter(teacher => teacher.id !== action.payload);
    },
  },
});

export const {
  fetchTeachersStart,
  fetchTeachersSuccess,
  fetchTeachersFailure,
  selectTeacher,
  clearSelectedTeacher,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} = teachersSlice.actions;

export default teachersSlice.reducer;
