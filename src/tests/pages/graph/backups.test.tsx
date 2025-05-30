import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '../../store/mockStore';
import { mockBackupData } from '../mockData';
import BackupPage from '@/page/backups/BackupPage';

jest.mock('antd', () => jest.requireActual('antd'));

jest.mock('@/hooks/entityHooks', () => ({
  useBackups: () => ({
    backupsList: mockBackupData,
    isLoading: false,
    error: null,
    fetchBackupsList: jest.fn(),
  }),
}));

describe('BackupPage', () => {
  const store = createMockStore();

  it('should render the BackupPage', () => {
    render(
      <Provider store={store}>
        <BackupPage />
      </Provider>
    );

    const titleElement = screen.getByText('Backups');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toMatchSnapshot();
  });

  it('should display Create Backup button', () => {
    render(
      <Provider store={store}>
        <BackupPage />
      </Provider>
    );

    const createButton = screen.getByRole('button', { name: /create backup/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeVisible();
    expect(createButton).toMatchSnapshot();
  });

  it('should create a backup and should be visible in the table', async () => {
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <BackupPage />
      </Provider>
    );

    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    const createButton = screen.getByRole('button', { name: /create backup/i });
    expect(createButton).toMatchSnapshot('create backup button');
    fireEvent.click(createButton);

    const addBackupModal = container.querySelector('.ant-modal');
    expect(addBackupModal).toMatchSnapshot('add backup modal');

    const backupNameInput = screen.getByLabelText('Filename');
    expect(backupNameInput).toMatchSnapshot('backup name input');

    const backupName = mockBackupData[0].Filename;
    fireEvent.change(backupNameInput, { target: { value: backupName } });

    const submitButton = screen.getByRole('button', { name: /ok/i });
    expect(submitButton).toMatchSnapshot('submit button');
    fireEvent.click(submitButton);

    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state');
  }, 15000);

  it('should delete a backup and should be removed from the table', async () => {
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <BackupPage />
      </Provider>
    );

    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    const menuButtons = screen.getAllByRole('backup-action-menu');
    expect(menuButtons[1]).toBeInTheDocument();
    await fireEvent.click(menuButtons[1]);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after deletion');
  }, 15000);

  it('should download a backup', async () => {
    jest.setTimeout(15000);

    const { container } = render(
      <Provider store={store}>
        <BackupPage />
      </Provider>
    );

    const initialTable = container.querySelector('.ant-table');
    expect(initialTable).toMatchSnapshot('initial table state');

    const menuButtons = screen.getAllByRole('backup-action-menu');
    expect(menuButtons[0]).toBeInTheDocument();
    await fireEvent.click(menuButtons[0]);

    // Take final table snapshot
    const finalTable = container.querySelector('.ant-table');
    expect(finalTable).toMatchSnapshot('final table state after download');
  }, 15000);
});
