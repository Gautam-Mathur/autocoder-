// ZIP Export System - Export projects with proper folder structure

export interface ExportFile {
  path: string;
  content: string;
  language?: string;
}

export interface ExportOptions {
  projectName: string;
  includeReadme: boolean;
  includeGitignore: boolean;
  includeLicense: boolean;
  includeEnvExample: boolean;
  format: 'zip' | 'tar';
}

// Simple ZIP implementation using browser APIs
class ZipBuilder {
  private files: Map<string, Uint8Array> = new Map();

  addFile(path: string, content: string | Uint8Array): void {
    const data = typeof content === 'string' 
      ? new TextEncoder().encode(content)
      : content;
    this.files.set(path, data);
  }

  // Generate ZIP file as Blob
  async generateZip(): Promise<Blob> {
    const parts: Uint8Array[] = [];
    const centralDirectory: Uint8Array[] = [];
    let offset = 0;

    for (const [path, data] of Array.from(this.files.entries())) {
      // Local file header
      const localHeader = this.createLocalHeader(path, data);
      parts.push(localHeader);
      parts.push(data);

      // Central directory entry
      const cdEntry = this.createCentralDirectoryEntry(path, data, offset);
      centralDirectory.push(cdEntry);

      offset += localHeader.length + data.length;
    }

    // Write central directory
    const cdOffset = offset;
    for (const entry of centralDirectory) {
      parts.push(entry);
      offset += entry.length;
    }

    // End of central directory
    const eocd = this.createEndOfCentralDirectory(
      this.files.size,
      offset - cdOffset,
      cdOffset
    );
    parts.push(eocd);

    return new Blob(parts, { type: 'application/zip' });
  }

  private createLocalHeader(path: string, data: Uint8Array): Uint8Array {
    const pathBytes = new TextEncoder().encode(path);
    const crc = this.crc32(data);
    
    const header = new Uint8Array(30 + pathBytes.length);
    const view = new DataView(header.buffer);

    // Local file header signature
    view.setUint32(0, 0x04034b50, true);
    // Version needed
    view.setUint16(4, 20, true);
    // General purpose flag
    view.setUint16(6, 0, true);
    // Compression method (0 = store)
    view.setUint16(8, 0, true);
    // Last mod time
    view.setUint16(10, 0, true);
    // Last mod date
    view.setUint16(12, 0, true);
    // CRC-32
    view.setUint32(14, crc, true);
    // Compressed size
    view.setUint32(18, data.length, true);
    // Uncompressed size
    view.setUint32(22, data.length, true);
    // File name length
    view.setUint16(26, pathBytes.length, true);
    // Extra field length
    view.setUint16(28, 0, true);
    // File name
    header.set(pathBytes, 30);

    return header;
  }

  private createCentralDirectoryEntry(path: string, data: Uint8Array, offset: number): Uint8Array {
    const pathBytes = new TextEncoder().encode(path);
    const crc = this.crc32(data);
    
    const entry = new Uint8Array(46 + pathBytes.length);
    const view = new DataView(entry.buffer);

    // Central directory signature
    view.setUint32(0, 0x02014b50, true);
    // Version made by
    view.setUint16(4, 20, true);
    // Version needed
    view.setUint16(6, 20, true);
    // General purpose flag
    view.setUint16(8, 0, true);
    // Compression method
    view.setUint16(10, 0, true);
    // Last mod time
    view.setUint16(12, 0, true);
    // Last mod date
    view.setUint16(14, 0, true);
    // CRC-32
    view.setUint32(16, crc, true);
    // Compressed size
    view.setUint32(20, data.length, true);
    // Uncompressed size
    view.setUint32(24, data.length, true);
    // File name length
    view.setUint16(28, pathBytes.length, true);
    // Extra field length
    view.setUint16(30, 0, true);
    // Comment length
    view.setUint16(32, 0, true);
    // Disk number start
    view.setUint16(34, 0, true);
    // Internal file attributes
    view.setUint16(36, 0, true);
    // External file attributes
    view.setUint32(38, 0, true);
    // Relative offset of local header
    view.setUint32(42, offset, true);
    // File name
    entry.set(pathBytes, 46);

    return entry;
  }

  private createEndOfCentralDirectory(entries: number, cdSize: number, cdOffset: number): Uint8Array {
    const eocd = new Uint8Array(22);
    const view = new DataView(eocd.buffer);

    // End of central directory signature
    view.setUint32(0, 0x06054b50, true);
    // Disk number
    view.setUint16(4, 0, true);
    // Disk with CD
    view.setUint16(6, 0, true);
    // Entries on disk
    view.setUint16(8, entries, true);
    // Total entries
    view.setUint16(10, entries, true);
    // CD size
    view.setUint32(12, cdSize, true);
    // CD offset
    view.setUint32(16, cdOffset, true);
    // Comment length
    view.setUint16(20, 0, true);

    return eocd;
  }

  // CRC32 calculation
  private crc32(data: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    const table = this.getCRC32Table();
    
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xFF];
    }
    
    return crc ^ 0xFFFFFFFF;
  }

  private crc32Table: Uint32Array | null = null;
  
  private getCRC32Table(): Uint32Array {
    if (this.crc32Table) return this.crc32Table;
    
    this.crc32Table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      this.crc32Table[i] = c;
    }
    return this.crc32Table;
  }
}

// Generate README.md content
function generateReadme(projectName: string, files: ExportFile[]): string {
  const hasPackageJson = files.some(f => f.path.includes('package.json'));
  const hasServer = files.some(f => f.path.includes('server'));
  const hasPython = files.some(f => f.path.endsWith('.py'));
  
  let readme = `# ${projectName}

Generated by AutoCoder - AI-Powered Code Generator

## Project Structure

\`\`\`
${files.map(f => f.path).join('\n')}
\`\`\`

## Getting Started

`;

  if (hasPackageJson) {
    readme += `### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

`;
  }

  if (hasPython) {
    readme += `### Python Setup

\`\`\`bash
pip install -r requirements.txt
python app.py
\`\`\`

`;
  }

  if (hasServer) {
    readme += `### Backend

The project includes a backend server. Make sure to configure environment variables before running.

`;
  }

  readme += `## Technologies

- Generated with AI assistance
- Full-stack ready for deployment

## License

MIT License
`;

  return readme;
}

// Generate .gitignore
function generateGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# Testing
coverage/
.nyc_output/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
`;
}

// Generate .env.example
function generateEnvExample(files: ExportFile[]): string {
  const envVars: string[] = [];
  
  // Scan files for environment variable usage
  for (const file of files) {
    const matches = file.content.match(/process\.env\.(\w+)|import\.meta\.env\.(\w+)/g);
    if (matches) {
      for (const match of matches) {
        const varName = match.replace(/process\.env\.|import\.meta\.env\./, '');
        if (!envVars.includes(varName) && !['NODE_ENV', 'PORT'].includes(varName)) {
          envVars.push(varName);
        }
      }
    }
  }

  if (envVars.length === 0) {
    return `# Environment Variables
NODE_ENV=development
PORT=3000
`;
  }

  return `# Environment Variables
# Copy this file to .env and fill in the values

NODE_ENV=development
PORT=3000

${envVars.map(v => `${v}=your_${v.toLowerCase()}_here`).join('\n')}
`;
}

// Generate MIT License
function generateLicense(): string {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

// Main export function
export async function exportProjectAsZip(
  files: ExportFile[],
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const opts: ExportOptions = {
    projectName: 'autocoder-project',
    includeReadme: true,
    includeGitignore: true,
    includeLicense: true,
    includeEnvExample: true,
    format: 'zip',
    ...options
  };

  const zip = new ZipBuilder();
  const projectRoot = opts.projectName.toLowerCase().replace(/\s+/g, '-');

  // Add project files
  for (const file of files) {
    const filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
    zip.addFile(`${projectRoot}/${filePath}`, file.content);
  }

  // Add extra files
  if (opts.includeReadme) {
    zip.addFile(`${projectRoot}/README.md`, generateReadme(opts.projectName, files));
  }

  if (opts.includeGitignore) {
    zip.addFile(`${projectRoot}/.gitignore`, generateGitignore());
  }

  if (opts.includeLicense) {
    zip.addFile(`${projectRoot}/LICENSE`, generateLicense());
  }

  if (opts.includeEnvExample) {
    zip.addFile(`${projectRoot}/.env.example`, generateEnvExample(files));
  }

  return zip.generateZip();
}

// Download helper
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export and download in one step
export async function downloadProjectAsZip(
  files: ExportFile[],
  projectName: string = 'autocoder-project'
): Promise<void> {
  const blob = await exportProjectAsZip(files, { projectName });
  downloadBlob(blob, `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`);
}
