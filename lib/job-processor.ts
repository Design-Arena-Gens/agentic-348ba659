import { DocumentToolType } from './types';
import { pdfProcessor } from './processors/pdf-processor';
import { excelProcessor } from './processors/excel-processor';
import { wordProcessor } from './processors/word-processor';
import { imageProcessor } from './processors/image-processor';
import { fileStorage } from './file-storage';
import { db } from './mock-db';

export class JobProcessor {
  async processJob(jobId: string): Promise<void> {
    const job = db.getJobById(jobId);
    if (!job) throw new Error('Job not found');

    try {
      // Update status to processing
      db.updateJob(jobId, { status: 'PROCESSING', progress: 10 });

      // Load input files
      const inputBuffers = await Promise.all(
        job.inputFiles.map(async (key) => {
          const file = await fileStorage.getFile(key);
          if (!file) throw new Error(`File not found: ${key}`);
          return file.data;
        })
      );

      db.updateJob(jobId, { progress: 30 });

      // Process based on tool type
      const outputBuffers = await this.executeProcessor(job.type, inputBuffers);

      db.updateJob(jobId, { progress: 70 });

      // Upload output files
      const outputFiles = await Promise.all(
        outputBuffers.map(async (buffer, index) => {
          const ext = this.getOutputExtension(job.type);
          const filename = `output-${index + 1}.${ext}`;
          const key = fileStorage.generateKey(job.userId, filename);
          await fileStorage.uploadFile(key, buffer, {
            jobId,
            originalName: filename,
          });
          return key;
        })
      );

      // Mark job as completed
      db.updateJob(jobId, {
        status: 'COMPLETED',
        progress: 100,
        outputFiles,
        completedAt: new Date(),
      });
    } catch (error) {
      db.updateJob(jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async executeProcessor(
    type: DocumentToolType,
    inputs: Buffer[]
  ): Promise<Buffer[]> {
    switch (type) {
      // PDF Tools
      case 'pdf-merge':
        return [await pdfProcessor.mergePDFs(inputs)];
      case 'pdf-split':
        return await pdfProcessor.splitPDF(inputs[0]);
      case 'pdf-compress':
        return [await pdfProcessor.compressPDF(inputs[0])];
      case 'pdf-protect':
        return [await pdfProcessor.protectPDF(inputs[0], 'password123')];
      case 'pdf-to-txt':
        return [Buffer.from(await pdfProcessor.extractText(inputs[0]))];
      case 'pdf-to-jpg':
        return await pdfProcessor.convertToImages(inputs[0]);

      // Excel Tools
      case 'excel-merge':
        return [await excelProcessor.mergeExcel(inputs)];
      case 'excel-split':
        return await excelProcessor.splitExcel(inputs[0]);
      case 'excel-to-csv':
        return await excelProcessor.excelToCSV(inputs[0]);
      case 'csv-to-excel':
        return [await excelProcessor.csvToExcel(inputs[0])];
      case 'excel-clean':
        return [await excelProcessor.cleanData(inputs[0])];
      case 'excel-to-pdf':
        return [await excelProcessor.excelToPDF(inputs[0])];

      // Word Tools
      case 'word-merge':
        return [await wordProcessor.mergeWord(inputs)];
      case 'word-split':
        return await wordProcessor.splitWord(inputs[0]);
      case 'word-to-pdf':
        return [await wordProcessor.wordToPDF(inputs[0])];
      case 'word-to-txt':
        return [await wordProcessor.wordToText(inputs[0])];

      // Image Tools
      case 'jpg-to-pdf':
        return [await imageProcessor.imageToPDF(inputs)];

      default:
        throw new Error(`Unsupported tool type: ${type}`);
    }
  }

  private getOutputExtension(type: DocumentToolType): string {
    if (type.includes('pdf') && !type.includes('to-')) return 'pdf';
    if (type.includes('excel') && !type.includes('csv')) return 'xlsx';
    if (type.includes('word')) return 'docx';
    if (type.includes('csv')) return 'csv';
    if (type.includes('jpg')) return 'jpg';
    if (type.includes('txt')) return 'txt';
    if (type.endsWith('-to-pdf')) return 'pdf';
    if (type.endsWith('-to-word')) return 'docx';
    if (type.endsWith('-to-excel')) return 'xlsx';
    if (type.endsWith('-to-jpg')) return 'jpg';
    if (type.endsWith('-to-txt')) return 'txt';
    return 'bin';
  }
}

export const jobProcessor = new JobProcessor();

// Simple queue processor
class JobQueue {
  private processing = false;
  private queue: string[] = [];

  enqueue(jobId: string): void {
    this.queue.push(jobId);
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const jobId = this.queue.shift()!;
      await jobProcessor.processJob(jobId);
    }
    this.processing = false;
  }
}

export const jobQueue = new JobQueue();
