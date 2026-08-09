// src/services/uploadService.ts

export const uploadResume = async (file: File, token: string): Promise<{ url: string; publicId: string; filename: string }> => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await fetch('http://localhost:9000/api/upload-resume', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload resume');
  }
};