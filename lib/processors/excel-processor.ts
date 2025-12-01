import * as XLSX from 'xlsx';

export class ExcelProcessor {
  async mergeExcel(buffers: Buffer[]): Promise<Buffer> {
    const mergedWorkbook = XLSX.utils.book_new();
    let sheetIndex = 1;

    for (const buffer of buffers) {
      const workbook = XLSX.read(buffer);
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        XLSX.utils.book_append_sheet(mergedWorkbook, sheet, `Sheet${sheetIndex++}`);
      });
    }

    const output = XLSX.write(mergedWorkbook, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(output);
  }

  async splitExcel(buffer: Buffer): Promise<Buffer[]> {
    const workbook = XLSX.read(buffer);
    const results: Buffer[] = [];

    for (const sheetName of workbook.SheetNames) {
      const newWorkbook = XLSX.utils.book_new();
      const sheet = workbook.Sheets[sheetName];
      XLSX.utils.book_append_sheet(newWorkbook, sheet, sheetName);
      const output = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
      results.push(Buffer.from(output));
    }

    return results;
  }

  async excelToCSV(buffer: Buffer): Promise<Buffer[]> {
    const workbook = XLSX.read(buffer);
    const results: Buffer[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      results.push(Buffer.from(csv, 'utf-8'));
    }

    return results;
  }

  async csvToExcel(buffer: Buffer, filename: string = 'Sheet1'): Promise<Buffer> {
    const csv = buffer.toString('utf-8');
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(
      csv.split('\n').map((row) => row.split(','))
    );
    XLSX.utils.book_append_sheet(workbook, sheet, filename);
    const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(output);
  }

  async cleanData(buffer: Buffer): Promise<Buffer> {
    const workbook = XLSX.read(buffer);
    const newWorkbook = XLSX.utils.book_new();

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      // Remove empty rows and duplicates
      const cleaned = data.filter((row, index, self) => {
        const isEmpty = row.every((cell) => !cell || cell === '');
        const isDuplicate = self.findIndex((r) => JSON.stringify(r) === JSON.stringify(row)) !== index;
        return !isEmpty && !isDuplicate;
      });

      const cleanedSheet = XLSX.utils.aoa_to_sheet(cleaned);
      XLSX.utils.book_append_sheet(newWorkbook, cleanedSheet, sheetName);
    }

    const output = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(output);
  }

  async excelToPDF(buffer: Buffer): Promise<Buffer> {
    // In production, use a library like excel-to-pdf
    // For demo, create a simple PDF with the data
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_csv(sheet);
    return Buffer.from(data); // Simplified
  }
}

export const excelProcessor = new ExcelProcessor();
