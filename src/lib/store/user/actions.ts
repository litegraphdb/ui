import { createAction } from '@reduxjs/toolkit';
import { UserType } from './types';

export const UserActions = {
  USER_LISTS: 'USER_LISTS',
  CLEAR_USERS: 'CLEAR_USERS',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
};

export const userLists = createAction<UserType[]>(UserActions.USER_LISTS);
export const clearUsers = createAction(UserActions.CLEAR_USERS);
export const createUser = createAction<UserType>(UserActions.CREATE_USER);
export const updateUser = createAction<UserType>(UserActions.UPDATE_USER);
export const deleteUser = createAction<{ GUID: string }>(UserActions.DELETE_USER);
