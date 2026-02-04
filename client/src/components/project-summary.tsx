import { File, Folder, Terminal, Download, Sparkles } from "lucide-react";
import { SiReact, SiTypescript, SiTailwindcss, SiExpress, SiPostgresql } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectFile {
  path: string;
  type?: string;
}

interface ProjectSummaryProps {
  projectName: string;
  blueprintType: string;
  totalFiles: number;
  files: ProjectFile[];
  features?: string[];
  onDownload?: () => void;
}

export function ProjectSummary({ 
  projectName, 
  blueprintType, 
  totalFiles, 
  files, 
  features = [],
  onDownload 
}: ProjectSummaryProps) {
  const componentFiles = files.filter(f => 
    f.path.includes('/components/') || 
    f.path.includes('/pages/') || 
    f.path.includes('/layout/')
  );
  const serverFiles = files.filter(f => 
    f.path.startsWith('server/') || 
    f.path.includes('/api/')
  );
  const configFiles = files.filter(f => 
    f.type === 'config' || 
    f.path.endsWith('.json') || 
    f.path.endsWith('.config.ts')
  );

  const displayFiles = componentFiles.slice(0, 8);
  const remainingCount = componentFiles.length - displayFiles.length;

  const getTechIcon = () => {
    if (blueprintType.toLowerCase().includes('react')) {
      return <SiReact className="w-12 h-12 text-cyan-400" />;
    }
    return <Sparkles className="w-12 h-12 text-primary" />;
  };

  const getTechLabel = () => {
    if (blueprintType.toLowerCase().includes('react')) {
      return 'React + TypeScript';
    }
    if (blueprintType.toLowerCase().includes('express')) {
      return 'Full-Stack';
    }
    return blueprintType;
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-slate-900 to-slate-950 text-white my-4" data-testid="project-summary">
      <div className="p-8 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
          {getTechIcon()}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white">
            {getTechLabel()} Project Generated!
          </h2>
          <p className="text-slate-400 mt-2">
            Created <span className="text-emerald-400 font-bold">{totalFiles} files</span> for a complete full-stack application.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 mx-6 rounded-xl mb-4">
        <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
          <Folder className="w-4 h-4" />
          Generated Components ({componentFiles.length} files):
        </h3>
        <div className="space-y-2">
          {displayFiles.map((file, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
              data-testid={`file-item-${idx}`}
            >
              <File className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-xs">{file.path}</span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-slate-500 text-sm mt-2">
              ...and {remainingCount} more components
            </div>
          )}
        </div>
      </div>

      <div className="bg-cyan-900/30 p-6 mx-6 rounded-xl mb-6 border border-cyan-700/30">
        <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          To run this project:
        </h3>
        <ol className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">1.</span>
            <span>Export/download the files</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">2.</span>
            <span>Run <code className="bg-slate-700 px-2 py-0.5 rounded text-xs font-mono">npm install</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">3.</span>
            <span>Run <code className="bg-slate-700 px-2 py-0.5 rounded text-xs font-mono">npm run dev</code></span>
          </li>
        </ol>
      </div>

      <div className="px-6 pb-6 flex flex-wrap gap-2">
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
          <SiReact className="w-3 h-3 mr-1" /> React
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <SiTypescript className="w-3 h-3 mr-1" /> TypeScript
        </Badge>
        <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
          <SiTailwindcss className="w-3 h-3 mr-1" /> Tailwind
        </Badge>
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <SiExpress className="w-3 h-3 mr-1" /> Express
        </Badge>
        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
          <SiPostgresql className="w-3 h-3 mr-1" /> PostgreSQL
        </Badge>
      </div>

      {onDownload && (
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <Button 
            onClick={onDownload}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            data-testid="button-download-project"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Project ({totalFiles} files)
          </Button>
        </div>
      )}
    </div>
  );
}

export function parseProjectSummary(content: string): { 
  hasProject: boolean; 
  projectInfo?: { 
    name: string; 
    type: string; 
    totalFiles: number; 
    files: { path: string }[];
  };
  remainingContent: string;
} {
  const projectMatch = content.match(/🎉.*?I've built your ([\w\s]+) app!/);
  const filesMatch = content.match(/Your Project Files \((\d+) files\)/);
  const blueprintMatch = content.match(/\*\*([\w\s\+\-]+)\*\*,? so I/i);
  
  if (projectMatch && filesMatch) {
    const fileListMatch = content.match(/📁\s+\w+\/[^\n]*/g) || [];
    const files = fileListMatch.map(f => ({ path: f.replace(/📁\s*/, '').trim() }));
    
    return {
      hasProject: true,
      projectInfo: {
        name: projectMatch[1].trim(),
        type: blueprintMatch ? blueprintMatch[1].trim() : 'Full-Stack React + Express',
        totalFiles: parseInt(filesMatch[1], 10),
        files
      },
      remainingContent: content.replace(/🎉[\s\S]*?I'm here to help! 😊/, '').trim()
    };
  }
  
  return { hasProject: false, remainingContent: content };
}
