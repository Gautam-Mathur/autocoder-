import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Search,
  Trash2,
  Download,
  Filter,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Bug,
  Clock,
  Activity,
  Zap,
  Database,
  Shield,
  MessageSquare,
  Server,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type LogLevel = "debug" | "info" | "success" | "warn" | "error";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  conversationId?: number;
  duration?: number;
}

interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<string, number>;
  recentErrors: LogEntry[];
}

const levelConfig: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  debug: { icon: Bug, color: "text-slate-500", bg: "bg-slate-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  warn: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

const categoryIcons: Record<string, typeof Server> = {
  API: Server,
  AI: Zap,
  DB: Database,
  Security: Shield,
  Chat: MessageSquare,
  Perf: Activity,
};

function LogEntryRow({ log, isExpanded, onToggle }: { log: LogEntry; isExpanded: boolean; onToggle: () => void }) {
  const config = levelConfig[log.level];
  const Icon = config.icon;
  const CategoryIcon = categoryIcons[log.category] || Server;
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`group border-b border-border/50 transition-colors hover:bg-muted/30 ${
        log.level === "error" ? "bg-red-500/5" : log.level === "warn" ? "bg-amber-500/5" : ""
      }`}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={hasDetails ? onToggle : undefined}
        data-testid={`log-entry-${log.id}`}
      >
        <span className="text-xs text-muted-foreground font-mono w-16 shrink-0">
          {formatTime(log.timestamp)}
        </span>
        
        <div className={`p-1 rounded ${config.bg}`}>
          <Icon className={`w-3 h-3 ${config.color}`} />
        </div>

        <Badge
          variant="outline"
          className={`text-xs font-mono uppercase shrink-0 ${config.color} border-current/30`}
        >
          {log.level}
        </Badge>

        <div className="flex items-center gap-1 shrink-0">
          <CategoryIcon className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{log.category}</span>
        </div>

        <span className="text-sm truncate flex-1">{log.message}</span>

        {log.duration && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="w-3 h-3" />
            <span>{log.duration}ms</span>
          </div>
        )}

        {hasDetails && (
          <div className="shrink-0 text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {isExpanded && hasDetails && (
        <div className="px-3 pb-3 pl-28">
          <pre className="text-xs bg-muted/50 rounded-md p-2 overflow-x-auto font-mono text-muted-foreground">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function LogViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: logs = [], refetch, isLoading } = useQuery<LogEntry[]>({
    queryKey: ["/api/logs", levelFilter, categoryFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("limit", "200");
      const res = await fetch(`/api/logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
    refetchInterval: autoRefresh ? 2000 : false,
  });

  const { data: stats, refetch: refetchStats } = useQuery<LogStats>({
    queryKey: ["/api/logs/stats"],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const categories = useMemo(() => {
    if (!stats?.byCategory) return [];
    return Object.keys(stats.byCategory);
  }, [stats]);

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (levelFilter !== "all") {
      result = result.filter((log) => log.level === levelFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((log) => log.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [logs, levelFilter, categoryFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/logs", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear logs");
      refetch();
      refetchStats();
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="logs" className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="logs" data-testid="tab-logs">
              <Activity className="w-3 h-3 mr-1" />
              Live Logs
            </TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">
              <Activity className="w-3 h-3 mr-1" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              data-testid="button-auto-refresh"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
          </div>
        </div>

        <TabsContent value="logs" className="flex-1 flex flex-col m-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
                data-testid="input-search-logs"
              />
            </div>

            <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel | "all")}>
              <SelectTrigger className="w-28 h-8" data-testid="select-level-filter">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-28 h-8" data-testid="select-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button size="sm" variant="ghost" onClick={handleExportLogs} data-testid="button-export-logs">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>

            <Button size="sm" variant="ghost" onClick={handleClearLogs} data-testid="button-clear-logs">
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Loading logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No logs found</p>
                <p className="text-xs">Logs will appear here as the application runs</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredLogs.map((log) => (
                  <LogEntryRow
                    key={log.id}
                    log={log}
                    isExpanded={expandedLogs.has(log.id)}
                    onToggle={() => toggleExpand(log.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Showing {filteredLogs.length} of {logs.length} logs
            </span>
            <span>
              {stats && (
                <>
                  {stats.byLevel.error > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {stats.byLevel.error} errors
                    </Badge>
                  )}
                  {stats.byLevel.warn > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs text-amber-500">
                      {stats.byLevel.warn} warnings
                    </Badge>
                  )}
                </>
              )}
            </span>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="flex-1 m-0 p-4 overflow-auto">
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Logs</div>
              </Card>

              {(Object.entries(stats.byLevel) as [LogLevel, number][]).map(([level, count]) => {
                const config = levelConfig[level];
                const Icon = config.icon;
                return (
                  <Card key={level} className={`p-4 ${config.bg}`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground capitalize">{level}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <Card className="p-4 col-span-full">
                <h3 className="font-medium mb-3">By Category</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.byCategory).map(([category, count]) => {
                    const CategoryIcon = categoryIcons[category] || Server;
                    return (
                      <Badge key={category} variant="secondary" className="text-sm">
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {category}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </Card>

              {stats.recentErrors.length > 0 && (
                <Card className="p-4 col-span-full border-red-500/30 bg-red-500/5">
                  <h3 className="font-medium mb-3 flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    Recent Errors
                  </h3>
                  <div className="space-y-2">
                    {stats.recentErrors.map((error) => (
                      <div key={error.id} className="text-sm p-2 bg-background rounded">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>{new Date(error.timestamp).toLocaleTimeString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {error.category}
                          </Badge>
                        </div>
                        <div className="text-red-500">{error.message}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading statistics...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
