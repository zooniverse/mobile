import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // ISO timestamp set whenever the subject on screen changes. Used by the
  // submission pipeline as `started_at` in the classification metadata.
  subjectStartTime: null,
}

const classifierSlice = createSlice({
  name: 'classification',
  initialState,
  reducers: {
    reset: () => initialState,
    setSubjectStartTime: (state, action) => {
      state.subjectStartTime = action.payload
    },
  },
})

export const { reset, setSubjectStartTime } = classifierSlice.actions

export default classifierSlice.reducer
