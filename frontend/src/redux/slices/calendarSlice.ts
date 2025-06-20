import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Lesson {
  id: string;
  title: string;
  start: string;
  end: string;
  teacherId: string;
  studentIds: string[];
  lessonTypeId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  locationType: 'in-person' | 'virtual';
  locationDetails?: string;
}

interface CalendarState {
  lessons: Lesson[];
  selectedDate: string | null;
  selectedLesson: Lesson | null;
  loading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  lessons: [],
  selectedDate: null,
  selectedLesson: null,
  loading: false,
  error: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    fetchLessonsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchLessonsSuccess(state, action: PayloadAction<Lesson[]>) {
      state.lessons = action.payload;
      state.loading = false;
    },
    fetchLessonsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    selectDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    selectLesson(state, action: PayloadAction<Lesson>) {
      state.selectedLesson = action.payload;
    },
    clearSelectedLesson(state) {
      state.selectedLesson = null;
    },
    addLesson(state, action: PayloadAction<Lesson>) {
      state.lessons.push(action.payload);
    },
    updateLesson(state, action: PayloadAction<Lesson>) {
      const index = state.lessons.findIndex(lesson => lesson.id === action.payload.id);
      if (index !== -1) {
        state.lessons[index] = action.payload;
      }
    },
    deleteLesson(state, action: PayloadAction<string>) {
      state.lessons = state.lessons.filter(lesson => lesson.id !== action.payload);
    },
  },
});

export const {
  fetchLessonsStart,
  fetchLessonsSuccess,
  fetchLessonsFailure,
  selectDate,
  selectLesson,
  clearSelectedLesson,
  addLesson,
  updateLesson,
  deleteLesson,
} = calendarSlice.actions;

export default calendarSlice.reducer;
