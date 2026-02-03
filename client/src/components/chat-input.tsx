import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Plus, Github, Upload, Link, X, FileCode, FolderUp, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  conversationId?: number | null;
  onFilesUploaded?: () => void;
}

// Parse GitHub URL to extract owner, repo, branch
function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  try {
    const trimmed = url.trim();
    let match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:tree|blob)\/([^\/]+))?/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
        branch: match[3]
      };
    }
    match = trimmed.match(/^([^\/]+)\/([^\/]+)$/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    return null;
  } catch {
    return null;
  }
}

export function ChatInput({ onSend, isLoading, placeholder = "Message CodeAI...", conversationId, onFilesUploaded }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleGitHubImport = useCallback(async () => {
    if (!conversationId) {
      setGithubError("Please start a conversation first");
      return;
    }
    
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      setGithubError("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      return;
    }
    
    setIsImporting(true);
    setGithubError(null);
    
    try {
      const branch = parsed.branch || "main";
      const headers: Record<string, string> = {};
      if (githubToken.trim()) {
        headers["X-GitHub-Token"] = githubToken.trim();
      }
      
      // Recursively fetch all files from the repository
      const allFilePaths: string[] = [];
      const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'vendor', '.cache'];
      
      const fetchDir = async (path: string = ''): Promise<void> => {
        const url = `/api/github/repos/${parsed!.owner}/${parsed!.repo}/contents?path=${encodeURIComponent(path)}&ref=${branch}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          if (res.status === 404 && path === '') throw new Error("Repository not found. If private, add your GitHub token below.");
          if (res.status === 401 || res.status === 403) throw new Error("Access denied. Check your GitHub token.");
          return; // Skip directories that fail
        }
        
        const contents = await res.json();
        if (!Array.isArray(contents)) return;
        
        for (const item of contents) {
          if (allFilePaths.length >= 100) return; // Limit total files
          
          if (item.type === 'file') {
            // Skip large files and binary-looking files
            if (item.size && item.size > 500000) continue;
            const ext = item.name.split('.').pop()?.toLowerCase();
            const skipExts = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'mp3', 'mp4', 'zip', 'tar', 'gz'];
            if (ext && skipExts.includes(ext)) continue;
            
            allFilePaths.push(item.path);
          } else if (item.type === 'dir') {
            // Skip common non-code directories
            if (!skipDirs.includes(item.name)) {
              await fetchDir(item.path);
            }
          }
        }
      };
      
      await fetchDir();
      
      if (allFilePaths.length === 0) {
        setGithubError("No code files found in repository");
        setIsImporting(false);
        return;
      }
      
      // Import files
      const importRes = await fetch(`/api/conversations/${conversationId}/import-github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: parsed.owner,
          repo: parsed.repo,
          branch,
          files: allFilePaths
        })
      });
      
      if (!importRes.ok) throw new Error("Failed to import files");
      
      setGithubDialogOpen(false);
      setGithubUrl("");
      setGithubToken("");
      onFilesUploaded?.();
    } catch (error) {
      setGithubError(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  }, [conversationId, githubUrl, githubToken, onFilesUploaded]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles: { name: string; content: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 1024 * 1024) continue; // Skip files > 1MB
      
      try {
        const content = await file.text();
        newFiles.push({ name: file.name, content });
      } catch (err) {
        console.error(`Failed to read ${file.name}:`, err);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFolderSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles: { name: string; content: string }[] = [];
    let skippedCount = 0;
    const totalFiles = files.length;
    
    // Skip directories and binary file extensions
    const skipDirs = ['node_modules', '.git', '__pycache__', '.next', 'dist', 'build', '.cache', 'coverage', '.vscode', '.idea', 'vendor', '.nuxt', '.output', '.svelte-kit'];
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.mp3', '.mp4', '.wav', '.avi', '.mov', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.zip', '.tar', '.gz', '.rar', '.7z', '.pdf', '.exe', '.dll', '.so', '.dylib', '.pyc', '.class', '.o', '.obj', '.lock'];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 500 * 1024) { skippedCount++; continue; }
      
      const path = file.webkitRelativePath || file.name;
      const pathLower = path.toLowerCase();
      
      // Check if path contains any skip directory
      const shouldSkip = skipDirs.some(dir => 
        pathLower.includes(`/${dir}/`) || 
        pathLower.includes(`\\${dir}\\`) ||
        pathLower.startsWith(`${dir}/`) ||
        pathLower.startsWith(`${dir}\\`)
      );
      if (shouldSkip) { skippedCount++; continue; }
      
      // Skip binary files
      if (binaryExtensions.some(ext => pathLower.endsWith(ext))) { skippedCount++; continue; }
      
      // Skip hidden files except important config files
      const fileName = path.split('/').pop() || path;
      if (fileName.startsWith('.') && !fileName.match(/^\.(env|gitignore|eslintrc|prettierrc|babelrc|editorconfig)/)) { skippedCount++; continue; }
      
      // Limit total files (2000 max for large enterprise codebases)
      if (newFiles.length >= 2000) { skippedCount++; continue; }
      
      try {
        const content = await file.text();
        // Skip files that look binary (contain null bytes or too many non-printable chars)
        if (content.includes('\0') || /[\x00-\x08\x0E-\x1F]/.test(content.substring(0, 1000))) { skippedCount++; continue; }
        newFiles.push({ name: path, content });
      } catch (err) {
        console.error(`Failed to read ${path}:`, err);
        skippedCount++;
      }
    }
    
    setFilteredCount(skippedCount);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadDialogOpen(true);
    if (folderInputRef.current) folderInputRef.current.value = "";
  }, []);

  const handleUploadSubmit = useCallback(async () => {
    if (!conversationId || uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const res = await fetch(`/api/conversations/${conversationId}/upload-files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: uploadedFiles.map(f => ({ path: f.name, content: f.content }))
        })
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      setUploadDialogOpen(false);
      setUploadedFiles([]);
      onFilesUploaded?.();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [conversationId, uploadedFiles, onFilesUploaded]);

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <>
      {/* Hidden folder input - outside dialog for direct triggering */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderSelect}
        className="hidden"
        {...{ webkitdirectory: "", directory: "" } as any}
      />
      
      <div className="relative flex items-end gap-2 p-3 rounded-2xl bg-card border border-border">
        {/* Plus button for attachments */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="flex-shrink-0 rounded-xl"
              data-testid="button-attachments"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => setGithubDialogOpen(true)}
              className="gap-2"
              data-testid="menu-github-import"
            >
              <Github className="h-4 w-4" />
              Import from GitHub
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2"
              data-testid="menu-upload-files"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => folderInputRef.current?.click()}
              className="gap-2"
              data-testid="menu-upload-folder"
            >
              <FolderUp className="h-4 w-4" />
              Upload Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent text-base leading-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
          data-testid="input-chat-message"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 rounded-xl"
          data-testid="button-send-message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* GitHub Import Dialog */}
      <Dialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Import from GitHub
            </DialogTitle>
            <DialogDescription>
              Paste a GitHub repository URL to import files into your project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Repository URL</label>
              <Input
                placeholder="https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => { setGithubUrl(e.target.value); setGithubError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleGitHubImport()}
                data-testid="input-github-url-dialog"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-3.5 w-3.5" />
                Personal Access Token
                <Badge variant="secondary" className="text-[10px]">Optional</Badge>
              </label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="ghp_xxxx (for private repos)"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="pr-10"
                  data-testid="input-github-token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for private repos. <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Generate token</a>
              </p>
            </div>
            
            {githubError && (
              <p className="text-sm text-destructive">{githubError}</p>
            )}
            
            <Button onClick={handleGitHubImport} disabled={isImporting || !githubUrl.trim()} className="w-full">
              {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Github className="h-4 w-4 mr-2" />}
              {isImporting ? "Importing..." : "Import Repository"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </DialogTitle>
            <DialogDescription>
              Upload code files to include in your project.
              {filteredCount > 0 && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  {filteredCount.toLocaleString()} files skipped (node_modules, binaries, etc.)
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept=".js,.ts,.tsx,.jsx,.css,.html,.json,.md,.py,.txt"
            />
            
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4" />
              Select Files
            </Button>
            
            {uploadedFiles.length > 0 && (
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeUploadedFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {uploadedFiles.length > 0 && (
              <Button
                className="w-full"
                onClick={handleUploadSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload {uploadedFiles.length} File{uploadedFiles.length !== 1 ? 's' : ''}
              </Button>
            )}
            
            <p className="text-xs text-muted-foreground text-center">
              Max file size: 1MB
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
