import { mockEndpoint } from '@/tests/config';
import { http, HttpResponse } from 'msw';
import { getMockEnumerateQueryData, mockGraphGUID, mockTagData, mockTenantGUID } from '../mockData';

export const handlers = [
  //update user
  http.post(`${mockEndpoint}v2.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/tags`, () => {
    return HttpResponse.json(getMockEnumerateQueryData(mockTagData.allTags));
  }),
  http.get(`${mockEndpoint}v1.0/tenants/${mockTenantGUID}/graphs/${mockGraphGUID}/tags`, () => {
    return HttpResponse.json(mockTagData.allTags);
  }),
];
