import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { BackupType } from './types';
import { backupLists, createBackup, deleteBackup, viewBackup } from './actions';

export type BackupStore = {
  allBackups: BackupType[] | null;
};

export const initialState: BackupStore = {
  allBackups: null,
};

const backupReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    builder.addCase(backupLists, (state, action) => {
      state.allBackups = action.payload;
    });
    builder.addCase(createBackup, (state, action) => {
      state.allBackups = [...(state.allBackups || []), action.payload];
    });
    builder.addCase(viewBackup, (state, action) => {
      state.allBackups = (state.allBackups || []).filter(
        (backup) => backup.Filename === action.payload.Filename
      );
    });
    builder.addCase(deleteBackup, (state, action) => {
      state.allBackups = (state.allBackups || []).filter(
        (backup) => backup.Filename !== action.payload.Filename
      );
    });
  }
);

export default backupReducer;
