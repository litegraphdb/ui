import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { CredentialType } from './types';
import {
  clearCredentials,
  createCredential,
  deleteCredential,
  credentialLists,
  updateCredential,
} from './actions';

export type CredentialStore = {
  allCredentials: CredentialType[] | null;
};

export const initialState: CredentialStore = {
  allCredentials: null,
};

const credentialReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    builder
      .addCase(credentialLists, (state, action) => {
        state.allCredentials = action.payload;
      })
      .addCase(clearCredentials, (state) => {
        state.allCredentials = null;
      })
      .addCase(createCredential, (state, action) => {
        state.allCredentials = [...(state.allCredentials || []), action.payload];
      })
      .addCase(updateCredential, (state, action) => {
        const updatedCredential = action.payload;
        state.allCredentials = (state.allCredentials || []).map((credential) =>
          credential.GUID === updatedCredential.GUID ? updatedCredential : credential
        );
      })
      .addCase(deleteCredential, (state, action) => {
        state.allCredentials = (state.allCredentials || []).filter(
          (credential) => credential.GUID !== action.payload.GUID
        );
      });
  }
);

export default credentialReducer;
