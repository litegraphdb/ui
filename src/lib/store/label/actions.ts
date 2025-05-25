import { createAction } from '@reduxjs/toolkit';
import { LabelType } from './types';

export const LabelActions = {
  LABEL_LISTS: 'LABEL_LISTS',
  CLEAR_LABELS: 'CLEAR_LABELS',
  CREATE_LABEL: 'CREATE_LABEL',
  UPDATE_LABEL: 'UPDATE_LABEL',
  DELETE_LABEL: 'DELETE_LABEL',
  UPDATE_LABEL_WITH_GROUP: 'UPDATE_LABEL_WITH_GROUP',
};

export const labelLists = createAction<LabelType[]>(LabelActions.LABEL_LISTS);
export const clearLabels = createAction(LabelActions.CLEAR_LABELS);
export const createLabel = createAction<LabelType>(LabelActions.CREATE_LABEL);
export const updateLabel = createAction<LabelType>(LabelActions.UPDATE_LABEL);
export const deleteLabel = createAction<{ GUID: string }>(LabelActions.DELETE_LABEL);
export const updateLabelGroupWithGraph = createAction<{ labelId: string; labelData: LabelType }>(
  LabelActions.UPDATE_LABEL_WITH_GROUP
);
