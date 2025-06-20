import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MaterialsState {
  materials: Material[];
  selectedMaterial: Material | null;
  loading: boolean;
  error: string | null;
}

const initialState: MaterialsState = {
  materials: [],
  selectedMaterial: null,
  loading: false,
  error: null,
};

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    fetchMaterialsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMaterialsSuccess(state, action: PayloadAction<Material[]>) {
      state.materials = action.payload;
      state.loading = false;
    },
    fetchMaterialsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    selectMaterial(state, action: PayloadAction<Material>) {
      state.selectedMaterial = action.payload;
    },
    clearSelectedMaterial(state) {
      state.selectedMaterial = null;
    },
    addMaterial(state, action: PayloadAction<Material>) {
      state.materials.push(action.payload);
    },
    updateMaterial(state, action: PayloadAction<Material>) {
      const index = state.materials.findIndex(material => material.id === action.payload.id);
      if (index !== -1) {
        state.materials[index] = action.payload;
      }
    },
    deleteMaterial(state, action: PayloadAction<string>) {
      state.materials = state.materials.filter(material => material.id !== action.payload);
    },
  },
});

export const {
  fetchMaterialsStart,
  fetchMaterialsSuccess,
  fetchMaterialsFailure,
  selectMaterial,
  clearSelectedMaterial,
  addMaterial,
  updateMaterial,
  deleteMaterial,
} = materialsSlice.actions;

export default materialsSlice.reducer;
