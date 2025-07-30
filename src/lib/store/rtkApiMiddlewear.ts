import { isRejectedWithValue, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { isNumber } from 'lodash';
import toast from 'react-hot-toast';
import { handleLogout } from './rootReducer';
import { globalToastId } from '@/constants/config';

export const errorHandler = (er: any) => {
  const error = er?.payload || {};
  const endpointName = er?.meta?.arg?.endpointName;
  const serverErrorMessage = error?.data?.message || error?.data?.detail;
  if (isNumber(error?.status) || isNumber(error?.StatusCode)) {
    switch (error.status || error.StatusCode) {
      case 401:
      case 403:
        if (endpointName !== 'login') {
          toast.error('Invalid session, login again. ', { id: globalToastId });
          setTimeout(() => {
            handleLogout();
          }, 2000);
          break;
        }
      default:
        toast.error(serverErrorMessage ? serverErrorMessage : 'Something went wrong.', {
          id: globalToastId,
        });
    }
  }
  if (error?.data == 'Network Error') {
    toast.error('Network Error', { id: globalToastId });
  }
};

export const rtkQueryErrorLogger: Middleware =
  (_api: MiddlewareAPI) => (next: (action: any) => any) => (action: any) => {
    // RTK Query uses `createAsyncThunk` from redux-toolkit under the hood, so we're able to utilize these matchers!
    if (isRejectedWithValue(action)) {
      errorHandler(action);
    }

    return next(action);
  };
