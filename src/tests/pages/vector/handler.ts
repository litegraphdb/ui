import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import {
  getMockEnumerateQueryData,
  mockGraphGUID,
  mockTagData,
  mockTenantGUID,
  mockVectorData,
} from '../mockData';

export const handlers = [
  //update user
  http.post(`${mockEndpoint}v2.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/vectors`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockVectorData));
  }),
  http.get(`${mockEndpoint}v1.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/vectors`, () => {
    return HttpResponse.json(mockVectorData);
  }),
];
