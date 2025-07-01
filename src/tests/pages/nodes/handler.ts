import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import {
  getMockEnumerateQueryData,
  mockGraphGUID,
  mockNodeData,
  mockTenantGUID,
} from '../mockData';

export const handlers = [
  //update user
  http.post(`${mockEndpoint}v2.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/nodes`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockNodeData));
  }),
  http.get(`${mockEndpoint}v1.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/nodes`, () => {
    return HttpResponse.json(mockNodeData);
  }),
];
