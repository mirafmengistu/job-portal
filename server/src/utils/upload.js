import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../config/cloudinary.js';

export const uploadResume = async (
  fileBuffer,
  userId,
  originalName,
  mimetype
) => {
  try {
    const extension = originalName.split('.').pop()?.toLowerCase();
    const filename = `${userId}-${uuidv4()}`;

    const base64File = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: `resumes/${userId}`,
      resource_type: 'auto',
      public_id: filename,
      use_filename: true,
      unique_filename: false,
      access_mode: 'public',
      type: 'upload',
    });

    console.log('✅ Resume uploaded successfully:', result.secure_url);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: extension,
      originalName,
      mimetype,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload resume: ${error.message}`);
  }
};