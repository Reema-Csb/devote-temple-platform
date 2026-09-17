import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

import { S3Folders } from "@/enums/s3Folders";
import { s3 } from "@/lib/s3";

export const runtime = "nodejs";

function getConfigError() {
  const missing = ["AWS_BUCKET_NAME"].filter((key) => !process.env[key]);

  return missing.length > 0
    ? `Missing S3 config: ${missing.join(", ")}`
    : null;
}

export async function GET(req: NextRequest) {
  const configError = getConfigError();

  if (configError) {
    return NextResponse.json({ message: configError }, { status: 500 });
  }

  const key = req.nextUrl.searchParams.get("key");

  if (!key || !key.startsWith(`${S3Folders.TEMPLES}/`)) {
    return NextResponse.json({ message: "Invalid image key" }, { status: 400 });
  }

  try {
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      }),
    );

    const bytes = await object.Body?.transformToByteArray();

    if (!bytes) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const body = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": object.ContentType ?? "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("S3 image fetch error:", error);

    return NextResponse.json({ message: "Image not found" }, { status: 404 });
  }
}
