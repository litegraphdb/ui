import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import { getMockEnumerateQueryData, mockTenantData } from '../mockData';

export const handlers = [
  //update user
  http.get(`${mockEndpoint}v2.0/tenants`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockTenantData));
  }),
  http.get(`${mockEndpoint}v1.0/tenants`, () => {
    return HttpResponse.json(mockTenantData);
  }),
];
