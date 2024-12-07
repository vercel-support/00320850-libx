import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export enum Action {
  SET_EXPORT_LOADING = 'SET_EXPORT_LOADING',
  SET_EXPORT_DATA = 'SET_EXPORT_DATA',
  SET_EXPORT_ERROR = 'SET_EXPORT_ERROR',

  SET_DOWNLOAD_LOADING = 'SET_DOWNLOAD_LOADING',
  SET_DOWNLOAD_ERROR = 'SET_DOWNLOAD_ERROR',
  SET_DOWNLOAD_URI = 'SET_DOWNLOAD_URI',
}

const STATE = {
  content: {
    title: 'Save your music!',
    subtitle: 'libx allows you to export your Spotify library.',
    text: null,
    mediaURL: null,
  },
  download: {
    error: null,
    loading: false,
    display: false,
    downloadURI: null,
  },
  export: {
    error: null,
    loading: false,
    display: false,
    data: null,
  },
};

export type State = typeof STATE;

export const exportSlice = createSlice({
  name: 'export',
  initialState: STATE,
  reducers: {
    setExportData(state, action) {
      state.export.data = action.payload;
    },
    setExportLoading(state, action) {
      state.export.loading = action.payload;
    },
    setExportError(state, action) {
      state.export.error = action.payload;
    },
  },
});

export const { setExportLoading, setExportData, setExportError } =
  exportSlice.actions;

const exportReducer = exportSlice.reducer;
export { exportReducer };

export const downloadSlice = createSlice({
  name: 'download',
  initialState: STATE,
  reducers: {
    setDownloadLoading(state, action) {
      state.download.loading = action.payload;
    },
    setDownloadError(state, action) {
      state.download.error = action.payload;
    },
    setDownloadURI(state, action) {
      state.download.downloadURI = action.payload;
    },
  },
});

export const { setDownloadLoading, setDownloadError, setDownloadURI } =
  downloadSlice.actions;

const downloadReducer = downloadSlice.reducer;
export { downloadReducer };

export const contentSlice = createSlice({
  name: 'content',
  initialState: STATE,
  reducers: {
    setTitle(state, action) {
      state.content.title = action.payload;
    },
    setSubtitle(state, action) {
      state.content.subtitle = action.payload;
    },
    setText(state, action) {
      state.content.text = action.payload;
    },
    setMediaURL(state, action) {
      state.content.mediaURL = action.payload;
    },
  },
});

export const { setTitle, setSubtitle, setText, setMediaURL } =
  contentSlice.actions;

const contentReducer = contentSlice.reducer;
export { contentReducer };

export default configureStore({
  reducer: {
    export: exportReducer,
    download: downloadReducer,
    content: contentReducer,
  },
});
