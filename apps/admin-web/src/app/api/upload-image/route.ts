import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { success: false, message: "No files uploaded" },
        { status: 400 },
      );
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME;

    if (!bucket) {
      return NextResponse.json(
        { success: false, message: "AWS bucket missing" },
        { status: 500 },
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/\s+/g, "-");
      const key = `temples/${Date.now()}-${safeName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        }),
      );

      urls.push(key);
    }

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error("S3 UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
