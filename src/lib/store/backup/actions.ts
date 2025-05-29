import { createAction } from '@reduxjs/toolkit';
import { BackupType } from './types';

export const BackupActions = {
  BACKUP_LISTS: 'BACKUP_LISTS',
  CREATE_BACKUP: 'CREATE_BACKUP',
  VIEW_BACKUP: 'VIEW_BACKUP',
  DELETE_BACKUP: 'DELETE_BACKUP',
};

export const backupLists = createAction<BackupType[]>(BackupActions.BACKUP_LISTS);
export const createBackup = createAction<BackupType>(BackupActions.CREATE_BACKUP);
export const viewBackup = createAction<BackupType>(BackupActions.VIEW_BACKUP);
export const deleteBackup = createAction<{ Filename: string }>(BackupActions.DELETE_BACKUP);
