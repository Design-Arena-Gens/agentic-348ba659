// Mock file storage for demo - in production use S3/GCS
class FileStorage {
  private files: Map<string, { data: Buffer; metadata: any; expiresAt: Date }> = new Map();

  async uploadFile(
    key: string,
    data: Buffer,
    metadata?: any,
    ttlMs: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + ttlMs);
    this.files.set(key, { data, metadata, expiresAt });

    // Schedule cleanup
    setTimeout(() => this.deleteFile(key), ttlMs);

    return `/api/files/${key}`;
  }

  async getFile(key: string): Promise<{ data: Buffer; metadata: any } | null> {
    const file = this.files.get(key);
    if (!file || file.expiresAt < new Date()) {
      this.files.delete(key);
      return null;
    }
    return { data: file.data, metadata: file.metadata };
  }

  async deleteFile(key: string): Promise<void> {
    this.files.delete(key);
  }

  async listFiles(prefix: string): Promise<string[]> {
    const now = new Date();
    return Array.from(this.files.keys()).filter(key => {
      const file = this.files.get(key);
      return key.startsWith(prefix) && file && file.expiresAt >= now;
    });
  }

  generateKey(userId: string, filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${timestamp}-${random}-${sanitized}`;
  }
}

export const fileStorage = new FileStorage();
