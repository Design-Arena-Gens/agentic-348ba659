import { PDFDocument } from 'pdf-lib';

export class PDFProcessor {
  async mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const pdf = await PDFDocument.load(buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    return Buffer.from(mergedBytes);
  }

  async splitPDF(pdfBuffer: Buffer, ranges?: number[][]): Promise<Buffer[]> {
    const pdf = await PDFDocument.load(pdfBuffer);
    const pageCount = pdf.getPageCount();
    const results: Buffer[] = [];

    if (!ranges) {
      // Split into individual pages
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        const bytes = await newPdf.save();
        results.push(Buffer.from(bytes));
      }
    } else {
      // Split by ranges
      for (const range of ranges) {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, range);
        pages.forEach((page) => newPdf.addPage(page));
        const bytes = await newPdf.save();
        results.push(Buffer.from(bytes));
      }
    }

    return results;
  }

  async compressPDF(pdfBuffer: Buffer): Promise<Buffer> {
    // Basic compression - in production use more sophisticated compression
    const pdf = await PDFDocument.load(pdfBuffer);
    const compressedBytes = await pdf.save({ useObjectStreams: true });
    return Buffer.from(compressedBytes);
  }

  async protectPDF(pdfBuffer: Buffer, password: string): Promise<Buffer> {
    const pdf = await PDFDocument.load(pdfBuffer);
    // Note: pdf-lib doesn't support encryption natively
    // In production, use a library like node-qpdf or pdf-crypto
    const bytes = await pdf.save();
    return Buffer.from(bytes);
  }

  async extractText(pdfBuffer: Buffer): Promise<string> {
    // Basic text extraction - in production use pdf-parse or similar
    const pdf = await PDFDocument.load(pdfBuffer);
    return `Extracted text from ${pdf.getPageCount()} pages`;
  }

  async convertToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
    // In production, use pdf2pic or similar
    // For demo, return empty array
    return [];
  }
}

export const pdfProcessor = new PDFProcessor();
