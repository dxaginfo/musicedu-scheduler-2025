import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instrument: string;
  skillLevel: string;
  startDate: string;
  birthDate: string;
  notes?: string;
}

interface StudentsState {
  students: Student[];
  selectedStudent: Student | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    fetchStudentsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStudentsSuccess(state, action: PayloadAction<Student[]>) {
      state.students = action.payload;
      state.loading = false;
    },
    fetchStudentsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    selectStudent(state, action: PayloadAction<Student>) {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent(state) {
      state.selectedStudent = null;
    },
    addStudent(state, action: PayloadAction<Student>) {
      state.students.push(action.payload);
    },
    updateStudent(state, action: PayloadAction<Student>) {
      const index = state.students.findIndex(student => student.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    },
    deleteStudent(state, action: PayloadAction<string>) {
      state.students = state.students.filter(student => student.id !== action.payload);
    },
  },
});

export const {
  fetchStudentsStart,
  fetchStudentsSuccess,
  fetchStudentsFailure,
  selectStudent,
  clearSelectedStudent,
  addStudent,
  updateStudent,
  deleteStudent,
} = studentsSlice.actions;

export default studentsSlice.reducer;
