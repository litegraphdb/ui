import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { mockInitialState } from '../../store/mockStore';
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

  it.only('should render the BackupPage', async () => {
    const { container } = renderWithRedux(<BackupPage />, mockInitialState, undefined, true);
    await waitFor(() => {
      expect(screen.getByText('Create Backup')).toBeVisible();
      expect(screen.getByText(mockBackupData[0].Filename)).toBeVisible();
    });
    expect(container).toMatchSnapshot('initial table state');

    const createButton = screen.getByRole('button', { name: /create backup/i });
    await waitFor(() => {
      expect(createButton).toBeVisible();
    });
    fireEvent.click(createButton);
  });
});
