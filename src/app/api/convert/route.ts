import { NextRequest, NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import sharp, { FormatEnum } from "sharp";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs"; // ensures Node APIs work on Vercel

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll("file") as File[]; // support multiple
    const targetFormat = formData.get("format") as string;

    if (!files.length || !targetFormat) {
      return NextResponse.json({ error: "Missing file(s) or format" }, { status: 400 });
    }

    let convertedBuffer: Buffer | Uint8Array;
    let mimeType = "application/octet-stream";
    const extension = targetFormat.toLowerCase();

    if (extension === "png" || extension === "jpg" || extension === "jpeg" || extension === "webp") {
      // Convert first file (ignore multiple)
      const buffer = Buffer.from(await files[0].arrayBuffer());
      const format = (extension === "jpg" ? "jpeg" : extension) as keyof FormatEnum;
      convertedBuffer = await sharp(buffer).toFormat(format).toBuffer();
      mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;
    } else if (extension === "pdf") {
      // Merge all images into single PDF
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const type = await fileTypeFromBuffer(buffer);

        if (!type?.mime.startsWith("image/")) {
          throw new Error("PDF conversion only supports images");
        }

        const image = type.mime === "image/png"
          ? await pdfDoc.embedPng(buffer)
          : await pdfDoc.embedJpg(buffer);

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      convertedBuffer = Buffer.from(await pdfDoc.save());
      mimeType = "application/pdf";
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

    // Convert the buffer to a Uint8Array and create a Blob for the response
    const responseBuffer = new Uint8Array(convertedBuffer);
    const blob = new Blob([responseBuffer], { type: mimeType });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename=converted.${extension}`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
