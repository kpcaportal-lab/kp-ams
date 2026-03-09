import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate required environment variables at runtime
const validateR2Config = () => {
  const required = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'NEXT_PUBLIC_R2_ACCOUNT_ID', 'NEXT_PUBLIC_R2_BUCKET_NAME'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required R2 environment variables: ${missing.join(', ')}`);
  }
};

const getS3Client = () => {
  return new S3Client({
    region: 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  });
};

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

/**
 * Upload file to Cloudflare R2
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  fileType: string
): Promise<UploadResult> {
  validateR2Config();
  const key = `${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: fileType,
  });

  const client = getS3Client();
  await client.send(command);

  const url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  return {
    url,
    key,
    size: file.length,
  };
}

/**
 * Delete file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  validateR2Config();
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
    Key: key,
  });

  const client = getS3Client();
  await client.send(command);
}

/**
 * Get signed URL for temporary access
 */
export async function getSignedR2Url(key: string, expiresIn: number = 3600): Promise<string> {
  validateR2Config();
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
    Key: key,
  });

  const client = getS3Client();
  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
}
