import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs'; // Import the 'fs' module for file system operations
import { coreConstant } from '../helpers/coreConstant';
import B2 from 'backblaze-b2';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

/** Constant containing a Regular Expression
 * with the valid image upload types
 */
export const validImageUploadTypesRegex = /jpeg|jpg|png|pdf/;

/** Constant that sets the maximum image upload file size */
export const maxImageUploadSize = 50 * 1024 * 1024; // 50MB

// Create the upload directory if it doesn't exist
const uploadDirectory = path.resolve(
  process.cwd(),
  coreConstant.FILE_DESTINATION,
);
fs.mkdirSync(uploadDirectory, { recursive: true });

// Initialize B2 with retry options
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
  axios: {
    baseURL: 'https://s3.us-east-005.backblazeb2.com',
  },
  retry: {
    retries: 3,
    retryCondition: (error) => {
      return (
        error.response &&
        [429, 500, 502, 503, 504].includes(error.response.status)
      );
    },
  },
});

let bucketId: string | null = null;
let authToken: string | null = null;
let authTokenExpiry: number | null = null;

async function ensureAuthorized() {
  const now = Date.now();
  if (!authToken || !authTokenExpiry || now >= authTokenExpiry) {
    try {
      const response = await b2.authorize();
      authToken = response.data.authorizationToken;
      // Set expiry to 23 hours (B2 tokens last 24 hours)
      authTokenExpiry = now + 23 * 60 * 60 * 1000;
      return response.data;
    } catch (error) {
      console.error('B2 Authorization failed:', error);
      throw error;
    }
  }
  return null;
}

async function initializeB2() {
  try {
    // Ensure we're authorized
    await ensureAuthorized();

    // List buckets to find or create ours
    const { data } = await b2.listBuckets();

    const bucket = data.buckets.find(
      (b) => b.bucketName === process.env.B2_BUCKET_NAME,
    );
    if (bucket) {
      bucketId = bucket.bucketId;
      console.log('Found existing bucket:', bucket.bucketName);
    } else {
      // Create bucket if it doesn't exist
      const { data: newBucket } = await b2.createBucket({
        bucketName: process.env.B2_BUCKET_NAME,
        bucketType: 'allPublic',
      });
      bucketId = newBucket.bucketId;
      console.log('Created new bucket:', newBucket.bucketName);
    }
  } catch (error) {
    console.error('Failed to initialize B2:', error);
    throw error;
  }
}

/** Configurations for the multer library used for file upload.
 *
 * Accepts types jpeg, jpg, and png of size up to 3MB
 */
export const multerUploadConfig: MulterOptions = {
  fileFilter: (request, file, callback) => {
    const mimetype = validImageUploadTypesRegex.test(file.mimetype);
    const extname = validImageUploadTypesRegex.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return callback(null, true);
    }
    callback(new Error('Invalid file type'), false);
  },

  limits: {
    fileSize: maxImageUploadSize,
  },
};

export const uploadFile = async (
  file: Express.Multer.File,
  userId: string,
): Promise<string | null> => {
  if (!file || !file.buffer) {
    console.error('No file or file buffer provided for upload');
    return null;
  }

  if (!process.env.B2_BUCKET_NAME) {
    console.error('Missing required Backblaze B2 configuration');
    return null;
  }

  const fileExtension = file.originalname.split('.').pop();
  const key = `${userId}/${uuidv4()}.${fileExtension}`;

  try {
    // Initialize B2 if not already done
    if (!bucketId) {
      await initializeB2();
    } else {
      // Ensure we're authorized
      await ensureAuthorized();
    }

    console.log('Attempting to upload to B2:', {
      bucket: process.env.B2_BUCKET_NAME,
      bucketId,
      key,
      contentType: file.mimetype,
      fileSize: file.size,
    });

    // Calculate file hash
    const hash = createHash('sha1').update(file.buffer).digest('hex');

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: bucketId!,
    });

    // Upload file with proper parameters
    const response = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: key,
      data: file.buffer,
      mime: file.mimetype,
      hash,
      info: {
        'original-name': file.originalname,
        'content-type': file.mimetype,
        'file-size': file.size.toString(),
        'cache-control': 'public, max-age=31536000',
        'content-disposition': 'inline',
      },
      onUploadProgress: (event) => {
        console.log(
          `Upload progress: ${Math.round((event.loaded * 100) / event.total)}%`,
        );
      },
    });

    // Generate the file URL using S3-style endpoint
    const url = `https://s3.us-east-005.backblazeb2.com/${process.env.B2_BUCKET_NAME}/${key}`;
    console.log('File uploaded successfully to B2. URL:', url);
    return url;
  } catch (error) {
    console.error('Detailed B2 upload error:', error);
    if (error.response?.data) {
      console.error('B2 API Error:', error.response.data);
    }
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
};

export const deleteFileFromS3 = async (url: string): Promise<void> => {
  try {
    if (!bucketId) {
      await initializeB2();
    } else {
      await ensureAuthorized();
    }

    const key = new URL(url).pathname.split('/').pop();
    if (!key) {
      throw new Error('Invalid file URL');
    }

    console.log('Attempting to delete file from B2:', key);

    // Find the file ID first
    const fileList = await b2.listFileNames({
      bucketId: bucketId!,
      startFileName: key,
      maxFileCount: 1,
      prefix: key,
      delimiter: '',
    });

    if (fileList.data.files && fileList.data.files.length > 0) {
      await b2.deleteFileVersion({
        fileId: fileList.data.files[0].fileId,
        fileName: fileList.data.files[0].fileName,
      });
      console.log('File successfully deleted from B2');
    } else {
      console.log('File not found in B2');
    }
  } catch (error) {
    console.error('Error deleting file from B2:', error);
    if (error.response?.data) {
      console.error('B2 API Error:', error.response.data);
    }
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};
