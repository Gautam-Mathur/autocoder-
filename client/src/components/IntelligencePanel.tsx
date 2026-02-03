import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  TestTube, 
  FileText, 
  Brain, 
  Package, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  Activity
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogViewer } from "@/components/LogViewer";

interface IntelligencePanelProps {
  conversationId: number;
}

interface ProjectStats {
  projectName?: string;
  projectType?: string;
  complexity?: string;
  designStyle?: string;
  techStack?: string[];
  featuresBuilt?: string[];
  fileCount?: number;
  totalLines?: number;
  messageCount?: number;
  securityScore?: number;
  securityGrade?: string;
  testsPassed?: number;
  testsFailed?: number;
  hasPlan?: boolean;
  createdAt?: string;
}

interface SecurityScanResult {
  score: number;
  grade: string;
  issues: { severity: string; category: string; title: string; recommendation: string }[];
  passedChecks: string[];
  report: string;
  recommendations: string[];
}

interface TestResult {
  totalPassed: number;
  totalFailed: number;
  buildValid: boolean;
  buildErrors: string[];
  buildWarnings: string[];
  fileResults: any[];
}

interface DependencyResult {
  dependencies: { name: string; type: string; purpose: string }[];
  envVariables: { key: string; required: boolean; description: string }[];
  warnings: { severity: string; dependency: string; issue: string }[];
  report: string;
}

interface TransparencyResult {
  report: string;
  assumptions: { assumption: string; reasoning: string; category: string }[];
  logs: { action: string; targetFile: string; description: string }[];
  fileCount: number;
}

export function IntelligencePanel({ conversationId }: IntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState("stats");

  // Project stats
  const { data: stats, isLoading: statsLoading } = useQuery<ProjectStats>({
    queryKey: ["/api/conversations", conversationId, "stats"],
    enabled: !!conversationId,
  });

  // Security scan mutation
  const securityMutation = useMutation<SecurityScanResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/security-scan`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "stats"] });
    },
  });

  // Test mutation
  const testMutation = useMutation<TestResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/test`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "stats"] });
    },
  });

  // Transparency report
  const { data: transparency, refetch: refetchTransparency } = useQuery<TransparencyResult>({
    queryKey: ["/api/conversations", conversationId, "transparency"],
    enabled: activeTab === "transparency",
  });

  // Dependencies
  const { data: dependencies, refetch: refetchDeps } = useQuery<DependencyResult>({
    queryKey: ["/api/conversations", conversationId, "dependencies"],
    enabled: activeTab === "dependencies",
  });

  // Intel records
  const { data: intel, refetch: refetchIntel } = useQuery({
    queryKey: ["/api/conversations", conversationId, "intel"],
    enabled: activeTab === "intel",
  });

  const getSecurityGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${conversationId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading project:', error);
    }
  };

  if (!conversationId) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col" data-testid="intelligence-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Project Intelligence
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 px-2 relative z-10 shrink-0">
            <TabsTrigger value="stats" className="text-xs" data-testid="tab-stats">
              <Info className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs" data-testid="tab-security">
              <Shield className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="tests" className="text-xs" data-testid="tab-tests">
              <TestTube className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="text-xs" data-testid="tab-dependencies">
              <Package className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="transparency" className="text-xs" data-testid="tab-transparency">
              <FileText className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs" data-testid="tab-logs">
              <Activity className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-2 py-2">
            <TabsContent value="stats" className="mt-0 space-y-3">
              {statsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : stats ? (
                <>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="text-sm font-medium">{stats.projectName || "Untitled"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Files</p>
                      <p className="text-lg font-bold">{stats.fileCount || 0}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Lines</p>
                      <p className="text-lg font-bold">{stats.totalLines || 0}</p>
                    </div>
                  </div>

                  {stats.techStack && stats.techStack.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {stats.techStack.map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.featuresBuilt && stats.featuresBuilt.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Features Built</p>
                      <div className="flex flex-wrap gap-1">
                        {stats.featuresBuilt.map((feature: string) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleExport}
                    data-testid="button-export"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Project
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No stats available yet
                </p>
              )}
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => securityMutation.mutate()}
                disabled={securityMutation.isPending}
                data-testid="button-security-scan"
              >
                {securityMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Shield className="h-3 w-3 mr-1" />
                )}
                Run Security Scan
              </Button>

              {securityMutation.data && (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getSecurityGradeColor(securityMutation.data.grade)}`}>
                      {securityMutation.data.grade}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Score: {securityMutation.data.score}/100</p>
                      <p className="text-xs text-muted-foreground">
                        {securityMutation.data.issues?.length || 0} issues found
                      </p>
                    </div>
                  </div>

                  {securityMutation.data.issues?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Issues</p>
                      {securityMutation.data.issues.slice(0, 5).map((issue: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-muted/50 text-xs">
                          <div className="flex items-center gap-1">
                            {issue.severity === 'critical' || issue.severity === 'high' ? (
                              <XCircle className="h-3 w-3 text-red-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="font-medium">{issue.title}</span>
                          </div>
                          <p className="text-muted-foreground mt-1">{issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {securityMutation.data.passedChecks?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Passed Checks</p>
                      {securityMutation.data.passedChecks.map((check: string, i: number) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {check}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {stats?.securityScore && !securityMutation.data && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    Last scan score: {stats.securityScore}/100
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tests" className="mt-0 space-y-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                data-testid="button-run-tests"
              >
                {testMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <TestTube className="h-3 w-3 mr-1" />
                )}
                Run Tests
              </Button>

              {testMutation.data && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-green-50 dark:bg-green-950">
                      <p className="text-xs text-green-600 dark:text-green-400">Passed</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        {testMutation.data.totalPassed}
                      </p>
                    </div>
                    <div className="p-2 rounded bg-red-50 dark:bg-red-950">
                      <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">
                        {testMutation.data.totalFailed}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Build Status</span>
                      <span className={testMutation.data.buildValid ? "text-green-600" : "text-red-600"}>
                        {testMutation.data.buildValid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                    <Progress 
                      value={testMutation.data.totalPassed / (testMutation.data.totalPassed + testMutation.data.totalFailed) * 100 || 0} 
                    />
                  </div>

                  {testMutation.data.buildErrors?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-red-600">Build Errors</p>
                      {testMutation.data.buildErrors.map((error: string, i: number) => (
                        <p key={i} className="text-xs text-red-500">{error}</p>
                      ))}
                    </div>
                  )}
                </>
              )}

              {((stats?.testsPassed ?? 0) > 0 || (stats?.testsFailed ?? 0) > 0) && !testMutation.data && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    Last results: {stats?.testsPassed ?? 0} passed, {stats?.testsFailed ?? 0} failed
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="dependencies" className="mt-0 space-y-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => refetchDeps()}
                data-testid="button-analyze-deps"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Analyze Dependencies
              </Button>

              {dependencies && (
                <>
                  {dependencies.dependencies?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Dependencies ({dependencies.dependencies.length})</p>
                      {dependencies.dependencies.slice(0, 10).map((dep: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1 rounded bg-muted/50">
                          <span>{dep.name}</span>
                          <Badge variant="outline" className="text-xs">{dep.type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {dependencies.envVariables?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Environment Variables</p>
                      {dependencies.envVariables.map((env: any, i: number) => (
                        <div key={i} className="text-xs p-1 rounded bg-muted/50">
                          <code>{env.key}</code>
                          {env.required && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
                        </div>
                      ))}
                    </div>
                  )}

                  {dependencies.warnings?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-yellow-600">Warnings</p>
                      {dependencies.warnings.map((warning: any, i: number) => (
                        <div key={i} className="text-xs text-yellow-600 flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          {warning.issue}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="transparency" className="mt-0 space-y-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => refetchTransparency()}
                data-testid="button-transparency"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Generate Report
              </Button>

              {transparency && (
                <>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Files Generated: {transparency.fileCount}</p>
                  </div>

                  {transparency.assumptions?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Assumptions Made</p>
                      {transparency.assumptions.map((assumption: any, i: number) => (
                        <div key={i} className="text-xs p-2 rounded bg-muted/50">
                          <p className="font-medium">{assumption.assumption}</p>
                          <p className="text-muted-foreground mt-1">{assumption.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {transparency.logs?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Generation History</p>
                      {transparency.logs.slice(0, 5).map((log: any, i: number) => (
                        <div key={i} className="text-xs p-1 rounded bg-muted/50 flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          <span className="truncate">{log.targetFile}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="logs" className="mt-0 h-[400px]">
              <LogViewer />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default IntelligencePanel;
