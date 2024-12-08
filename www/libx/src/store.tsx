import { configureStore } from '@reduxjs/toolkit';

export enum Action {
  SET_EXPORT_LOADING = 'SET_EXPORT_LOADING',
  SET_EXPORT_DATA = 'SET_EXPORT_DATA',
  SET_EXPORT_ERROR = 'SET_EXPORT_ERROR',

  SET_UPLOAD_LOADING = 'SET_UPLOAD_LOADING',
  SET_UPLOAD_ERROR = 'SET_UPLOAD_ERROR',
  SET_UPLOAD_COMPLETE = 'SET_UPLOAD_COMPLETE',

  SET_DOWNLOAD_LOADING = 'SET_DOWNLOAD_LOADING',
  SET_DOWNLOAD_ERROR = 'SET_DOWNLOAD_ERROR',
  SET_DOWNLOAD_URI = 'SET_DOWNLOAD_URI',

  SET_CONTENT_TITLE = 'SET_CONTENT_TITLE',
  SET_CONTENT_SUBTITLE = 'SET_CONTENT_SUBTITLE',
  SET_CONTENT_TEXT = 'SET_CONTENT_TEXT',
  SET_CONTENT_MEDIA_URL = 'SET_CONTENT_MEDIA_URL',
}

export type State = {
  content: {
    title: string | null;
    subtitle: string | null;
    text: string | null;
    mediaURL: string | null;
  };
  upload: {
    error: string | null;
    loading: boolean;
    complete: boolean;
  };
  download: {
    error: string | null;
    loading: boolean;
    display: boolean;
    downloadURI: string | null;
  };
  export: {
    error: string | null;
    loading: boolean;
    display: boolean;
    data: string | null;
  };
};

const initialState = {
  content: {
    title: null,
    subtitle: null,
    text: null,
    mediaURL: null,
  },
  upload: {
    error: null,
    loading: false,
    complete: false,
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

function libxReducer(
  state: State = initialState,
  action: { type: Action; payload?: any }
): State {
  switch (action.type) {
    case Action.SET_EXPORT_LOADING:
      return {
        ...state,
        export: { ...state.export, loading: action.payload },
      };
    case Action.SET_EXPORT_DATA:
      return {
        ...state,
        export: { ...state.export, data: action.payload },
      };
    case Action.SET_EXPORT_ERROR:
      return {
        ...state,
        export: { ...state.export, error: action.payload },
      };
    case Action.SET_UPLOAD_LOADING:
      return {
        ...state,
        upload: { ...state.upload, loading: action.payload },
      };
    case Action.SET_UPLOAD_ERROR:
      return {
        ...state,
        upload: { ...state.upload, error: action.payload },
      };
    case Action.SET_UPLOAD_COMPLETE:
      return {
        ...state,
        upload: { ...state.upload, complete: action.payload },
      };
    case Action.SET_DOWNLOAD_LOADING:
      return {
        ...state,
        download: { ...state.download, loading: action.payload },
      };
    case Action.SET_DOWNLOAD_ERROR:
      return {
        ...state,
        download: { ...state.download, error: action.payload },
      };
    case Action.SET_DOWNLOAD_URI:
      return {
        ...state,
        download: { ...state.download, downloadURI: action.payload },
      };
    case Action.SET_CONTENT_TITLE:
      return {
        ...state,
        content: { ...state.content, title: action.payload },
      };
    case Action.SET_CONTENT_SUBTITLE:
      return {
        ...state,
        content: { ...state.content, subtitle: action.payload },
      };
    case Action.SET_CONTENT_TEXT:
      return {
        ...state,
        content: { ...state.content, text: action.payload },
      };
    case Action.SET_CONTENT_MEDIA_URL:
      return {
        ...state,
        content: { ...state.content, mediaURL: action.payload },
      };
    default:
      return state;
  }
}

export default configureStore({
  reducer: libxReducer,
});
