import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import { mockBackupData } from '../mockData';

export const handlers = [
  //update user
  http.get(`${mockEndpoint}v1.0/backups`, () => {
    return HttpResponse.json(mockBackupData);
  }),
];
