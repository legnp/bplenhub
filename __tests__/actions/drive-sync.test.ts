import { describe, it, expect, vi } from 'vitest';
import { syncSurveyToUserDrive } from '@/lib/drive-sync';
import { getSheetsClient, getDriveClient } from '@/lib/google-auth';

vi.mock('@/lib/google-auth', () => ({
  getSheetsClient: vi.fn(),
  getDriveClient: vi.fn(),
}));

vi.mock('@/lib/drive-utils', () => ({
  ensureFolder: vi.fn().mockResolvedValue('folder-id'),
  createSpreadsheet: vi.fn().mockResolvedValue({ id: 'sheet-id' }),
  syncDataToSheet: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Drive Sync Helper 🛰️', () => {
  it('should call syncDataToSheet with correct parameters', async () => {
    const mockSheets = {};
    const mockDrive = {};
    
    vi.mocked(getSheetsClient).mockResolvedValue(mockSheets as any);
    vi.mocked(getDriveClient).mockResolvedValue(mockDrive as any);

    const config = {
      matricula: 'BP-001-PF-260418',
      surveyTitle: 'Welcome',
      headers: ['Matricula', 'Status'],
      rowData: ['BP-001-PF-260418', 'Done'],
    };

    const { syncDataToSheet } = await import('@/lib/drive-utils');

    await syncSurveyToUserDrive(config);

    expect(syncDataToSheet).toHaveBeenCalledWith(
      mockSheets,
      'sheet-id',
      ['Matricula', 'Status'],
      ['BP-001-PF-260418', 'Done']
    );
  });
});
