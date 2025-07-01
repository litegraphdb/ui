import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import { getMockEnumerateQueryData, mockTenantGUID, mockUserData } from '../mockData';

export const handlers = [
  //update user
  http.get(`${mockEndpoint}v2.0/tenants/${mockTenantGUID}/users`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockUserData));
  }),
  http.get(`${mockEndpoint}v1.0/tenants/${mockTenantGUID}/users`, () => {
    return HttpResponse.json(mockUserData);
  }),
];
