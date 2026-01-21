import apiClient from '@/lib/apiClient';

export const csvImportService = {
  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/api/CSVImport/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Axios will handle the boundary automatically when using FormData
    });
  },

  importCSV: async (data: any) => {
    return apiClient.post('/api/CSVImport/import', data);
  }
};
