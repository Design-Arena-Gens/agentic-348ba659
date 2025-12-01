import { PDFDocument } from 'pdf-lib';

export class ImageProcessor {
  async imageToPDF(buffers: Buffer[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    for (const buffer of buffers) {
      // Detect image type and embed
      let image;
      try {
        image = await pdfDoc.embedJpg(buffer);
      } catch {
        try {
          image = await pdfDoc.embedPng(buffer);
        } catch {
          continue; // Skip unsupported formats
        }
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async pdfToImages(buffer: Buffer): Promise<Buffer[]> {
    // In production, use pdf2pic or similar
    // For demo, return empty array
    return [];
  }

  async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    // In production, use sharp
    // For demo, return as-is
    return buffer;
  }

  async compressImage(buffer: Buffer, quality: number = 80): Promise<Buffer> {
    // In production, use sharp
    // For demo, return as-is
    return buffer;
  }
}

export const imageProcessor = new ImageProcessor();
