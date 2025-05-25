import { createAction } from '@reduxjs/toolkit';
import { CredentialType } from './types';

export const CredentialActions = {
  CREDENTIAL_LISTS: 'CREDENTIAL_LISTS',
  CLEAR_CREDENTIALS: 'CLEAR_CREDENTIALS',
  CREATE_CREDENTIAL: 'CREATE_CREDENTIAL',
  UPDATE_CREDENTIAL: 'UPDATE_CREDENTIAL',
  DELETE_CREDENTIAL: 'DELETE_CREDENTIAL',
};

export const credentialLists = createAction<CredentialType[]>(CredentialActions.CREDENTIAL_LISTS);
export const clearCredentials = createAction(CredentialActions.CLEAR_CREDENTIALS);
export const createCredential = createAction<CredentialType>(CredentialActions.CREATE_CREDENTIAL);
export const updateCredential = createAction<CredentialType>(CredentialActions.UPDATE_CREDENTIAL);
export const deleteCredential = createAction<{ GUID: string }>(CredentialActions.DELETE_CREDENTIAL);
