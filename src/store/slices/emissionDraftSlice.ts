import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { generateDefaultFecha } from "@/lib/default-fecha"
import type { Provider } from "@/types/provider"
import {
  createEmptyDescripciones,
  createEmptyEstructura,
  type EstructuraRow,
} from "@/types/emission"

export interface EmissionDraftState {
  fecha: string
  monto: string
  montoLetras: string
  descripciones: string[]
  estructura: EstructuraRow[]
  selectedProvider: Provider | null
}

const initialState: EmissionDraftState = {
  fecha: generateDefaultFecha(),
  monto: "",
  montoLetras: "",
  descripciones: createEmptyDescripciones(),
  estructura: createEmptyEstructura(),
  selectedProvider: null,
}

const emissionDraftSlice = createSlice({
  name: "emissionDraft",
  initialState,
  reducers: {
    setFecha: (state, action: PayloadAction<string>) => {
      state.fecha = action.payload
    },
    setMonto: (state, action: PayloadAction<string>) => {
      state.monto = action.payload
    },
    setMontoLetras: (state, action: PayloadAction<string>) => {
      state.montoLetras = action.payload
    },
    setDescripciones: (state, action: PayloadAction<string[]>) => {
      state.descripciones = action.payload
    },
    setEstructura: (state, action: PayloadAction<EstructuraRow[]>) => {
      state.estructura = action.payload
    },
    setSelectedProvider: (state, action: PayloadAction<Provider | null>) => {
      state.selectedProvider = action.payload
    },
    resetEmissionDraft: () => initialState,
  },
})

export const {
  setFecha,
  setMonto,
  setMontoLetras,
  setDescripciones,
  setEstructura,
  setSelectedProvider,
  resetEmissionDraft,
} = emissionDraftSlice.actions

export default emissionDraftSlice.reducer
