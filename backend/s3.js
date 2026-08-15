const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadImageToS3(fileBuffer, originalName, mimetype) {
  console.log("S3 upload attempt:", { BUCKET_NAME, originalName, mimetype, size: fileBuffer.length });

  if (!BUCKET_NAME) {
    console.log("S3 skipped: S3_BUCKET_NAME is not set");
    return null;
  }

  const ext = originalName.split(".").pop() || "bin";
  const key = `blog-images/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: "public-read",
  });

  try {
    await s3.send(command);
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;
    console.log("S3 upload success:", url);
    return url;
  } catch (err) {
    console.error("S3 upload failed:", err);
    return null;
  }
}

module.exports = { uploadImageToS3 };
