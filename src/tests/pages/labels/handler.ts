import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import {
  getMockEnumerateQueryData,
  mockGraphGUID,
  mockLabelData,
  mockNodeData,
  mockTenantGUID,
} from '../mockData';

export const handlers = [
  //update user
  http.post(`${mockEndpoint}v2.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/labels`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockLabelData));
  }),
  http.get(`${mockEndpoint}v1.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/labels`, () => {
    return HttpResponse.json(mockNodeData);
  }),
];
