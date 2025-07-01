import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import { getMockEnumerateQueryData, mockCredentialData, mockTenantGUID } from '../mockData';

export const handlers = [
  //update user
  http.get(`${mockEndpoint}v2.0/tenants/${mockTenantGUID}/credentials`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockCredentialData));
  }),
];
