import type { ProjectPlan, PlannedPage, PlannedEntity, PlannedEndpoint } from './plan-generator.js';
import type { ReasoningResult, UIPattern, FieldSemantics } from './contextual-reasoning-engine.js';
import {
  resolveEntityFields,
  generateFormFieldJSX,
  generateDisplayFieldJSX,
  generateTableCellJSX,
  generateStateDeclarations,
  generateResetStatements,
  generateFormBody,
  getImportsNeededForFields,
  type EntityFieldMap,
  type ResolvedField,
} from './codegen-field-resolver.js';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface PageImports {
  react: string[];
  tanstackQuery: string[];
  components: string[];
  lucideIcons: string[];
  hooks: string[];
  lib: string[];
  custom: string[];
}

function toKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '').replace(/[\s_]+/g, '-');
}

function toTitle(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function toCamel(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function dedupe(arr: string[]): string[] {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
}

function buildImportBlock(imports: PageImports): string {
  const lines: string[] = [];
  const reactItems = dedupe(imports.react);
  if (reactItems.length > 0) {
    lines.push(`import { ${reactItems.join(', ')} } from "react";`);
  }
  const tqItems = dedupe(imports.tanstackQuery);
  if (tqItems.length > 0) {
    lines.push(`import { ${tqItems.join(', ')} } from "@tanstack/react-query";`);
  }
  if (imports.lib.length > 0) {
    const qcImports = dedupe(imports.lib.filter(l => ['queryClient', 'apiRequest'].includes(l)));
    const utilImports = dedupe(imports.lib.filter(l => !['queryClient', 'apiRequest'].includes(l)));
    if (qcImports.length > 0) {
      lines.push(`import { ${qcImports.join(', ')} } from "@/lib/queryClient";`);
    }
    if (utilImports.length > 0) {
      lines.push(`import { ${utilImports.join(', ')} } from "@/lib/utils";`);
    }
  }
  for (const comp of dedupe(imports.components)) {
    lines.push(comp);
  }
  const icons = dedupe(imports.lucideIcons);
  if (icons.length > 0) {
    lines.push(`import { ${icons.join(', ')} } from "lucide-react";`);
  }
  for (const hook of dedupe(imports.hooks)) {
    lines.push(hook);
  }
  for (const custom of dedupe(imports.custom)) {
    lines.push(custom);
  }
  return lines.join('\n');
}

function makeImports(): PageImports {
  return { react: [], tanstackQuery: [], components: [], lucideIcons: [], hooks: [], lib: [], custom: [] };
}

export function generateListPage(
  page: PlannedPage,
  plan: ProjectPlan,
  reasoning: ReasoningResult | null,
  uiPattern: UIPattern | undefined
): string {
  const entityName = page.dataNeeded[0] || plan.dataModel[0]?.name || 'Item';
  const entity = plan.dataModel.find(e => e.name === entityName);
  if (!entity) return generateFallbackPage(page);

  const fieldMap = resolveEntityFields(entity, reasoning);
  const endpoint = `/api/${toKebab(entityName)}s`;
  const detailPath = `/${toKebab(entityName)}s`;
  const imports = makeImports();

  imports.react.push('useState');
  imports.tanstackQuery.push('useQuery', 'useMutation');
  imports.lib.push('queryClient', 'apiRequest');
  imports.components.push('import { Button } from "@/components/ui/button";');
  imports.components.push('import { Input } from "@/components/ui/input";');
  imports.components.push('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";');
  imports.components.push('import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";');
  imports.components.push('import { Label } from "@/components/ui/label";');
  imports.hooks.push('import { useToast } from "@/hooks/use-toast";');
  imports.lucideIcons.push('Plus', 'Search', 'Trash2');
  imports.lib.push('safeGet');

  const fieldImports = getImportsNeededForFields(fieldMap.editableFields.concat(fieldMap.displayFields));
  if (fieldImports.needsTextarea) imports.components.push('import { Textarea } from "@/components/ui/textarea";');
  if (fieldImports.needsSelect) imports.components.push('import { Select, SelectOption } from "@/components/ui/select";');
  if (fieldImports.needsStatusBadge) imports.custom.push('import StatusBadge from "@/components/status-badge";');
  if (fieldImports.needsFormatUtils) {
    imports.lib.push('formatCurrency', 'formatPercent', 'formatDate', 'formatDateTime');
  }

  const isKanban = uiPattern?.pattern === 'kanban';
  const isCalendar = uiPattern?.pattern === 'calendar';
  const isCardGrid = uiPattern?.pattern === 'card-grid';
  const hasPatternView = isKanban || isCalendar || isCardGrid;

  if (hasPatternView) imports.lucideIcons.push('List');
  if (isKanban) {
    imports.custom.push('import { Badge } from "@/components/ui/badge";');
    imports.custom.push('import { useLocation } from "wouter";');
    imports.lucideIcons.push('Columns3');
  }
  if (isCalendar) {
    imports.react.push('useMemo');
    imports.custom.push('import { useLocation } from "wouter";');
    imports.lucideIcons.push('ChevronLeft', 'ChevronRight', 'CalendarDays');
  }
  if (isCardGrid) {
    imports.custom.push('import { useLocation } from "wouter";');
    imports.lucideIcons.push('LayoutGrid');
  }

  const tableHeaders = fieldMap.displayFields.map(f =>
    `                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">${toTitle(f.name)}</th>`
  ).join('\n');

  const tableRows = fieldMap.displayFields.map(f => generateTableCellJSX(f, 'item')).join('\n');
  const formStates = generateStateDeclarations(fieldMap.editableFields, 'form');
  const resetFormFields = generateResetStatements(fieldMap.editableFields, 'form');
  const formBody = generateFormBody(fieldMap.editableFields, 'form');
  const dialogFields = fieldMap.editableFields.map(f => generateFormFieldJSX(f, 'form')).join('\n');

  const statusFilterBlock = fieldMap.statusField ? generateStatusFilter(fieldMap.statusField) : '';
  const filterLogicBlock = generateFilterLogic(fieldMap);

  let patternState = '';
  let patternViewJSX = '';
  let viewToggleJSX = '';

  if (hasPatternView) {
    patternState = `  const [viewMode, setViewMode] = useState<'pattern' | 'table'>('pattern');\n`;
    if (isKanban || isCalendar || isCardGrid) {
      patternState += `  const [, navigate] = useLocation();\n`;
    }
    if (isCalendar) {
      const dateField = (uiPattern?.config?.dateField as string) || 'date';
      const titleField = (uiPattern?.config?.titleField as string) || fieldMap.nameField?.name || 'name';
      patternState += generateCalendarState(dateField);
      patternViewJSX = generateCalendarView(dateField, titleField, detailPath);
    } else if (isKanban) {
      const columns = (uiPattern?.config?.columns as string[]) || ['To Do', 'In Progress', 'Done'];
      const cardTitle = (uiPattern?.config?.cardTitle as string) || fieldMap.nameField?.name || 'name';
      const cardSubtitle = (uiPattern?.config?.cardSubtitle as string) || '';
      patternViewJSX = generateKanbanView(columns, cardTitle, cardSubtitle, detailPath);
    } else if (isCardGrid) {
      const imageField = (uiPattern?.config?.imageField as string) || '';
      const titleField = (uiPattern?.config?.titleField as string) || fieldMap.nameField?.name || 'name';
      const subtitleField = (uiPattern?.config?.subtitleField as string) || '';
      patternViewJSX = generateCardGridView(imageField, titleField, subtitleField, !!fieldMap.statusField, detailPath, entityName);
    }

    const patternIconMap: Record<string, [string, string]> = {
      kanban: ['<Columns3 className="h-4 w-4 mr-1" />', 'Board'],
      calendar: ['<CalendarDays className="h-4 w-4 mr-1" />', 'Calendar'],
      'card-grid': ['<LayoutGrid className="h-4 w-4 mr-1" />', 'Grid'],
    };
    const [pIcon, pLabel] = patternIconMap[uiPattern!.pattern] || ['', 'View'];
    viewToggleJSX = `
        <div className="flex gap-1">
          <Button variant={viewMode === 'pattern' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('pattern')} data-testid="button-view-pattern">
            ${pIcon} ${pLabel}
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')} data-testid="button-view-table">
            <List className="h-4 w-4 mr-1" /> Table
          </Button>
        </div>`;
  }

  const tableViewJSX = `      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="text-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="text-empty">
              {search ? "No results found." : "No ${entityName.toLowerCase()}s yet. Click 'Add ${entityName}' to create one."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
${tableHeaders}
                    <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate && navigate(\`${detailPath}/\${item.id}\`)} data-testid={\`row-${toKebab(entityName)}-\${item.id}\`}>
${tableRows}
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                          data-testid={\`button-delete-\${item.id}\`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>`;

  if (!hasPatternView && !imports.custom.some(c => c.includes('useLocation'))) {
    imports.custom.push('import { useLocation } from "wouter";');
  }

  imports.custom.push('import ConfirmDialog from "@/components/confirm-dialog";');

  let viewContentJSX: string;
  if (hasPatternView) {
    viewContentJSX = `      {viewMode === 'pattern' ? (
        <>
${patternViewJSX}
        </>
      ) : (
        <>
${tableViewJSX}
        </>
      )}`;
  } else {
    viewContentJSX = tableViewJSX;
  }

  return `${buildImportBlock(imports)}

export default function ${page.componentName}() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
${fieldMap.statusField ? `  const [statusFilter, setStatusFilter] = useState("all");\n` : ''}  const { toast } = useToast();
  const [, navigate] = useLocation();
${patternState}${formStates}

  const { data: items = [], isLoading } = useQuery<any[]>({ queryKey: ["${endpoint}"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "${endpoint}", data);
      return res.json();
    },
    onMutate: async (newData: any) => {
      await queryClient.cancelQueries({ queryKey: ["${endpoint}"] });
      const previous = queryClient.getQueryData<any[]>(["${endpoint}"]);
      queryClient.setQueryData<any[]>(["${endpoint}"], (old = []) => [
        ...old,
        { id: Date.now(), ...newData },
      ]);
      return { previous };
    },
    onError: (_err: Error, _vars: any, context: any) => {
      if (context?.previous) queryClient.setQueryData(["${endpoint}"], context.previous);
      toast({ title: "Error", description: _err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["${endpoint}"] });
      setShowCreate(false);
${resetFormFields}
      toast({ title: "${entityName} created", description: "The ${entityName.toLowerCase()} has been created successfully." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", \`${endpoint}/\${id}\`);
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["${endpoint}"] });
      const previous = queryClient.getQueryData<any[]>(["${endpoint}"]);
      queryClient.setQueryData<any[]>(["${endpoint}"], (old = []) =>
        old.filter((item: any) => item.id !== id)
      );
      return { previous };
    },
    onError: (_err: Error, _id: number, context: any) => {
      if (context?.previous) queryClient.setQueryData(["${endpoint}"], context.previous);
      toast({ title: "Error", description: _err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["${endpoint}"] });
      setDeleteId(null);
      toast({ title: "${entityName} deleted" });
    },
  });

${filterLogicBlock}

  const handleCreate = () => {
    createMutation.mutate({
${formBody}
    });
  };

  return (
    <div className="p-6 space-y-4" data-testid="page-${toKebab(entityName)}-list">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
          <p className="text-sm text-muted-foreground">${page.description}</p>
        </div>
        <div className="flex items-center gap-2">${viewToggleJSX}
          <Button onClick={() => setShowCreate(true)} data-testid="button-add-${toKebab(entityName)}">
            <Plus className="h-4 w-4 mr-2" />
            Add ${entityName}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ${entityName.toLowerCase()}s..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>${statusFilterBlock}
      </div>

${viewContentJSX}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create ${entityName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
${dialogFields}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} data-testid="button-cancel-create">Cancel</Button>
            <Button onClick={handleCreate} loading={createMutation.isPending} data-testid="button-submit-create">
              {createMutation.isPending ? "Creating..." : "Create ${entityName}"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete ${entityName}?"
        description="This action cannot be undone. This will permanently delete this ${entityName.toLowerCase()}."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
      />
    </div>
  );
}
`;
}

export function generateDetailPage(
  page: PlannedPage,
  plan: ProjectPlan,
  reasoning: ReasoningResult | null
): string {
  const entityName = page.dataNeeded[0] || plan.dataModel[0]?.name || 'Item';
  const entity = plan.dataModel.find(e => e.name === entityName);
  if (!entity) return generateFallbackPage(page);

  const fieldMap = resolveEntityFields(entity, reasoning);
  const endpoint = `/api/${toKebab(entityName)}s`;
  const listPath = page.path.split('/:')[0];

  const imports = makeImports();
  imports.react.push('useState');
  imports.tanstackQuery.push('useQuery', 'useMutation');
  imports.lib.push('queryClient', 'apiRequest', 'safeGet');
  imports.components.push('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";');
  imports.components.push('import { Button } from "@/components/ui/button";');
  imports.lucideIcons.push('ArrowLeft', 'Trash2', 'Edit');
  imports.hooks.push('import { useToast } from "@/hooks/use-toast";');
  imports.custom.push('import { useRoute, Link, useLocation } from "wouter";');
  imports.custom.push('import ConfirmDialog from "@/components/confirm-dialog";');

  const fieldImports = getImportsNeededForFields(fieldMap.displayFields);
  if (fieldImports.needsStatusBadge) imports.custom.push('import StatusBadge from "@/components/status-badge";');
  if (fieldImports.needsFormatUtils) imports.lib.push('formatCurrency', 'formatPercent', 'formatDate', 'formatDateTime');

  const childRelationships = reasoning?.relationships?.filter(r =>
    r.to === entityName && (r.cardinality === '1:N' || r.cardinality === 'N:1')
  ) || [];

  const relatedSections = childRelationships.map(rel => {
    const childEntity = plan.dataModel.find(e => e.name === rel.from);
    if (!childEntity) return null;
    return generateRelatedSection(rel, childEntity, entityName, reasoning, imports);
  }).filter(Boolean);

  const parentRelationships = reasoning?.relationships?.filter(r =>
    r.from === entityName && (r.cardinality === 'N:1' || r.cardinality === '1:1')
  ) || [];

  const parentLinks = parentRelationships.map(rel => {
    const parentPage = plan.pages.find(p => p.dataNeeded?.includes(rel.to));
    const parentPath = parentPage?.path?.split('/:')[0] || `/${toKebab(rel.to)}s`;
    const foreignKey = rel.fromField || `${toCamel(rel.to)}Id`;
    return `            {item?.${foreignKey} && <Link href={\`${parentPath}/\${item.${foreignKey}}\`}><Button variant="ghost" size="sm"><ArrowLeft className="h-3 w-3 mr-1" /> View ${toTitle(rel.to)}</Button></Link>}`;
  }).filter(Boolean);

  const fieldRows = fieldMap.displayFields.map(f => {
    const display = generateDisplayFieldJSX(f, 'item');
    return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitle(f.name)}</dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebab(f.name)}">${display}</dd>
              </div>`;
  }).join('\n');

  const computedFields = reasoning?.computedFields?.filter(cf => cf.entityName === entityName && cf.displayInDetail) || [];
  const computedFieldRows = computedFields.map(cf => {
    return `              <div>
                <dt className="text-sm text-muted-foreground">${toTitle(cf.fieldName)} <span className="text-xs text-primary">(computed)</span></dt>
                <dd className="text-sm font-medium mt-1" data-testid="text-${toKebab(cf.fieldName)}">{${cf.expression.replace(/\bthis\./g, 'item?.')}}</dd>
              </div>`;
  }).join('\n');

  if (relatedSections.length > 0) imports.lucideIcons.push('Plus');

  const additionalQueries = relatedSections.map((s: any) => s.queryDecl).join('\n');
  const relatedContent = relatedSections.map((s: any) => s.section).join('\n');

  return `${buildImportBlock(imports)}

export default function ${page.componentName}() {
  const [, params] = useRoute("${page.path}");
  const id = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: item, isLoading } = useQuery<any>({
    queryKey: ["${endpoint}", id],
    enabled: !!id,
  });
${additionalQueries ? '\n' + additionalQueries : ''}

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", \`${endpoint}/\${id}\`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["${endpoint}"] });
      const previous = queryClient.getQueryData<any[]>(["${endpoint}"]);
      queryClient.setQueryData<any[]>(["${endpoint}"], (old = []) =>
        old.filter((item: any) => item.id !== Number(id))
      );
      return { previous };
    },
    onError: (_err: Error, _vars: any, context: any) => {
      if (context?.previous) queryClient.setQueryData(["${endpoint}"], context.previous);
      toast({ title: "Error", description: _err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["${endpoint}"] });
      toast({ title: "${entityName} deleted" });
      navigate("${listPath}");
    },
  });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground" data-testid="text-loading">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="p-6 space-y-4" data-testid="text-not-found">
        <Link href="${listPath}">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to list
          </Button>
        </Link>
        <p className="text-muted-foreground">${entityName} not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-${toKebab(entityName)}-detail">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="${listPath}">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1" data-testid="text-page-title">
          {item?.${fieldMap.nameField?.name || 'id'} || "${entityName} Details"}
        </h1>
        <div className="flex items-center gap-2">
${parentLinks.length > 0 ? parentLinks.join('\n') + '\n' : ''}          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            data-testid="button-delete-${toKebab(entityName)}"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
${fieldRows}
${computedFieldRows ? computedFieldRows + '\n' : ''}          </dl>
        </CardContent>
      </Card>
${relatedContent}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete ${entityName}?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
`;
}

export function generateDashboardPage(
  page: PlannedPage,
  plan: ProjectPlan,
  reasoning: ReasoningResult | null
): string {
  const imports = makeImports();
  imports.tanstackQuery.push('useQuery');
  imports.components.push('import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";');
  imports.custom.push('import KpiCard from "@/components/kpi-card";');
  imports.custom.push('import { KpiSkeleton } from "@/components/loading-skeleton";');
  imports.lib.push('formatNumber', 'formatCurrency');

  const kpiEntities = plan.dataModel.slice(0, 4);
  const kpiIcons = ['Package', 'Users', 'Activity', 'TrendingUp'];
  imports.lucideIcons.push(...kpiIcons.slice(0, kpiEntities.length));

  const entityQueries = kpiEntities.map((e, i) => {
    const endpoint = `/api/${toKebab(e.name)}s`;
    const varName = `${toCamel(e.name)}s`;
    return `  const { data: ${varName} = [], isLoading: loading${e.name} } = useQuery<any[]>({ queryKey: ["${endpoint}"] });`;
  }).join('\n');

  const isLoadingCheck = kpiEntities.map(e => `loading${e.name}`).join(' || ');

  const kpiCards = kpiEntities.map((e, i) => {
    const varName = `${toCamel(e.name)}s`;
    const hasStatus = e.fields.some(f => f.name === 'status');
    const hasCurrency = e.fields.some(f => {
      const sem = reasoning?.fieldSemantics?.get(e.name)?.find(s => s.fieldName === f.name);
      return sem?.inputType === 'currency';
    });
    const currencyField = hasCurrency ? e.fields.find(f => {
      const sem = reasoning?.fieldSemantics?.get(e.name)?.find(s => s.fieldName === f.name);
      return sem?.inputType === 'currency';
    }) : null;

    let valueExpr: string;
    if (currencyField) {
      valueExpr = `formatCurrency(${varName}.reduce((sum: number, item: any) => sum + (Number(item.${currencyField.name}) || 0), 0))`;
    } else {
      valueExpr = `formatNumber(${varName}.length)`;
    }

    return `          <KpiCard
            title="${hasCurrency ? `Total ${toTitle(e.name)} Revenue` : `Total ${toTitle(e.name)}s`}"
            value={${valueExpr}}
            icon={<${kpiIcons[i]} className="h-5 w-5" />}
            data-testid="kpi-${toKebab(e.name)}"
          />`;
  }).join('\n');

  const recentEntityName = plan.dataModel[0]?.name || 'Item';
  const recentEntity = plan.dataModel[0];
  const recentVarName = `${toCamel(recentEntityName)}s`;
  const recentNameField = recentEntity?.fields.find(f =>
    ['name', 'title', 'firstName', 'companyName', 'subject', 'headline'].includes(f.name)
  )?.name || 'id';

  return `${buildImportBlock(imports)}

export default function ${page.componentName}() {
${entityQueries}

  const isLoading = ${isLoadingCheck || 'false'};

  return (
    <div className="p-6 space-y-6" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
        <p className="text-sm text-muted-foreground">${page.description}</p>
      </div>

      {isLoading ? (
        <KpiSkeleton count={${kpiEntities.length}} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(kpiEntities.length, 4)} gap-4">
${kpiCards}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent ${toTitle(recentEntityName)}s</CardTitle>
        </CardHeader>
        <CardContent>
          {${recentVarName}.length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="text-no-recent">No ${recentEntityName.toLowerCase()}s yet.</p>
          ) : (
            <div className="space-y-2">
              {${recentVarName}.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={\`recent-${toKebab(recentEntityName)}-\${item.id}\`}>
                  <div>
                    <p className="text-sm font-medium">{safeGet(item, "${recentNameField}")}</p>
                    ${recentEntity?.fields.some(f => f.name === 'status') ? `<p className="text-xs text-muted-foreground">{safeGet(item, "status")}</p>` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`;
}

export function generateGenericPage(page: PlannedPage): string {
  return `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ${page.componentName}() {
  return (
    <div className="p-6 space-y-6" data-testid="page-${toKebab(page.componentName)}">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">${page.name}</h1>
        <p className="text-sm text-muted-foreground">${page.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>${page.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-content">
            Content for ${page.name} will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
`;
}

function generateFallbackPage(page: PlannedPage): string {
  return generateGenericPage(page);
}

function generateStatusFilter(statusField: ResolvedField): string {
  if (statusField.enumValues) {
    const options = statusField.enumValues.map(v =>
      `          <SelectOption value="${v}">${toTitle(v)}</SelectOption>`
    ).join('\n');
    return `
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" data-testid="select-status-filter">
          <SelectOption value="all">All Statuses</SelectOption>
${options}
        </Select>`;
  }
  return `
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" data-testid="select-status-filter">
          <SelectOption value="all">All Statuses</SelectOption>
          <SelectOption value="active">Active</SelectOption>
          <SelectOption value="pending">Pending</SelectOption>
          <SelectOption value="completed">Completed</SelectOption>
          <SelectOption value="cancelled">Cancelled</SelectOption>
        </Select>`;
}

function generateFilterLogic(fieldMap: EntityFieldMap): string {
  if (fieldMap.statusField) {
    return `  const filtered = items.filter((item: any) => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.${fieldMap.statusField!.name} === statusFilter;
    return matchesSearch && matchesStatus;
  });`;
  }
  return `  const filtered = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );`;
}

function generateCalendarState(dateField: string): string {
  return `  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const itemsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const item of filtered) {
      const d = new Date(item.${dateField});
      if (isNaN(d.getTime())) continue;
      const key = \`\${d.getFullYear()}-\${d.getMonth()}-\${d.getDate()}\`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }
    return grouped;
  }, [filtered]);\n`;
}

function generateCalendarView(dateField: string, titleField: string, detailPath: string): string {
  return `        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                else { setCurrentMonth(currentMonth - 1); }
              }}><ChevronLeft className="h-4 w-4" /></Button>
              <h3 className="font-semibold">{monthNames[currentMonth]} {currentYear}</h3>
              <Button variant="outline" size="sm" onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                else { setCurrentMonth(currentMonth + 1); }
              }}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-md overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={\`empty-\${i}\`} className="bg-background p-2 min-h-[80px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = \`\${currentYear}-\${currentMonth}-\${day}\`;
                const dayItems = itemsByDate[dateKey] || [];
                return (
                  <div key={day} className="bg-background p-2 min-h-[80px] border-t">
                    <div className="text-xs font-medium mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayItems.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/20" onClick={() => navigate(\`${detailPath}/\${item.id}\`)}>
                          {item.${titleField}}
                        </div>
                      ))}
                      {dayItems.length > 2 && <div className="text-xs text-muted-foreground">+{dayItems.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}`;
}

function generateKanbanView(columns: string[], cardTitle: string, cardSubtitle: string, detailPath: string): string {
  const columnsLiteral = JSON.stringify(columns);
  return `        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {${columnsLiteral}.map((column: string) => (
              <div key={column} className="flex-shrink-0 w-80 bg-muted/30 rounded-md p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{column}</h3>
                  <Badge variant="secondary">{filtered.filter((i: any) => i.status === column).length}</Badge>
                </div>
                <div className="space-y-2">
                  {filtered.filter((i: any) => i.status === column).map((item: any) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(\`${detailPath}/\${item.id}\`)}>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{item.${cardTitle}}</p>${cardSubtitle ? `
                        <p className="text-xs text-muted-foreground mt-1">{item.${cardSubtitle}}</p>` : ''}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}`;
}

function generateCardGridView(imageField: string, titleField: string, subtitleField: string, hasStatus: boolean, detailPath: string, entityName: string): string {
  const imageJSX = imageField ? `
                {item.${imageField} && (
                  <div className="h-48 bg-muted rounded-t-md overflow-hidden">
                    <img src={item.${imageField}} alt={item.${titleField}} className="w-full h-full object-cover" />
                  </div>
                )}` : '';
  const subtitleJSX = subtitleField ? `
                  <p className="text-sm text-muted-foreground mt-1">{item.${subtitleField}}</p>` : '';
  const statusJSX = hasStatus ? `
                  <div className="mt-2"><StatusBadge status={item.status} /></div>` : '';

  return `        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? "No results found." : "No ${entityName.toLowerCase()}s yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item: any) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(\`${detailPath}/\${item.id}\`)}>
                ${imageJSX}
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.${titleField}}</h3>${subtitleJSX}${statusJSX}
                </CardContent>
              </Card>
            ))}
          </div>
        )}`;
}

function generateRelatedSection(
  rel: any,
  childEntity: PlannedEntity,
  parentEntityName: string,
  reasoning: ReasoningResult | null,
  imports: PageImports
): { queryDecl: string; section: string } | null {
  const childFieldMap = resolveEntityFields(childEntity, reasoning);
  const childEndpoint = `/api/${toKebab(rel.from)}s`;
  const childVarName = toCamel(rel.from);
  const foreignKey = rel.fromField || `${toCamel(parentEntityName)}Id`;

  const childDisplayFields = childFieldMap.displayFields
    .filter(f => f.name !== foreignKey)
    .slice(0, 5);

  const childEditableFields = childFieldMap.editableFields
    .filter(f => f.name !== foreignKey)
    .slice(0, 6);

  const childFieldImports = getImportsNeededForFields(childEditableFields.concat(childDisplayFields));
  if (childFieldImports.needsTextarea) imports.components.push('import { Textarea } from "@/components/ui/textarea";');
  if (childFieldImports.needsSelect) imports.components.push('import { Select, SelectOption } from "@/components/ui/select";');
  if (childFieldImports.needsStatusBadge) imports.custom.push('import StatusBadge from "@/components/status-badge";');
  if (childFieldImports.needsFormatUtils) imports.lib.push('formatCurrency', 'formatPercent', 'formatDate', 'formatDateTime');
  imports.components.push('import { Input } from "@/components/ui/input";');
  imports.components.push('import { Label } from "@/components/ui/label";');

  const formStates = generateStateDeclarations(childEditableFields, `child${rel.from}`);
  const formBody = generateFormBody(childEditableFields, `child${rel.from}`);
  const resetFields = generateResetStatements(childEditableFields, `child${rel.from}`);
  const formInputs = childEditableFields.map(f => generateFormFieldJSX(f, `child${rel.from}`)).join('\n');

  const childTableHeaders = childDisplayFields.map(f =>
    `                  <th className="text-left py-2 font-medium text-sm">${toTitle(f.name)}</th>`
  ).join('\n');

  const childTableRows = childDisplayFields.map(f => {
    const display = generateDisplayFieldJSX(f, 'child');
    return `                    <td className="py-2 text-sm">${display}</td>`;
  }).join('\n');

  const showFormVar = `showAdd${rel.from}`;
  const mutationVar = `create${rel.from}Mutation`;

  const queryDecl = `  const { data: ${childVarName}s = [] } = useQuery<any[]>({
    queryKey: ["${childEndpoint}", { ${foreignKey}: id }],
    enabled: !!id,
  });
  const [${showFormVar}, setShow${rel.from}Form] = useState(false);
${formStates}
  const ${mutationVar} = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "${childEndpoint}", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["${childEndpoint}"] });
      setShow${rel.from}Form(false);
${resetFields}
      toast({ title: "${toTitle(rel.from)} added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });`;

  const section = `
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">${toTitle(rel.from)}s</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShow${rel.from}Form(!${showFormVar})} data-testid="button-add-${toKebab(rel.from)}">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {${showFormVar} && (
            <div className="mb-4 p-3 border rounded-md space-y-2 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
${formInputs}
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShow${rel.from}Form(false)}>Cancel</Button>
                <Button size="sm" onClick={() => ${mutationVar}.mutate({
${formBody}
      ${foreignKey}: Number(id),
    })} loading={${mutationVar}.isPending} data-testid="button-submit-${toKebab(rel.from)}">
                  {${mutationVar}.isPending ? "Adding..." : "Add ${toTitle(rel.from)}"}
                </Button>
              </div>
            </div>
          )}
          {${childVarName}s.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
${childTableHeaders}
                  </tr>
                </thead>
                <tbody>
                  {${childVarName}s.map((child: any) => (
                    <tr key={child.id} className="border-b last:border-0">
${childTableRows}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No ${rel.from.toLowerCase()}s yet.</p>
          )}
        </CardContent>
      </Card>`;

  return { queryDecl, section };
}
