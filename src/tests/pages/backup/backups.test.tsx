import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMockStore } from '../../store/mockStore';
import { mockBackupData, mockTenantData } from '../mockData';
import BackupPage from '@/page/backups/BackupPage';
import { renderWithRedux } from '@/tests/store/utils';
import { getServer } from '@/tests/server';
import { handlers } from './handler';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { commonHandlers } from '@/tests/handler';

const server = getServer([...commonHandlers, ...handlers]);
setTenant(mockTenantData[0].GUID);

describe('BackupPage', () => {
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const store = createMockStore();

  it.only('should render the BackupPage', async () => {
    const { container } = renderWithRedux(<BackupPage />, store as any, undefined, true);
    await waitFor(() => {
      expect(container).toMatchSnapshot('initial table state');
      expect(screen.getByText(mockBackupData[0].Filename)).toBeVisible();
    });
  });
});
