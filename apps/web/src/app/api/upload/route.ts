import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No files uploaded",
        },
        { status: 400 },
      );
    }

    const urls = files.map(
      (file) =>
        `https://placehold.co/600x400/png?text=${encodeURIComponent(
          file.name,
        )}`,
    );

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 },
    );
  }
}