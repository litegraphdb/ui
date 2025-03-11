import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { UserType } from './types';
import {
  clearUsers,
  createUser,
  deleteUser,
  userLists,
  updateUser,
} from './actions';

export type UserStore = {
  allUsers: UserType[] | null;
};

export const initialState: UserStore = {
  allUsers: null,
};

const userReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    builder
      .addCase(userLists, (state, action) => {
        state.allUsers = action.payload;
      })
      .addCase(clearUsers, (state) => {
        state.allUsers = null;
      })
      .addCase(createUser, (state, action) => {
        state.allUsers = [...(state.allUsers || []), action.payload];
      })
      .addCase(updateUser, (state, action) => {
        const updatedUser = action.payload;
        state.allUsers = (state.allUsers || []).map((user) =>
          user.GUID === updatedUser.GUID ? updatedUser : user
        );
      })
      .addCase(deleteUser, (state, action) => {
        state.allUsers = (state.allUsers || []).filter(
          (user) => user.GUID !== action.payload.GUID
        );
      });
  }
);

export default userReducer;
