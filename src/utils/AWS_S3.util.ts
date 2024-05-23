import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET!,
  },
});

const getAvatarGetUrl = async (filename: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: "bucket.chatee-images.private",
      Key: `upload/avatars/${filename}`,
    });
    return await getSignedUrl(s3Client, command);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getAvatarUploadUrl = async (filename: string, contentType: string) => {
  try {
    const command = new PutObjectCommand({
      Bucket: "bucket.chatee-images.private",
      Key: `upload/avatars/${filename}`,
      ContentType: contentType,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 60 });
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getAvatarUploadUrl, getAvatarGetUrl };
