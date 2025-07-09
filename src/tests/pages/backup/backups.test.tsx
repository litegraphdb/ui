import '@testing-library/jest-dom';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createMockInitialState } from '../../store/mockStore';
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

  it('should render the BackupPage', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<BackupPage />, initialState, undefined, true);
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

  it('should display Create Backup button', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<BackupPage />, initialState, undefined, true);

    const createButton = screen.getByRole('button', { name: /create backup/i });
    await waitFor(() => {
      expect(createButton).toBeVisible();
    });
    expect(createButton).toMatchSnapshot();
  });

  it('should create a backup and should be visible in the table', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<BackupPage />, initialState, undefined, true);

    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    const createButton = screen.getByRole('button', { name: /create backup/i });
    await waitFor(() => {
      expect(createButton).toBeVisible();
    });
    fireEvent.click(createButton);

    const addBackupModal = container.querySelector('.ant-modal');
    expect(addBackupModal).toMatchSnapshot('add backup modal');

    const backupNameInput = screen.getByTestId('filename-input');
    await waitFor(() => {
      expect(backupNameInput).toBeVisible();
    });

    const backupName = mockBackupData[0].Filename;
    fireEvent.change(backupNameInput, { target: { value: backupName } });

    const submitButton = screen.getByRole('button', { name: /ok/i });
    await waitFor(() => {
      expect(submitButton).toBeVisible();
    });
    fireEvent.click(submitButton);

    const finalTable = container.querySelector('.ant-table');
    await waitFor(() => {
      expect(finalTable).toBeVisible();
    });
  }, 15000);

  // it('should delete a backup and should be removed from the table', async () => {
  //   const { container } = renderWithRedux(<BackupPage />, mockInitialState, undefined, true);

  //   const initialTable = container.querySelector('.ant-table');
  //   await waitFor(() => {
  //     expect(initialTable).toBeVisible();
  //   });

  //   const menuButtons = screen.getAllByRole('backup-action-menu');
  //   await waitFor(() => {
  //     expect(menuButtons[1]).toBeVisible();
  //   });
  //   await fireEvent.click(menuButtons[1]);

  //   const deleteButton = screen.getByRole('button', { name: /delete/i });
  //   await waitFor(() => {
  //     expect(deleteButton).toBeVisible();
  //   });
  //   fireEvent.click(deleteButton);

  //   const finalTable = container.querySelector('.ant-table');
  //   await waitFor(() => {
  //     expect(finalTable).toBeVisible();
  //   });
  // }, 15000);

  it('should delete a backup and should be removed from the table', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<BackupPage />, initialState, undefined, true);
  
    const initialTable = container.querySelector('.ant-table');
    await waitFor(() => {
      expect(initialTable).toBeVisible();
    });
  
    const menuButtons = await screen.findAllByRole('backup-action-menu');
    expect(menuButtons.length).toBeGreaterThan(0);
  
    fireEvent.click(menuButtons[0]);
  
    const deleteButton = await screen.findByText(/delete/i); // inside dropdown
    fireEvent.click(deleteButton);
  
    const confirmButton = await screen.findByRole('button', { name: /delete/i }); // modal confirm
    fireEvent.click(confirmButton);
  
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // confirm modal closed
    });
  
    const finalTable = container.querySelector('.ant-table');
    await waitFor(() => {
      expect(finalTable).toBeVisible();
    });
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  }, 15000);
  

  // it('should download a backup', async () => {
  //   const initialState = createMockInitialState();
  //   const { container } = renderWithRedux(<BackupPage />, initialState, undefined, true);

  //   const initialTable = container.querySelector('.ant-table');
  //   await waitFor(() => {
  //     expect(initialTable).toBeVisible();
  //   });

  //   const menuButtons = screen.getAllByTestId('backup-action-menu');
  //   await waitFor(() => {
  //     expect(menuButtons[0]).toBeVisible();
  //   });
  //   await fireEvent.click(menuButtons[0]);

  //   // Take final table snapshot
  //   const finalTable = container.querySelector('.ant-table');
  //   await waitFor(() => {
  //     expect(finalTable).toBeVisible();
  //   });
  //   expect(finalTable).toMatchSnapshot('final table state after download');
  // }, 15000);

  it('should download a backup', async () => {
    const initialState = createMockInitialState();
    const { container } = renderWithRedux(<BackupPage />, initialState, undefined, true);
  
    // ✅ Wait for the backup filename to appear (ensures table is populated)
    await waitFor(() => {
      expect(screen.getAllByTestId('backup-filename').length).toBeGreaterThan(0);
    });

    // Now query the menu buttons
    const menuButtons = screen.getAllByRole('backup-action-menu');
    expect(menuButtons.length).toBeGreaterThan(0);
    fireEvent.click(menuButtons[0]);
  
    // Optional: click download if needed
    const downloadButton = await screen.findByText('Download');
    fireEvent.click(downloadButton);
  
    // Final assertion
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after download');
  }, 15000);
  
});
