export interface ToolFeature {
  name: string;
  description: string;
  requiresAuth: boolean;
  minRole: "anonymous" | "free" | "premium" | "admin" | "superadmin";
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "available" | "coming_soon" | "beta";
  category: string;
  features: {
    basic: ToolFeature[];
    advanced: ToolFeature[];
  };
  maxFileSize: {
    anonymous: number;
    free: number;
    premium: number;
  };
  supportedFormats: string[];
  githubPath: string;
}

export interface FileType {
  id: string;
  name: string;
  icon: string;
  description: string;
  tools: Tool[];
  color: string;
}

// This would be auto-generated from GitHub structure
export const fileTypes: FileType[] = [
  {
    id: "pdf",
    name: "PDF",
    icon: "📄",
    description: "Portable Document Format tools",
    color: "red",
    tools: [
      {
        id: "pdf-merge",
        name: "Merge PDF",
        description: "Combine multiple PDF files into one document",
        icon: "🔗",
        status: "available",
        category: "pdf",
        features: {
          basic: [
            {
              name: "Merge up to 5 files",
              description: "Combine up to 5 PDF files",
              requiresAuth: false,
              minRole: "anonymous",
            },
          ],
          advanced: [
            {
              name: "Unlimited merging",
              description: "Merge unlimited PDF files",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Page reordering",
              description: "Reorder pages before merging",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Bookmark preservation",
              description: "Maintain bookmarks and metadata",
              requiresAuth: true,
              minRole: "premium",
            },
          ],
        },
        maxFileSize: {
          anonymous: 20,
          free: 20,
          premium: 200,
        },
        supportedFormats: [".pdf"],
        githubPath: "/tools/pdf/merge",
      },
      {
        id: "pdf-split",
        name: "Split PDF",
        description: "Split a PDF file into multiple documents",
        icon: "✂️",
        status: "coming_soon",
        category: "pdf",
        features: {
          basic: [
            {
              name: "Split by page range",
              description: "Split PDF by specifying page ranges",
              requiresAuth: false,
              minRole: "anonymous",
            },
          ],
          advanced: [
            {
              name: "Split by bookmarks",
              description: "Automatically split by bookmarks",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Split by file size",
              description: "Split based on target file size",
              requiresAuth: true,
              minRole: "premium",
            },
          ],
        },
        maxFileSize: {
          anonymous: 20,
          free: 20,
          premium: 200,
        },
        supportedFormats: [".pdf"],
        githubPath: "/tools/pdf/split",
      },
      {
        id: "pdf-compress",
        name: "Compress PDF",
        description: "Reduce PDF file size while maintaining quality",
        icon: "🗜️",
        status: "available",
        category: "pdf",
        features: {
          basic: [
            {
              name: "Standard compression",
              description: "Basic PDF compression",
              requiresAuth: false,
              minRole: "anonymous",
            },
          ],
          advanced: [
            {
              name: "Lossless compression",
              description: "Maximum compression without quality loss",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Custom quality settings",
              description: "Fine-tune compression levels",
              requiresAuth: true,
              minRole: "premium",
            },
          ],
        },
        maxFileSize: {
          anonymous: 20,
          free: 20,
          premium: 200,
        },
        supportedFormats: [".pdf"],
        githubPath: "/tools/pdf/compress",
      },
    ],
  },
  {
    id: "image",
    name: "Image",
    icon: "🖼️",
    description: "Image processing and manipulation tools",
    color: "blue",
    tools: [
      {
        id: "image-compress",
        name: "Compress Image",
        description: "Reduce image file size while preserving quality",
        icon: "🗜️",
        status: "available",
        category: "image",
        features: {
          basic: [
            {
              name: "Basic compression",
              description: "Standard image compression",
              requiresAuth: false,
              minRole: "anonymous",
            },
          ],
          advanced: [
            {
              name: "Lossless compression",
              description: "Maximum compression without quality loss",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Batch processing",
              description: "Process multiple images at once",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Custom dimensions",
              description: "Resize images to specific dimensions",
              requiresAuth: true,
              minRole: "premium",
            },
          ],
        },
        maxFileSize: {
          anonymous: 20,
          free: 20,
          premium: 200,
        },
        supportedFormats: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
        githubPath: "/tools/image/compress",
      },
      {
        id: "image-convert",
        name: "Convert Image",
        description: "Convert images between different formats",
        icon: "🔄",
        status: "available",
        category: "image",
        features: {
          basic: [
            {
              name: "Format conversion",
              description: "Convert between common image formats",
              requiresAuth: false,
              minRole: "anonymous",
            },
          ],
          advanced: [
            {
              name: "Batch conversion",
              description: "Convert multiple images at once",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Quality preservation",
              description: "Advanced conversion with quality optimization",
              requiresAuth: true,
              minRole: "premium",
            },
          ],
        },
        maxFileSize: {
          anonymous: 20,
          free: 20,
          premium: 200,
        },
        supportedFormats: [
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
          ".gif",
          ".bmp",
          ".tiff",
        ],
        githubPath: "/tools/image/convert",
      },
    ],
  },
  {
    id: "document",
    name: "Document",
    icon: "📝",
    description: "Document processing and conversion tools",
    color: "green",
    tools: [
      {
        id: "doc-to-pdf",
        name: "Word to PDF",
        description: "Convert Word documents to PDF format",
        icon: "📄",
        status: "coming_soon",
        category: "document",
        features: {
          basic: [
            {
              name: "Basic conversion",
              description: "Convert DOC/DOCX to PDF",
              requiresAuth: false,
              minRole: "anonymous",
            },
          ],
          advanced: [
            {
              name: "Layout preservation",
              description: "Maintain exact formatting and layout",
              requiresAuth: true,
              minRole: "premium",
            },
            {
              name: "Batch conversion",
              description: "Convert multiple documents at once",
              requiresAuth: true,
              minRole: "premium",
            },
          ],
        },
        maxFileSize: {
          anonymous: 20,
          free: 20,
          premium: 200,
        },
        supportedFormats: [".doc", ".docx"],
        githubPath: "/tools/document/word-to-pdf",
      },
    ],
  },
];

export function getToolById(toolId: string): Tool | undefined {
  for (const fileType of fileTypes) {
    const tool = fileType.tools.find((t) => t.id === toolId);
    if (tool) return tool;
  }
  return undefined;
}

export function getFileTypeById(fileTypeId: string): FileType | undefined {
  return fileTypes.find((ft) => ft.id === fileTypeId);
}

// This function would fetch the latest tools configuration from GitHub
export async function fetchToolsFromGitHub(): Promise<FileType[]> {
  // TODO: Implement GitHub API integration to scan /tools/ directory structure
  // and auto-generate tools configuration
  return fileTypes;
}
