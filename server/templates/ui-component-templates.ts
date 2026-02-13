export interface UIComponentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  props: { name: string; type: string; required: boolean; defaultValue?: string }[];
  dependencies: string[];
  codeTemplate: string;
  variants: string[];
  responsive: boolean;
  accessibility: string[];
  stateManagement: string;
  styling: string;
}

export const uiComponentTemplates: UIComponentTemplate[] = [
  {
    id: 'sidebar-layout',
    name: 'Sidebar Layout',
    category: 'Layout',
    description: 'A responsive sidebar layout with collapsible navigation panel and main content area',
    keywords: ['sidebar', 'layout', 'navigation', 'menu', 'panel', 'collapsible'],
    props: [
      { name: 'collapsed', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'width', type: 'number', required: false, defaultValue: '280' },
      { name: 'position', type: "'left' | 'right'", required: false, defaultValue: "'left'" },
      { name: 'onToggle', type: '() => void', required: false },
      { name: 'children', type: 'React.ReactNode', required: true },
      { name: 'sidebarContent', type: 'React.ReactNode', required: true },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarLayoutProps {
  collapsed?: boolean;
  width?: number;
  position?: 'left' | 'right';
  onToggle?: () => void;
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export function SidebarLayout({ collapsed: controlledCollapsed, width = 280, position = 'left', onToggle, children, sidebarContent }: SidebarLayoutProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    onToggle?.();
    setInternalCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen w-full" data-testid="sidebar-layout">
      {position === 'left' && (
        <aside
          className={\`relative flex flex-col border-r bg-card transition-all duration-300 \${isCollapsed ? 'w-16' : ''}\`}
          style={{ width: isCollapsed ? 64 : width }}
          data-testid="sidebar-panel"
        >
          <button onClick={handleToggle} className="absolute top-3 right-3 p-1 rounded hover-elevate" data-testid="button-toggle-sidebar">
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <div className="flex-1 overflow-y-auto pt-10 px-3">{!isCollapsed && sidebarContent}</div>
        </aside>
      )}
      <main className="flex-1 overflow-y-auto" data-testid="sidebar-main-content">{children}</main>
      {position === 'right' && (
        <aside
          className={\`relative flex flex-col border-l bg-card transition-all duration-300 \${isCollapsed ? 'w-16' : ''}\`}
          style={{ width: isCollapsed ? 64 : width }}
          data-testid="sidebar-panel-right"
        >
          <button onClick={handleToggle} className="absolute top-3 left-3 p-1 rounded hover-elevate" data-testid="button-toggle-sidebar-right">
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <div className="flex-1 overflow-y-auto pt-10 px-3">{!isCollapsed && sidebarContent}</div>
        </aside>
      )}
    </div>
  );
}`,
    variants: ['default', 'mini', 'overlay', 'persistent'],
    responsive: true,
    accessibility: ['aria-expanded on toggle', 'aria-label on sidebar region', 'keyboard navigation support'],
    stateManagement: 'useState for collapse state',
    styling: 'tailwind',
  },
  {
    id: 'split-pane',
    name: 'Split Pane',
    category: 'Layout',
    description: 'A resizable split pane layout with draggable divider between two panels',
    keywords: ['split', 'pane', 'resizable', 'divider', 'panels', 'drag'],
    props: [
      { name: 'direction', type: "'horizontal' | 'vertical'", required: false, defaultValue: "'horizontal'" },
      { name: 'initialSize', type: 'number', required: false, defaultValue: '50' },
      { name: 'minSize', type: 'number', required: false, defaultValue: '20' },
      { name: 'maxSize', type: 'number', required: false, defaultValue: '80' },
      { name: 'left', type: 'React.ReactNode', required: true },
      { name: 'right', type: 'React.ReactNode', required: true },
    ],
    dependencies: ['react'],
    codeTemplate: `import { useState, useCallback, useRef } from 'react';

interface SplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitPane({ direction = 'horizontal', initialSize = 50, minSize = 20, maxSize = 80, left, right }: SplitPaneProps) {
  const [size, setSize] = useState(initialSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(() => { dragging.current = true; }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = direction === 'horizontal'
      ? ((e.clientX - rect.left) / rect.width) * 100
      : ((e.clientY - rect.top) / rect.height) * 100;
    setSize(Math.max(minSize, Math.min(maxSize, pct)));
  }, [direction, minSize, maxSize]);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={\`flex \${isHorizontal ? 'flex-row' : 'flex-col'} h-full w-full select-none\`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-testid="split-pane"
    >
      <div style={{ [isHorizontal ? 'width' : 'height']: size + '%' }} className="overflow-auto" data-testid="split-pane-left">{left}</div>
      <div
        onMouseDown={handleMouseDown}
        className={\`\${isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'} bg-border hover:bg-primary/50 transition-colors flex-shrink-0\`}
        role="separator"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        data-testid="split-pane-divider"
      />
      <div className="flex-1 overflow-auto" data-testid="split-pane-right">{right}</div>
    </div>
  );
}`,
    variants: ['horizontal', 'vertical', 'nested'],
    responsive: true,
    accessibility: ['role="separator" on divider', 'aria-orientation', 'keyboard arrow key support'],
    stateManagement: 'useState for split size, useRef for drag state',
    styling: 'tailwind',
  },
  {
    id: 'tab-layout',
    name: 'Tab Layout',
    category: 'Layout',
    description: 'A tabbed interface for organizing content into switchable sections',
    keywords: ['tabs', 'tabbed', 'sections', 'switch', 'panel'],
    props: [
      { name: 'tabs', type: '{ id: string; label: string; content: React.ReactNode; icon?: React.ReactNode }[]', required: true },
      { name: 'defaultTab', type: 'string', required: false },
      { name: 'onChange', type: '(tabId: string) => void', required: false },
      { name: 'variant', type: "'underline' | 'pills' | 'enclosed'", required: false, defaultValue: "'underline'" },
    ],
    dependencies: ['react'],
    codeTemplate: `import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
}

export function TabLayout({ tabs, defaultTab, onChange, variant = 'underline' }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const variantClasses: Record<string, { list: string; active: string; inactive: string }> = {
    underline: { list: 'border-b', active: 'border-b-2 border-primary text-foreground', inactive: 'text-muted-foreground hover-elevate' },
    pills: { list: 'gap-1', active: 'bg-primary text-primary-foreground rounded-md', inactive: 'text-muted-foreground hover-elevate rounded-md' },
    enclosed: { list: 'border-b', active: 'border border-b-0 rounded-t-md bg-card text-foreground', inactive: 'text-muted-foreground hover-elevate' },
  };

  const styles = variantClasses[variant];

  return (
    <div data-testid="tab-layout">
      <div className={\`flex \${styles.list}\`} role="tablist" data-testid="tab-list">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={\`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors \${activeTab === tab.id ? styles.active : styles.inactive}\`}
            data-testid={\`tab-\${tab.id}\`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="py-4" data-testid="tab-panel">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}`,
    variants: ['underline', 'pills', 'enclosed'],
    responsive: true,
    accessibility: ['role="tablist" and role="tab"', 'aria-selected', 'keyboard left/right navigation'],
    stateManagement: 'useState for active tab',
    styling: 'tailwind',
  },
  {
    id: 'accordion-layout',
    name: 'Accordion Layout',
    category: 'Layout',
    description: 'Expandable accordion panels for showing and hiding content sections',
    keywords: ['accordion', 'expandable', 'collapsible', 'faq', 'sections'],
    props: [
      { name: 'items', type: '{ id: string; title: string; content: React.ReactNode }[]', required: true },
      { name: 'allowMultiple', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'defaultOpen', type: 'string[]', required: false, defaultValue: '[]' },
      { name: 'onChange', type: '(openItems: string[]) => void', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionLayoutProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  onChange?: (openItems: string[]) => void;
}

export function AccordionLayout({ items, allowMultiple = false, defaultOpen = [], onChange }: AccordionLayoutProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    const updated = openItems.includes(id)
      ? openItems.filter(i => i !== id)
      : allowMultiple ? [...openItems, id] : [id];
    setOpenItems(updated);
    onChange?.(updated);
  };

  return (
    <div className="divide-y rounded-md border" data-testid="accordion-layout">
      {items.map(item => {
        const isOpen = openItems.includes(item.id);
        return (
          <div key={item.id} data-testid={\`accordion-item-\${item.id}\`}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-medium hover-elevate"
              aria-expanded={isOpen}
              data-testid={\`button-accordion-\${item.id}\`}
            >
              {item.title}
              <ChevronDown className={\`h-4 w-4 transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-muted-foreground" data-testid={\`accordion-content-\${item.id}\`}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}`,
    variants: ['default', 'bordered', 'flush', 'separated'],
    responsive: true,
    accessibility: ['aria-expanded on trigger', 'keyboard Enter/Space to toggle', 'aria-controls linking'],
    stateManagement: 'useState for open items array',
    styling: 'tailwind',
  },
  {
    id: 'masonry-grid',
    name: 'Masonry Grid',
    category: 'Layout',
    description: 'A Pinterest-style masonry grid layout for variable-height content items',
    keywords: ['masonry', 'grid', 'pinterest', 'columns', 'waterfall', 'gallery'],
    props: [
      { name: 'items', type: 'React.ReactNode[]', required: true },
      { name: 'columns', type: 'number', required: false, defaultValue: '3' },
      { name: 'gap', type: 'number', required: false, defaultValue: '16' },
    ],
    dependencies: ['react'],
    codeTemplate: `import { useMemo } from 'react';

interface MasonryGridProps {
  items: React.ReactNode[];
  columns?: number;
  gap?: number;
}

export function MasonryGrid({ items, columns = 3, gap = 16 }: MasonryGridProps) {
  const columnItems = useMemo(() => {
    const cols: React.ReactNode[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => {
      cols[i % columns].push(item);
    });
    return cols;
  }, [items, columns]);

  return (
    <div className="flex w-full" style={{ gap }} data-testid="masonry-grid">
      {columnItems.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-1 flex-col" style={{ gap }} data-testid={\`masonry-column-\${colIdx}\`}>
          {col.map((item, itemIdx) => (
            <div key={itemIdx} data-testid={\`masonry-item-\${colIdx}-\${itemIdx}\`}>{item}</div>
          ))}
        </div>
      ))}
    </div>
  );
}`,
    variants: ['default', 'compact', 'wide'],
    responsive: true,
    accessibility: ['semantic list markup', 'alt text on images within items'],
    stateManagement: 'useMemo for column distribution',
    styling: 'tailwind',
  },
  {
    id: 'sticky-header',
    name: 'Sticky Header',
    category: 'Layout',
    description: 'A header that sticks to the top of the viewport on scroll with optional shadow',
    keywords: ['sticky', 'header', 'fixed', 'scroll', 'top', 'navbar'],
    props: [
      { name: 'children', type: 'React.ReactNode', required: true },
      { name: 'showShadow', type: 'boolean', required: false, defaultValue: 'true' },
      { name: 'className', type: 'string', required: false },
    ],
    dependencies: ['react'],
    codeTemplate: `import { useState, useEffect } from 'react';

interface StickyHeaderProps {
  children: React.ReactNode;
  showShadow?: boolean;
  className?: string;
}

export function StickyHeader({ children, showShadow = true, className = '' }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={\`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-shadow \${scrolled && showShadow ? 'shadow-sm' : ''} \${className}\`}
      data-testid="sticky-header"
    >
      {children}
    </header>
  );
}`,
    variants: ['default', 'transparent', 'blur'],
    responsive: true,
    accessibility: ['role="banner"', 'landmark navigation', 'skip-to-content link'],
    stateManagement: 'useState + useEffect for scroll detection',
    styling: 'tailwind',
  },
  {
    id: 'floating-action-button',
    name: 'Floating Action Button',
    category: 'Layout',
    description: 'A floating action button fixed to the bottom corner with optional speed dial actions',
    keywords: ['fab', 'floating', 'action', 'button', 'speed-dial', 'fixed'],
    props: [
      { name: 'icon', type: 'React.ReactNode', required: true },
      { name: 'onClick', type: '() => void', required: false },
      { name: 'actions', type: '{ icon: React.ReactNode; label: string; onClick: () => void }[]', required: false },
      { name: 'position', type: "'bottom-right' | 'bottom-left'", required: false, defaultValue: "'bottom-right'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';

interface FabAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  actions?: FabAction[];
  position?: 'bottom-right' | 'bottom-left';
}

export function FloatingActionButton({ icon, onClick, actions, position = 'bottom-right' }: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false);
  const posClass = position === 'bottom-right' ? 'right-6 bottom-6' : 'left-6 bottom-6';

  const handleClick = () => {
    if (actions && actions.length > 0) {
      setOpen(prev => !prev);
    } else {
      onClick?.();
    }
  };

  return (
    <div className={\`fixed \${posClass} z-50 flex flex-col-reverse items-center gap-3\`} data-testid="fab-container">
      <button
        onClick={handleClick}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Action button"
        data-testid="button-fab"
      >
        {icon}
      </button>
      {open && actions && (
        <div className="flex flex-col items-center gap-2" data-testid="fab-actions">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false); }}
              className="flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm shadow-md hover-elevate"
              data-testid={\`button-fab-action-\${i}\`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'extended', 'speed-dial', 'mini'],
    responsive: true,
    accessibility: ['aria-label on main button', 'aria-expanded for speed dial', 'focus trap when open'],
    stateManagement: 'useState for speed dial open state',
    styling: 'tailwind',
  },
  {
    id: 'breadcrumb-navigation',
    name: 'Breadcrumb Navigation',
    category: 'Layout',
    description: 'A breadcrumb trail showing the current page hierarchy with clickable links',
    keywords: ['breadcrumb', 'navigation', 'path', 'trail', 'hierarchy'],
    props: [
      { name: 'items', type: '{ label: string; href?: string }[]', required: true },
      { name: 'separator', type: 'React.ReactNode', required: false, defaultValue: "'/'" },
      { name: 'maxItems', type: 'number', required: false, defaultValue: '5' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

export function BreadcrumbNavigation({ items, separator, maxItems = 5 }: BreadcrumbNavigationProps) {
  const displayed = items.length > maxItems
    ? [items[0], { label: '...' }, ...items.slice(-(maxItems - 1))]
    : items;

  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb-navigation">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {displayed.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5" data-testid={\`breadcrumb-item-\${i}\`}>
            {i > 0 && (separator || <ChevronRight className="h-3.5 w-3.5" />)}
            {item.href ? (
              <a href={item.href} className="hover:text-foreground transition-colors" data-testid={\`link-breadcrumb-\${i}\`}>{item.label}</a>
            ) : (
              <span className={i === displayed.length - 1 ? 'text-foreground font-medium' : ''} data-testid={\`text-breadcrumb-\${i}\`}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}`,
    variants: ['default', 'with-icons', 'collapsed'],
    responsive: true,
    accessibility: ['aria-label="Breadcrumb"', 'semantic nav element', 'aria-current="page" on last item'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'data-table',
    name: 'Data Table',
    category: 'Data Display',
    description: 'A full-featured data table with sorting, filtering, pagination, and row selection',
    keywords: ['table', 'data', 'grid', 'sort', 'filter', 'pagination', 'rows'],
    props: [
      { name: 'columns', type: '{ key: string; header: string; sortable?: boolean; render?: (value: any, row: any) => React.ReactNode }[]', required: true },
      { name: 'data', type: 'Record<string, any>[]', required: true },
      { name: 'pageSize', type: 'number', required: false, defaultValue: '10' },
      { name: 'selectable', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'onRowClick', type: '(row: any) => void', required: false },
      { name: 'searchable', type: 'boolean', required: false, defaultValue: 'true' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  pageSize?: number;
  selectable?: boolean;
  onRowClick?: (row: any) => void;
  searchable?: boolean;
}

export function DataTable({ columns, data, pageSize = 10, selectable = false, onRowClick, searchable = true }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(lower)));
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelect = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="w-full space-y-4" data-testid="data-table">
      {searchable && (
        <div className="relative" data-testid="data-table-search">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-4 text-sm"
            data-testid="input-table-search"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {selectable && <th className="w-10 px-3 py-3"><input type="checkbox" data-testid="checkbox-select-all" /></th>}
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover-elevate" data-testid={\`button-sort-\${col.key}\`}>
                      {col.header}
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={\`border-b transition-colors hover-elevate \${onRowClick ? 'cursor-pointer' : ''}\`}
                data-testid={\`row-data-\${i}\`}
              >
                {selectable && (
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selected.has(page * pageSize + i)} onChange={() => toggleSelect(page * pageSize + i)} data-testid={\`checkbox-row-\${i}\`} />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground" data-testid="data-table-pagination">
        <span>{filtered.length} result(s)</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 disabled:opacity-50" data-testid="button-prev-page"><ChevronLeft className="h-4 w-4" /></button>
          <span>Page {page + 1} of {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1 disabled:opacity-50" data-testid="button-next-page"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}`,
    variants: ['default', 'compact', 'striped', 'bordered'],
    responsive: true,
    accessibility: ['aria-sort on sortable columns', 'role="grid"', 'keyboard navigation between cells'],
    stateManagement: 'useState for search, sort, pagination, selection',
    styling: 'tailwind',
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    category: 'Data Display',
    description: 'A responsive grid of cards for displaying collections of items',
    keywords: ['card', 'grid', 'collection', 'gallery', 'items'],
    props: [
      { name: 'items', type: '{ id: string; title: string; description?: string; image?: string; metadata?: Record<string, string> }[]', required: true },
      { name: 'columns', type: 'number', required: false, defaultValue: '3' },
      { name: 'onCardClick', type: '(id: string) => void', required: false },
      { name: 'renderCard', type: '(item: any) => React.ReactNode', required: false },
    ],
    dependencies: ['react'],
    codeTemplate: `interface CardItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  metadata?: Record<string, string>;
}

interface CardGridProps {
  items: CardItem[];
  columns?: number;
  onCardClick?: (id: string) => void;
  renderCard?: (item: CardItem) => React.ReactNode;
}

export function CardGrid({ items, columns = 3, onCardClick, renderCard }: CardGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: \`repeat(\${columns}, minmax(0, 1fr))\` }}
      data-testid="card-grid"
    >
      {items.map(item => (
        <div key={item.id} data-testid={\`card-item-\${item.id}\`}>
          {renderCard ? renderCard(item) : (
            <div
              onClick={() => onCardClick?.(item.id)}
              className={\`rounded-md border bg-card p-4 transition-shadow hover-elevate \${onCardClick ? 'cursor-pointer' : ''}\`}
            >
              {item.image && <img src={item.image} alt={item.title} className="mb-3 w-full rounded-md object-cover" />}
              <h3 className="font-medium" data-testid={\`text-card-title-\${item.id}\`}>{item.title}</h3>
              {item.description && <p className="mt-1 text-sm text-muted-foreground" data-testid={\`text-card-desc-\${item.id}\`}>{item.description}</p>}
              {item.metadata && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(item.metadata).map(([k, v]) => (
                    <span key={k} className="rounded bg-muted px-2 py-0.5 text-xs" data-testid={\`badge-\${item.id}-\${k}\`}>{k}: {v}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`,
    variants: ['default', 'compact', 'horizontal', 'featured'],
    responsive: true,
    accessibility: ['semantic article elements', 'alt text on images', 'keyboard focus management'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    category: 'Data Display',
    description: 'A drag-and-drop kanban board with multiple columns for task management',
    keywords: ['kanban', 'board', 'drag', 'drop', 'tasks', 'columns', 'trello'],
    props: [
      { name: 'columns', type: '{ id: string; title: string; items: { id: string; title: string; description?: string; labels?: string[] }[] }[]', required: true },
      { name: 'onMoveItem', type: '(itemId: string, fromCol: string, toCol: string) => void', required: false },
      { name: 'onAddItem', type: '(columnId: string) => void', required: false },
      { name: 'renderCard', type: '(item: any) => React.ReactNode', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';

interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMoveItem?: (itemId: string, fromCol: string, toCol: string) => void;
  onAddItem?: (columnId: string) => void;
  renderCard?: (item: KanbanItem) => React.ReactNode;
}

export function KanbanBoard({ columns: initialColumns, onMoveItem, onAddItem, renderCard }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [dragItem, setDragItem] = useState<{ itemId: string; fromCol: string } | null>(null);

  const handleDragStart = (itemId: string, colId: string) => {
    setDragItem({ itemId, fromCol: colId });
  };

  const handleDrop = (toCol: string) => {
    if (!dragItem || dragItem.fromCol === toCol) return;
    setColumns(prev => {
      const next = prev.map(col => ({ ...col, items: [...col.items] }));
      const fromColData = next.find(c => c.id === dragItem.fromCol);
      const toColData = next.find(c => c.id === toCol);
      if (!fromColData || !toColData) return prev;
      const itemIdx = fromColData.items.findIndex(i => i.id === dragItem.itemId);
      if (itemIdx < 0) return prev;
      const [item] = fromColData.items.splice(itemIdx, 1);
      toColData.items.push(item);
      return next;
    });
    onMoveItem?.(dragItem.itemId, dragItem.fromCol, toCol);
    setDragItem(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto p-4" data-testid="kanban-board">
      {columns.map(col => (
        <div
          key={col.id}
          className="flex w-72 flex-shrink-0 flex-col rounded-md bg-muted/50 p-3"
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
          data-testid={\`kanban-column-\${col.id}\`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold" data-testid={\`text-column-title-\${col.id}\`}>{col.title}</h3>
            <span className="text-xs text-muted-foreground">{col.items.length}</span>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {col.items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id, col.id)}
                className="cursor-grab rounded-md border bg-card p-3 shadow-sm active:cursor-grabbing"
                data-testid={\`kanban-card-\${item.id}\`}
              >
                {renderCard ? renderCard(item) : (
                  <div>
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                    {item.labels && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.labels.map(label => <span key={label} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{label}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {onAddItem && (
            <button onClick={() => onAddItem(col.id)} className="mt-2 flex items-center gap-1 rounded-md p-2 text-sm text-muted-foreground hover-elevate" data-testid={\`button-add-\${col.id}\`}>
              <Plus className="h-4 w-4" /> Add item
            </button>
          )}
        </div>
      ))}
    </div>
  );
}`,
    variants: ['default', 'compact', 'swimlane', 'timeline'],
    responsive: true,
    accessibility: ['aria-grabbed on draggable items', 'aria-dropeffect on columns', 'keyboard drag support'],
    stateManagement: 'useState for columns state, drag state',
    styling: 'tailwind',
  },
  {
    id: 'calendar-view',
    name: 'Calendar View',
    category: 'Data Display',
    description: 'An interactive calendar with event display and navigation between months',
    keywords: ['calendar', 'date', 'events', 'schedule', 'month', 'planner'],
    props: [
      { name: 'events', type: '{ id: string; title: string; date: string; color?: string }[]', required: false, defaultValue: '[]' },
      { name: 'onDateClick', type: '(date: Date) => void', required: false },
      { name: 'onEventClick', type: '(eventId: string) => void', required: false },
      { name: 'initialDate', type: 'Date', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color?: string;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  initialDate?: Date;
}

export function CalendarView({ events = [], onDateClick, onEventClick, initialDate }: CalendarViewProps) {
  const [current, setCurrent] = useState(initialDate || new Date());

  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [current]);

  const getEventsForDay = (day: number) => {
    const dateStr = \`\${current.getFullYear()}-\${String(current.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
    return events.filter(e => e.date === dateStr);
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="w-full" data-testid="calendar-view">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1))} className="p-1 rounded hover-elevate" data-testid="button-prev-month"><ChevronLeft className="h-5 w-5" /></button>
        <h2 className="text-lg font-semibold" data-testid="text-current-month">{monthNames[current.getMonth()]} {current.getFullYear()}</h2>
        <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1))} className="p-1 rounded hover-elevate" data-testid="button-next-month"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-md border bg-border">
        {dayNames.map(d => <div key={d} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
        {days.map((day, i) => (
          <div
            key={i}
            onClick={() => day && onDateClick?.(new Date(current.getFullYear(), current.getMonth(), day))}
            className={\`min-h-[80px] bg-card p-1.5 \${day ? 'cursor-pointer hover-elevate' : ''}\`}
            data-testid={day ? \`calendar-day-\${day}\` : \`calendar-empty-\${i}\`}
          >
            {day && (
              <>
                <span className="text-xs font-medium">{day}</span>
                <div className="mt-1 space-y-0.5">
                  {getEventsForDay(day).map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); onEventClick?.(ev.id); }}
                      className="truncate rounded px-1 py-0.5 text-xs"
                      style={{ backgroundColor: ev.color || 'hsl(var(--primary) / 0.15)', color: ev.color ? '#fff' : 'hsl(var(--primary))' }}
                      data-testid={\`event-\${ev.id}\`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    variants: ['month', 'week', 'day', 'agenda'],
    responsive: true,
    accessibility: ['aria-label on date cells', 'role="grid"', 'keyboard date navigation'],
    stateManagement: 'useState for current month, useMemo for day calculations',
    styling: 'tailwind',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'Data Display',
    description: 'A vertical timeline displaying chronological events with icons and descriptions',
    keywords: ['timeline', 'history', 'events', 'chronological', 'steps'],
    props: [
      { name: 'items', type: '{ id: string; title: string; description?: string; date: string; icon?: React.ReactNode; status?: string }[]', required: true },
      { name: 'orientation', type: "'vertical' | 'horizontal'", required: false, defaultValue: "'vertical'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { Circle } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
  status?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
}

export function Timeline({ items, orientation = 'vertical' }: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="flex gap-4 overflow-x-auto py-4" data-testid="timeline-horizontal">
        {items.map((item, i) => (
          <div key={item.id} className="flex flex-col items-center" data-testid={\`timeline-item-\${item.id}\`}>
            <div className="flex items-center">
              {i > 0 && <div className="h-0.5 w-8 bg-border" />}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                {item.icon || <Circle className="h-3 w-3 fill-primary text-primary" />}
              </div>
              {i < items.length - 1 && <div className="h-0.5 w-8 bg-border" />}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative space-y-0" data-testid="timeline-vertical">
      {items.map((item, i) => (
        <div key={item.id} className="relative flex gap-4 pb-8" data-testid={\`timeline-item-\${item.id}\`}>
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background z-10">
              {item.icon || <Circle className="h-3 w-3 fill-primary text-primary" />}
            </div>
            {i < items.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
          </div>
          <div className="flex-1 pb-2">
            <p className="text-sm font-medium" data-testid={\`text-timeline-title-\${item.id}\`}>{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.date}</p>
            {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}`,
    variants: ['vertical', 'horizontal', 'alternating'],
    responsive: true,
    accessibility: ['semantic list markup', 'aria-label for timeline events', 'screen reader date announcements'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'tree-view',
    name: 'Tree View',
    category: 'Data Display',
    description: 'A hierarchical tree view for displaying nested data structures with expand/collapse',
    keywords: ['tree', 'hierarchy', 'nested', 'directory', 'file', 'expand'],
    props: [
      { name: 'data', type: '{ id: string; label: string; icon?: React.ReactNode; children?: TreeNode[] }[]', required: true },
      { name: 'onSelect', type: '(id: string) => void', required: false },
      { name: 'defaultExpanded', type: 'string[]', required: false, defaultValue: '[]' },
      { name: 'selectedId', type: 'string', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
  selectedId?: string;
}

function TreeItem({ node, level, expanded, onToggle, onSelect, selectedId }: { node: TreeNode; level: number; expanded: Set<string>; onToggle: (id: string) => void; onSelect?: (id: string) => void; selectedId?: string }) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div data-testid={\`tree-node-\${node.id}\`}>
      <div
        className={\`flex items-center gap-1 rounded-md px-2 py-1 text-sm cursor-pointer hover-elevate \${isSelected ? 'bg-accent text-accent-foreground' : ''}\`}
        style={{ paddingLeft: level * 16 + 8 }}
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          onSelect?.(node.id);
        }}
        data-testid={\`button-tree-\${node.id}\`}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />
        ) : <span className="w-4" />}
        {node.icon && <span className="flex-shrink-0">{node.icon}</span>}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeItem key={child.id} node={child} level={level + 1} expanded={expanded} onToggle={onToggle} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({ data, onSelect, defaultExpanded = [], selectedId }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

  const onToggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div role="tree" className="space-y-0.5" data-testid="tree-view">
      {data.map(node => (
        <TreeItem key={node.id} node={node} level={0} expanded={expanded} onToggle={onToggle} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}`,
    variants: ['default', 'checkbox', 'file-explorer'],
    responsive: true,
    accessibility: ['role="tree" and role="treeitem"', 'aria-expanded on branch nodes', 'keyboard arrow navigation'],
    stateManagement: 'useState for expanded nodes set',
    styling: 'tailwind',
  },
  {
    id: 'stat-card',
    name: 'Stat Card',
    category: 'Data Display',
    description: 'A statistics card showing a metric value with trend indicator and label',
    keywords: ['stat', 'metric', 'kpi', 'dashboard', 'number', 'trend'],
    props: [
      { name: 'title', type: 'string', required: true },
      { name: 'value', type: 'string | number', required: true },
      { name: 'change', type: 'number', required: false },
      { name: 'changeLabel', type: 'string', required: false },
      { name: 'icon', type: 'React.ReactNode', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, changeLabel, icon }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-md border bg-card p-4" data-testid="stat-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" data-testid="text-stat-title">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold" data-testid="text-stat-value">{value}</p>
      {change !== undefined && (
        <div className={\`mt-1 flex items-center gap-1 text-xs \${isPositive ? 'text-green-600' : 'text-red-600'}\`} data-testid="text-stat-change">
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? '+' : ''}{change}%</span>
          {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'with-chart', 'minimal', 'highlighted'],
    responsive: true,
    accessibility: ['aria-label for stat value', 'screen reader friendly trend description'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'progress-tracker',
    name: 'Progress Tracker',
    category: 'Data Display',
    description: 'A multi-step progress indicator showing completion status of sequential steps',
    keywords: ['progress', 'steps', 'tracker', 'workflow', 'status', 'milestones'],
    props: [
      { name: 'steps', type: '{ id: string; label: string; description?: string }[]', required: true },
      { name: 'currentStep', type: 'number', required: true },
      { name: 'orientation', type: "'horizontal' | 'vertical'", required: false, defaultValue: "'horizontal'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export function ProgressTracker({ steps, currentStep, orientation = 'horizontal' }: ProgressTrackerProps) {
  if (orientation === 'vertical') {
    return (
      <div className="space-y-0" data-testid="progress-tracker-vertical">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={step.id} className="flex gap-3" data-testid={\`step-\${step.id}\`}>
              <div className="flex flex-col items-center">
                <div className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium \${isCompleted ? 'border-primary bg-primary text-primary-foreground' : isCurrent ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}\`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={\`w-0.5 flex-1 min-h-[32px] \${isCompleted ? 'bg-primary' : 'bg-border'}\`} />}
              </div>
              <div className="pb-8">
                <p className={\`text-sm font-medium \${isCurrent ? 'text-foreground' : 'text-muted-foreground'}\`}>{step.label}</p>
                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0" data-testid="progress-tracker">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step.id} className="flex flex-1 items-center" data-testid={\`step-\${step.id}\`}>
            <div className="flex flex-col items-center">
              <div className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium \${isCompleted ? 'border-primary bg-primary text-primary-foreground' : isCurrent ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}\`}>
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <p className={\`mt-1 text-xs \${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}\`}>{step.label}</p>
            </div>
            {i < steps.length - 1 && <div className={\`mx-2 h-0.5 flex-1 \${isCompleted ? 'bg-primary' : 'bg-border'}\`} />}
          </div>
        );
      })}
    </div>
  );
}`,
    variants: ['horizontal', 'vertical', 'compact'],
    responsive: true,
    accessibility: ['aria-current="step"', 'aria-label on each step', 'semantic ordered list'],
    stateManagement: 'stateless (controlled by parent)',
    styling: 'tailwind',
  },
  {
    id: 'avatar-group',
    name: 'Avatar Group',
    category: 'Data Display',
    description: 'A group of overlapping avatars with overflow indicator for team member display',
    keywords: ['avatar', 'group', 'team', 'users', 'stacked', 'overflow'],
    props: [
      { name: 'users', type: '{ name: string; image?: string }[]', required: true },
      { name: 'max', type: 'number', required: false, defaultValue: '5' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, defaultValue: "'md'" },
    ],
    dependencies: ['react'],
    codeTemplate: `interface User {
  name: string;
  image?: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 5, size = 'md' }: AvatarGroupProps) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;
  const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-11 w-11 text-base' };
  const s = sizeClasses[size];

  return (
    <div className="flex -space-x-2" data-testid="avatar-group">
      {displayed.map((user, i) => (
        <div
          key={i}
          className={\`\${s} flex items-center justify-center rounded-full border-2 border-background bg-muted font-medium\`}
          title={user.name}
          data-testid={\`avatar-\${i}\`}
        >
          {user.image ? (
            <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={\`\${s} flex items-center justify-center rounded-full border-2 border-background bg-muted font-medium text-muted-foreground\`}
          data-testid="avatar-overflow"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'stacked', 'grid'],
    responsive: true,
    accessibility: ['title attribute for names', 'alt text on images', 'aria-label for overflow count'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'badge-list',
    name: 'Badge List',
    category: 'Data Display',
    description: 'A list of categorized badges or tags with optional actions and filtering',
    keywords: ['badge', 'tag', 'label', 'list', 'chip', 'category'],
    props: [
      { name: 'badges', type: '{ id: string; label: string; color?: string; removable?: boolean }[]', required: true },
      { name: 'onRemove', type: '(id: string) => void', required: false },
      { name: 'onClick', type: '(id: string) => void', required: false },
      { name: 'size', type: "'sm' | 'md'", required: false, defaultValue: "'md'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { X } from 'lucide-react';

interface BadgeItem {
  id: string;
  label: string;
  color?: string;
  removable?: boolean;
}

interface BadgeListProps {
  badges: BadgeItem[];
  onRemove?: (id: string) => void;
  onClick?: (id: string) => void;
  size?: 'sm' | 'md';
}

export function BadgeList({ badges, onRemove, onClick, size = 'md' }: BadgeListProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <div className="flex flex-wrap gap-2" data-testid="badge-list">
      {badges.map(badge => (
        <span
          key={badge.id}
          onClick={() => onClick?.(badge.id)}
          className={\`inline-flex items-center gap-1 rounded-md font-medium \${sizeClasses} \${onClick ? 'cursor-pointer hover-elevate' : ''}\`}
          style={{ backgroundColor: badge.color ? badge.color + '20' : undefined, color: badge.color }}
          data-testid={\`badge-\${badge.id}\`}
        >
          {badge.label}
          {badge.removable && onRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove(badge.id); }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
              data-testid={\`button-remove-badge-\${badge.id}\`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}`,
    variants: ['default', 'outline', 'solid'],
    responsive: true,
    accessibility: ['aria-label on remove buttons', 'semantic list markup'],
    stateManagement: 'stateless (controlled by parent)',
    styling: 'tailwind',
  },
  {
    id: 'multi-step-form',
    name: 'Multi-Step Form',
    category: 'Forms',
    description: 'A wizard-style multi-step form with validation, progress indicator, and navigation',
    keywords: ['form', 'wizard', 'multi-step', 'stepper', 'validation', 'onboarding'],
    props: [
      { name: 'steps', type: '{ id: string; title: string; content: React.ReactNode; validate?: () => boolean }[]', required: true },
      { name: 'onComplete', type: '(data: any) => void', required: true },
      { name: 'onStepChange', type: '(step: number) => void', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface FormStep {
  id: string;
  title: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: any) => void;
  onStepChange?: (step: number) => void;
}

export function MultiStepForm({ steps, onComplete, onStepChange }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => {
    const step = steps[currentStep];
    if (step.validate && !step.validate()) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      onStepChange?.(currentStep + 1);
    } else {
      onComplete({});
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  return (
    <div className="w-full space-y-6" data-testid="multi-step-form">
      <div className="flex items-center gap-2" data-testid="form-progress">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className={\`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium \${i < currentStep ? 'border-primary bg-primary text-primary-foreground' : i === currentStep ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}\`}>
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={\`mx-2 h-0.5 flex-1 \${i < currentStep ? 'bg-primary' : 'bg-border'}\`} />}
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-lg font-semibold" data-testid="text-step-title">{steps[currentStep].title}</h3>
        <div className="mt-4" data-testid="step-content">{steps[currentStep].content}</div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm disabled:opacity-50 hover-elevate"
          data-testid="button-form-back"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={goNext}
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover-elevate"
          data-testid="button-form-next"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}`,
    variants: ['default', 'compact', 'vertical-steps'],
    responsive: true,
    accessibility: ['aria-current="step"', 'focus management on step change', 'form validation announcements'],
    stateManagement: 'useState for current step',
    styling: 'tailwind',
  },
  {
    id: 'inline-edit',
    name: 'Inline Edit',
    category: 'Forms',
    description: 'An inline editable text field that switches between display and edit mode on click',
    keywords: ['inline', 'edit', 'editable', 'click-to-edit', 'text', 'input'],
    props: [
      { name: 'value', type: 'string', required: true },
      { name: 'onSave', type: '(value: string) => void', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Click to edit'" },
      { name: 'multiline', type: 'boolean', required: false, defaultValue: 'false' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineEdit({ value, onSave, placeholder = 'Click to edit', multiline = false }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (editing) {
    return (
      <div className="flex items-start gap-1" data-testid="inline-edit-editing">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
            rows={3}
            data-testid="input-inline-edit"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
            data-testid="input-inline-edit"
          />
        )}
        <button onClick={handleSave} className="p-1 text-green-600 hover-elevate rounded" data-testid="button-inline-save"><Check className="h-4 w-4" /></button>
        <button onClick={handleCancel} className="p-1 text-red-600 hover-elevate rounded" data-testid="button-inline-cancel"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true); }}
      className="group flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 hover-elevate"
      data-testid="inline-edit-display"
    >
      <span className={value ? '' : 'text-muted-foreground'}>{value || placeholder}</span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}`,
    variants: ['default', 'underline', 'bordered'],
    responsive: true,
    accessibility: ['role="button" on display mode', 'aria-label for edit action', 'Escape to cancel'],
    stateManagement: 'useState for editing state and draft value',
    styling: 'tailwind',
  },
  {
    id: 'search-with-filters',
    name: 'Search With Filters',
    category: 'Forms',
    description: 'A search input with configurable filter dropdowns and active filter chips',
    keywords: ['search', 'filter', 'query', 'faceted', 'chips', 'dropdown'],
    props: [
      { name: 'onSearch', type: '(query: string, filters: Record<string, string>) => void', required: true },
      { name: 'filters', type: '{ key: string; label: string; options: { value: string; label: string }[] }[]', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Search...'" },
      { name: 'defaultQuery', type: 'string', required: false, defaultValue: "''" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchWithFiltersProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
  filters: FilterDef[];
  placeholder?: string;
  defaultQuery?: string;
}

export function SearchWithFilters({ onSearch, filters, placeholder = 'Search...', defaultQuery = '' }: SearchWithFiltersProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = (q: string, f: Record<string, string>) => {
    setQuery(q);
    onSearch(q, f);
  };

  const setFilter = (key: string, value: string) => {
    const updated = { ...activeFilters, [key]: value };
    if (!value) delete updated[key];
    setActiveFilters(updated);
    handleSearch(query, updated);
  };

  const clearFilter = (key: string) => {
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(updated);
    handleSearch(query, updated);
  };

  return (
    <div className="space-y-3" data-testid="search-with-filters">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value, activeFilters)}
            placeholder={placeholder}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-4 text-sm"
            data-testid="input-search"
          />
        </div>
        {filters.map(filter => (
          <select
            key={filter.key}
            value={activeFilters[filter.key] || ''}
            onChange={e => setFilter(filter.key, e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
            data-testid={\`select-filter-\${filter.key}\`}
          >
            <option value="">{filter.label}</option>
            {filter.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ))}
      </div>
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-1" data-testid="active-filters">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filterDef = filters.find(f => f.key === key);
            const optLabel = filterDef?.options.find(o => o.value === value)?.label || value;
            return (
              <span key={key} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary" data-testid={\`chip-filter-\${key}\`}>
                {filterDef?.label}: {optLabel}
                <button onClick={() => clearFilter(key)} className="rounded-full p-0.5 hover:bg-primary/20" data-testid={\`button-clear-\${key}\`}><X className="h-3 w-3" /></button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'sidebar-filters', 'inline'],
    responsive: true,
    accessibility: ['aria-label on search input', 'aria-live region for results count', 'keyboard filter navigation'],
    stateManagement: 'useState for query and active filters',
    styling: 'tailwind',
  },
  {
    id: 'date-range-picker',
    name: 'Date Range Picker',
    category: 'Forms',
    description: 'A date range picker for selecting start and end dates with presets',
    keywords: ['date', 'range', 'picker', 'calendar', 'period', 'selection'],
    props: [
      { name: 'startDate', type: 'string', required: false },
      { name: 'endDate', type: 'string', required: false },
      { name: 'onChange', type: '(start: string, end: string) => void', required: true },
      { name: 'presets', type: '{ label: string; days: number }[]', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (start: string, end: string) => void;
  presets?: { label: string; days: number }[];
}

export function DateRangePicker({ startDate = '', endDate = '', onChange, presets }: DateRangePickerProps) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  const handleStartChange = (value: string) => {
    setStart(value);
    onChange(value, end);
  };

  const handleEndChange = (value: string) => {
    setEnd(value);
    onChange(start, value);
  };

  const applyPreset = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const s = startDate.toISOString().split('T')[0];
    const e = endDate.toISOString().split('T')[0];
    setStart(s);
    setEnd(e);
    onChange(s, e);
  };

  return (
    <div className="space-y-2" data-testid="date-range-picker">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="date" value={start} onChange={e => handleStartChange(e.target.value)} className="rounded-md border bg-background py-2 pl-9 pr-3 text-sm" data-testid="input-start-date" />
        </div>
        <span className="text-sm text-muted-foreground">to</span>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="date" value={end} onChange={e => handleEndChange(e.target.value)} className="rounded-md border bg-background py-2 pl-9 pr-3 text-sm" data-testid="input-end-date" />
        </div>
      </div>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {presets.map(preset => (
            <button key={preset.label} onClick={() => applyPreset(preset.days)} className="rounded-md border px-2 py-1 text-xs hover-elevate" data-testid={\`button-preset-\${preset.days}\`}>
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'inline', 'with-presets'],
    responsive: true,
    accessibility: ['aria-label on date inputs', 'keyboard date entry', 'screen reader date format'],
    stateManagement: 'useState for start and end dates',
    styling: 'tailwind',
  },
  {
    id: 'file-dropzone',
    name: 'File Dropzone',
    category: 'Forms',
    description: 'A drag-and-drop file upload area with file preview and validation',
    keywords: ['file', 'upload', 'drop', 'drag', 'dropzone', 'attachment'],
    props: [
      { name: 'onFilesSelected', type: '(files: File[]) => void', required: true },
      { name: 'accept', type: 'string', required: false, defaultValue: "'*'" },
      { name: 'maxFiles', type: 'number', required: false, defaultValue: '5' },
      { name: 'maxSize', type: 'number', required: false, defaultValue: '10485760' },
      { name: 'multiple', type: 'boolean', required: false, defaultValue: 'true' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useRef } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
}

export function FileDropzone({ onFilesSelected, accept = '*', maxFiles = 5, maxSize = 10485760, multiple = true }: FileDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => f.size <= maxSize).slice(0, maxFiles - files.length);
    const updated = [...files, ...valid];
    setFiles(updated);
    onFilesSelected(updated);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3" data-testid="file-dropzone">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={\`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors \${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}\`}
        data-testid="dropzone-area"
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drag files here or click to browse</p>
        <p className="text-xs text-muted-foreground">Max {formatSize(maxSize)} per file</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={e => handleFiles(e.target.files)} className="hidden" data-testid="input-file" />
      </div>
      {files.length > 0 && (
        <div className="space-y-2" data-testid="file-list">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border p-2" data-testid={\`file-item-\${i}\`}>
              <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 truncate text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
              <button onClick={() => removeFile(i)} className="p-0.5 rounded hover-elevate" data-testid={\`button-remove-file-\${i}\`}><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'compact', 'avatar-upload', 'document'],
    responsive: true,
    accessibility: ['aria-label on dropzone', 'keyboard file selection', 'screen reader file status'],
    stateManagement: 'useState for files array and drag state',
    styling: 'tailwind',
  },
  {
    id: 'rich-text-editor',
    name: 'Rich Text Editor',
    category: 'Forms',
    description: 'A rich text editor with formatting toolbar for bold, italic, lists, and more',
    keywords: ['editor', 'rich-text', 'wysiwyg', 'formatting', 'toolbar', 'content'],
    props: [
      { name: 'value', type: 'string', required: false, defaultValue: "''" },
      { name: 'onChange', type: '(value: string) => void', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Start writing...'" },
      { name: 'minHeight', type: 'number', required: false, defaultValue: '200' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ value = '', onChange, placeholder = 'Start writing...', minHeight = 200 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const tools = [
    { icon: <Bold className="h-4 w-4" />, command: 'bold', label: 'Bold' },
    { icon: <Italic className="h-4 w-4" />, command: 'italic', label: 'Italic' },
    { icon: <Underline className="h-4 w-4" />, command: 'underline', label: 'Underline' },
    { icon: <List className="h-4 w-4" />, command: 'insertUnorderedList', label: 'Bullet list' },
    { icon: <ListOrdered className="h-4 w-4" />, command: 'insertOrderedList', label: 'Numbered list' },
    { icon: <AlignLeft className="h-4 w-4" />, command: 'justifyLeft', label: 'Align left' },
    { icon: <AlignCenter className="h-4 w-4" />, command: 'justifyCenter', label: 'Align center' },
    { icon: <AlignRight className="h-4 w-4" />, command: 'justifyRight', label: 'Align right' },
  ];

  return (
    <div className="rounded-md border" data-testid="rich-text-editor">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1" data-testid="editor-toolbar">
        {tools.map(tool => (
          <button
            key={tool.command}
            onMouseDown={e => { e.preventDefault(); execCommand(tool.command); }}
            className="rounded p-1.5 hover-elevate"
            title={tool.label}
            aria-label={tool.label}
            data-testid={\`button-\${tool.command}\`}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        className="prose prose-sm max-w-none p-3 focus:outline-none"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        data-testid="editor-content"
      />
    </div>
  );
}`,
    variants: ['default', 'minimal', 'full-featured'],
    responsive: true,
    accessibility: ['aria-label on toolbar buttons', 'role="textbox" on editable area', 'keyboard shortcuts for formatting'],
    stateManagement: 'useRef for editor element, parent-controlled value',
    styling: 'tailwind',
  },
  {
    id: 'autocomplete-input',
    name: 'Autocomplete Input',
    category: 'Forms',
    description: 'A text input with dropdown autocomplete suggestions and keyboard navigation',
    keywords: ['autocomplete', 'typeahead', 'suggest', 'combobox', 'search', 'input'],
    props: [
      { name: 'suggestions', type: 'string[]', required: true },
      { name: 'value', type: 'string', required: true },
      { name: 'onChange', type: '(value: string) => void', required: true },
      { name: 'onSelect', type: '(value: string) => void', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Type to search...'" },
    ],
    dependencies: ['react'],
    codeTemplate: `import { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function AutocompleteInput({ suggestions, value, onChange, onSelect, placeholder = 'Type to search...' }: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => { setHighlightIndex(-1); }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      onSelect(filtered[highlightIndex]);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative" data-testid="autocomplete-input">
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        data-testid="input-autocomplete"
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef} className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-md" role="listbox" data-testid="autocomplete-list">
          {filtered.map((item, i) => (
            <li
              key={item}
              onMouseDown={() => { onSelect(item); setOpen(false); }}
              className={\`cursor-pointer px-3 py-2 text-sm \${i === highlightIndex ? 'bg-accent text-accent-foreground' : 'hover-elevate'}\`}
              role="option"
              aria-selected={i === highlightIndex}
              data-testid={\`option-\${i}\`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
    variants: ['default', 'multi-select', 'grouped'],
    responsive: true,
    accessibility: ['role="combobox"', 'aria-expanded', 'aria-autocomplete="list"', 'keyboard arrow navigation'],
    stateManagement: 'useState for open state and highlight index',
    styling: 'tailwind',
  },
  {
    id: 'tag-input',
    name: 'Tag Input',
    category: 'Forms',
    description: 'A text input for adding and removing tags with keyboard support',
    keywords: ['tag', 'input', 'chips', 'tokens', 'multi-value', 'keywords'],
    props: [
      { name: 'tags', type: 'string[]', required: true },
      { name: 'onChange', type: '(tags: string[]) => void', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Add a tag...'" },
      { name: 'maxTags', type: 'number', required: false, defaultValue: '10' },
      { name: 'suggestions', type: 'string[]', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

export function TagInput({ tags, onChange, placeholder = 'Add a tag...', maxTags = 10, suggestions }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const filteredSuggestions = suggestions?.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)) || [];

  return (
    <div className="space-y-2" data-testid="tag-input">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background p-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary" data-testid={\`tag-\${i}\`}>
            {tag}
            <button onClick={() => removeTag(i)} className="rounded-full p-0.5 hover:bg-primary/20" data-testid={\`button-remove-tag-\${i}\`}><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length < maxTags ? placeholder : ''}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
          data-testid="input-tag"
        />
      </div>
      {input && filteredSuggestions.length > 0 && (
        <div className="rounded-md border bg-popover shadow-sm" data-testid="tag-suggestions">
          {filteredSuggestions.slice(0, 5).map(s => (
            <button key={s} onMouseDown={() => addTag(s)} className="block w-full px-3 py-1.5 text-left text-sm hover-elevate" data-testid={\`suggestion-\${s}\`}>{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'outlined', 'colored'],
    responsive: true,
    accessibility: ['aria-label on input', 'aria-label on remove buttons', 'keyboard Enter/Backspace handling'],
    stateManagement: 'useState for input text, parent controls tags array',
    styling: 'tailwind',
  },
  {
    id: 'toast-notification',
    name: 'Toast Notification',
    category: 'Feedback',
    description: 'A toast notification system for showing temporary status messages',
    keywords: ['toast', 'notification', 'alert', 'snackbar', 'message', 'feedback'],
    props: [
      { name: 'message', type: 'string', required: true },
      { name: 'type', type: "'success' | 'error' | 'warning' | 'info'", required: false, defaultValue: "'info'" },
      { name: 'duration', type: 'number', required: false, defaultValue: '5000' },
      { name: 'onClose', type: '() => void', required: false },
      { name: 'action', type: '{ label: string; onClick: () => void }', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: ToastAction;
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function ToastNotification({ message, type = 'info', duration = 5000, onClose, action }: ToastNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => { setVisible(false); onClose?.(); }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-md border bg-card px-4 py-3 shadow-lg" role="alert" data-testid="toast-notification">
      {icons[type]}
      <p className="text-sm" data-testid="text-toast-message">{message}</p>
      {action && (
        <button onClick={action.onClick} className="text-sm font-medium text-primary hover:underline" data-testid="button-toast-action">{action.label}</button>
      )}
      <button onClick={() => { setVisible(false); onClose?.(); }} className="ml-2 rounded p-0.5 hover-elevate" data-testid="button-toast-close"><X className="h-4 w-4" /></button>
    </div>
  );
}`,
    variants: ['success', 'error', 'warning', 'info'],
    responsive: true,
    accessibility: ['role="alert"', 'aria-live="polite"', 'auto-dismiss with screen reader announcement'],
    stateManagement: 'useState for visibility, useEffect for auto-dismiss timer',
    styling: 'tailwind',
  },
  {
    id: 'confirmation-dialog',
    name: 'Confirmation Dialog',
    category: 'Feedback',
    description: 'A modal dialog for confirming destructive or important actions',
    keywords: ['dialog', 'modal', 'confirm', 'alert', 'prompt', 'action'],
    props: [
      { name: 'open', type: 'boolean', required: true },
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: true },
      { name: 'onConfirm', type: '() => void', required: true },
      { name: 'onCancel', type: '() => void', required: true },
      { name: 'confirmLabel', type: 'string', required: false, defaultValue: "'Confirm'" },
      { name: 'variant', type: "'danger' | 'warning' | 'default'", required: false, defaultValue: "'default'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmationDialog({ open, title, description, onConfirm, onCancel, confirmLabel = 'Confirm', variant = 'default' }: ConfirmationDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass = variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : variant === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-primary text-primary-foreground';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="confirmation-dialog">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} data-testid="dialog-backdrop" />
      <div className="relative z-50 w-full max-w-md rounded-md border bg-card p-6 shadow-lg" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" data-testid="dialog-content">
        {variant === 'danger' && <AlertTriangle className="mb-3 h-6 w-6 text-red-500" />}
        <h2 id="dialog-title" className="text-lg font-semibold" data-testid="text-dialog-title">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground" data-testid="text-dialog-description">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} className="rounded-md border px-4 py-2 text-sm hover-elevate" data-testid="button-dialog-cancel">Cancel</button>
          <button onClick={onConfirm} className={\`rounded-md px-4 py-2 text-sm \${confirmClass}\`} data-testid="button-dialog-confirm">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}`,
    variants: ['default', 'danger', 'warning'],
    responsive: true,
    accessibility: ['role="alertdialog"', 'aria-modal="true"', 'focus trap', 'Escape to close'],
    stateManagement: 'controlled by parent via open prop',
    styling: 'tailwind',
  },
  {
    id: 'loading-skeleton',
    name: 'Loading Skeleton',
    category: 'Feedback',
    description: 'Animated placeholder skeletons that mimic content layout while loading',
    keywords: ['skeleton', 'loading', 'placeholder', 'shimmer', 'preload'],
    props: [
      { name: 'variant', type: "'text' | 'card' | 'avatar' | 'table'", required: false, defaultValue: "'text'" },
      { name: 'lines', type: 'number', required: false, defaultValue: '3' },
      { name: 'animated', type: 'boolean', required: false, defaultValue: 'true' },
    ],
    dependencies: ['react'],
    codeTemplate: `interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'table';
  lines?: number;
  animated?: boolean;
}

export function LoadingSkeleton({ variant = 'text', lines = 3, animated = true }: LoadingSkeletonProps) {
  const pulse = animated ? 'animate-pulse' : '';

  if (variant === 'avatar') {
    return (
      <div className="flex items-center gap-3" data-testid="skeleton-avatar">
        <div className={\`h-10 w-10 rounded-full bg-muted \${pulse}\`} />
        <div className="space-y-2">
          <div className={\`h-4 w-32 rounded bg-muted \${pulse}\`} />
          <div className={\`h-3 w-24 rounded bg-muted \${pulse}\`} />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="rounded-md border p-4 space-y-3" data-testid="skeleton-card">
        <div className={\`h-40 w-full rounded bg-muted \${pulse}\`} />
        <div className={\`h-5 w-3/4 rounded bg-muted \${pulse}\`} />
        <div className={\`h-4 w-full rounded bg-muted \${pulse}\`} />
        <div className={\`h-4 w-2/3 rounded bg-muted \${pulse}\`} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-2" data-testid="skeleton-table">
        <div className={\`h-10 w-full rounded bg-muted/50 \${pulse}\`} />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={\`h-12 w-full rounded bg-muted \${pulse}\`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="skeleton-text">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={\`h-4 rounded bg-muted \${pulse}\`} style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}`,
    variants: ['text', 'card', 'avatar', 'table'],
    responsive: true,
    accessibility: ['aria-busy="true"', 'aria-label="Loading"', 'role="status"'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'empty-state',
    name: 'Empty State',
    category: 'Feedback',
    description: 'A placeholder displayed when a section has no data with optional action',
    keywords: ['empty', 'state', 'no-data', 'placeholder', 'zero-state'],
    props: [
      { name: 'icon', type: 'React.ReactNode', required: false },
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'action', type: '{ label: string; onClick: () => void }', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
      <div className="mb-4 text-muted-foreground">{icon || <Inbox className="h-12 w-12" />}</div>
      <h3 className="text-lg font-medium" data-testid="text-empty-title">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground" data-testid="text-empty-description">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" data-testid="button-empty-action">{action.label}</button>
      )}
    </div>
  );
}`,
    variants: ['default', 'compact', 'illustrated'],
    responsive: true,
    accessibility: ['descriptive heading', 'aria-label on action button'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'error-boundary',
    name: 'Error Boundary',
    category: 'Feedback',
    description: 'A React error boundary component that catches errors and displays a fallback UI',
    keywords: ['error', 'boundary', 'catch', 'fallback', 'crash', 'recovery'],
    props: [
      { name: 'children', type: 'React.ReactNode', required: true },
      { name: 'fallback', type: 'React.ReactNode', required: false },
      { name: 'onError', type: '(error: Error, errorInfo: React.ErrorInfo) => void', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="error-boundary">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-medium" data-testid="text-error-title">Something went wrong</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground" data-testid="text-error-message">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            data-testid="button-error-retry"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}`,
    variants: ['default', 'minimal', 'detailed'],
    responsive: true,
    accessibility: ['role="alert" on error display', 'aria-live for error messages', 'focus management on error'],
    stateManagement: 'React class component error state',
    styling: 'tailwind',
  },
  {
    id: 'command-palette',
    name: 'Command Palette',
    category: 'Navigation',
    description: 'A keyboard-driven command palette for quick navigation and actions',
    keywords: ['command', 'palette', 'search', 'spotlight', 'quick-action', 'shortcut'],
    props: [
      { name: 'open', type: 'boolean', required: true },
      { name: 'onClose', type: '() => void', required: true },
      { name: 'commands', type: '{ id: string; label: string; icon?: React.ReactNode; action: () => void; group?: string }[]', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Type a command...'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  group?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
}

export function CommandPalette({ open, onClose, commands, placeholder = 'Type a command...' }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(() => commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), [commands, query]);

  useEffect(() => { if (open) { setQuery(''); setSelectedIndex(0); } }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selectedIndex]) { filtered[selectedIndex].action(); onClose(); }
    else if (e.key === 'Escape') { onClose(); }
  };

  if (!open) return null;

  const groups = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    const g = cmd.group || 'Actions';
    if (!acc[g]) acc[g] = [];
    acc[g].push(cmd);
    return acc;
  }, {});

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" data-testid="command-palette">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-md border bg-card shadow-2xl" role="dialog" aria-modal="true" data-testid="command-dialog">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3 text-sm outline-none"
            data-testid="input-command"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1" data-testid="command-list">
          {Object.entries(groups).map(([group, cmds]) => (
            <div key={group}>
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group}</p>
              {cmds.map(cmd => {
                const idx = flatIdx++;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose(); }}
                    className={\`flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm \${idx === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover-elevate'}\`}
                    data-testid={\`command-\${cmd.id}\`}
                  >
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No results found</p>}
        </div>
      </div>
    </div>
  );
}`,
    variants: ['default', 'with-categories', 'minimal'],
    responsive: true,
    accessibility: ['role="dialog"', 'aria-modal="true"', 'keyboard navigation', 'Cmd+K shortcut'],
    stateManagement: 'useState for query and selected index',
    styling: 'tailwind',
  },
  {
    id: 'mega-menu',
    name: 'Mega Menu',
    category: 'Navigation',
    description: 'A large dropdown navigation menu with categorized links and optional featured content',
    keywords: ['mega', 'menu', 'dropdown', 'navigation', 'categories', 'links'],
    props: [
      { name: 'trigger', type: 'React.ReactNode', required: true },
      { name: 'sections', type: '{ title: string; items: { label: string; href: string; description?: string }[] }[]', required: true },
      { name: 'featured', type: 'React.ReactNode', required: false },
    ],
    dependencies: ['react'],
    codeTemplate: `import { useState } from 'react';

interface MegaMenuItem {
  label: string;
  href: string;
  description?: string;
}

interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}

interface MegaMenuProps {
  trigger: React.ReactNode;
  sections: MegaMenuSection[];
  featured?: React.ReactNode;
}

export function MegaMenu({ trigger, sections, featured }: MegaMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)} data-testid="mega-menu">
      <div onMouseEnter={() => setOpen(true)} onClick={() => setOpen(prev => !prev)} className="cursor-pointer" data-testid="mega-menu-trigger">
        {trigger}
      </div>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-screen max-w-4xl rounded-md border bg-card p-6 shadow-lg" data-testid="mega-menu-content">
          <div className="flex gap-8">
            <div className="flex flex-1 gap-8">
              {sections.map(section => (
                <div key={section.title} className="min-w-[180px]">
                  <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{section.title}</h4>
                  <ul className="space-y-1">
                    {section.items.map(item => (
                      <li key={item.href}>
                        <a href={item.href} className="block rounded-md p-2 text-sm hover-elevate" data-testid={\`link-mega-\${item.label}\`}>
                          <span className="font-medium">{item.label}</span>
                          {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {featured && <div className="w-64 border-l pl-6" data-testid="mega-menu-featured">{featured}</div>}
          </div>
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'full-width', 'with-images'],
    responsive: true,
    accessibility: ['aria-expanded on trigger', 'aria-haspopup="true"', 'keyboard Escape to close'],
    stateManagement: 'useState for open state',
    styling: 'tailwind',
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'Navigation',
    description: 'A pagination component with page numbers, previous/next buttons, and page size selector',
    keywords: ['pagination', 'pages', 'navigate', 'page-size', 'pager'],
    props: [
      { name: 'currentPage', type: 'number', required: true },
      { name: 'totalPages', type: 'number', required: true },
      { name: 'onPageChange', type: '(page: number) => void', required: true },
      { name: 'siblingCount', type: 'number', required: false, defaultValue: '1' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }: PaginationProps) {
  const pages = useMemo(() => {
    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - siblingCount);
    const right = Math.min(totalPages - 1, currentPage + siblingCount);
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [currentPage, totalPages, siblingCount]);

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination" data-testid="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-md p-2 disabled:opacity-50 hover-elevate"
        aria-label="Previous page"
        data-testid="button-prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((page, i) =>
        typeof page === 'string' ? (
          <span key={\`ellipsis-\${i}\`} className="px-2 text-sm text-muted-foreground">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={\`min-w-[36px] rounded-md px-3 py-2 text-sm \${page === currentPage ? 'bg-primary text-primary-foreground' : 'hover-elevate'}\`}
            aria-current={page === currentPage ? 'page' : undefined}
            data-testid={\`button-page-\${page}\`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-md p-2 disabled:opacity-50 hover-elevate"
        aria-label="Next page"
        data-testid="button-next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}`,
    variants: ['default', 'compact', 'with-page-size'],
    responsive: true,
    accessibility: ['aria-label="Pagination"', 'aria-current="page"', 'disabled state on bounds'],
    stateManagement: 'controlled by parent, useMemo for page range',
    styling: 'tailwind',
  },
  {
    id: 'stepper',
    name: 'Stepper',
    category: 'Navigation',
    description: 'A numbered step navigation component for multi-step processes with status indicators',
    keywords: ['stepper', 'steps', 'process', 'flow', 'wizard', 'progress'],
    props: [
      { name: 'steps', type: '{ label: string; description?: string }[]', required: true },
      { name: 'activeStep', type: 'number', required: true },
      { name: 'onStepClick', type: '(step: number) => void', required: false },
      { name: 'orientation', type: "'horizontal' | 'vertical'", required: false, defaultValue: "'horizontal'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { Check } from 'lucide-react';

interface StepperProps {
  steps: { label: string; description?: string }[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function Stepper({ steps, activeStep, onStepClick, orientation = 'horizontal' }: StepperProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={\`flex \${isVertical ? 'flex-col' : 'items-center'}\`} data-testid="stepper">
      {steps.map((step, i) => {
        const isComplete = i < activeStep;
        const isCurrent = i === activeStep;
        return (
          <div key={i} className={\`flex \${isVertical ? '' : 'flex-1'} items-center \${isVertical ? 'gap-3 pb-6' : ''}\`} data-testid={\`stepper-step-\${i}\`}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(i)}
                disabled={!onStepClick}
                className={\`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors \${isComplete ? 'border-primary bg-primary text-primary-foreground' : isCurrent ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}\`}
                data-testid={\`button-step-\${i}\`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </button>
            </div>
            {!isVertical && i < steps.length - 1 && <div className={\`mx-3 h-0.5 flex-1 \${isComplete ? 'bg-primary' : 'bg-border'}\`} />}
            {isVertical && (
              <div>
                <p className={\`text-sm font-medium \${isCurrent ? 'text-foreground' : 'text-muted-foreground'}\`}>{step.label}</p>
                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}`,
    variants: ['horizontal', 'vertical', 'with-labels'],
    responsive: true,
    accessibility: ['aria-current="step"', 'aria-label on step buttons', 'semantic ordered list'],
    stateManagement: 'controlled by parent via activeStep',
    styling: 'tailwind',
  },
  {
    id: 'bottom-navigation',
    name: 'Bottom Navigation',
    category: 'Navigation',
    description: 'A mobile-friendly bottom navigation bar with icons and labels',
    keywords: ['bottom', 'navigation', 'mobile', 'tab-bar', 'footer-nav'],
    props: [
      { name: 'items', type: '{ id: string; label: string; icon: React.ReactNode; href: string }[]', required: true },
      { name: 'activeId', type: 'string', required: true },
      { name: 'onNavigate', type: '(id: string) => void', required: true },
    ],
    dependencies: ['react'],
    codeTemplate: `interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export function BottomNavigation({ items, activeId, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur" data-testid="bottom-navigation">
      <div className="flex items-stretch">
        {items.map(item => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={\`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors \${isActive ? 'text-primary' : 'text-muted-foreground'}\`}
              data-testid={\`nav-\${item.id}\`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}`,
    variants: ['default', 'labeled', 'icon-only'],
    responsive: true,
    accessibility: ['aria-current on active item', 'semantic nav element', 'touch target size minimum 44px'],
    stateManagement: 'controlled by parent via activeId',
    styling: 'tailwind',
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    category: 'Media',
    description: 'An image gallery with grid display, lightbox modal, and navigation controls',
    keywords: ['image', 'gallery', 'lightbox', 'photos', 'grid', 'viewer'],
    props: [
      { name: 'images', type: '{ src: string; alt: string; caption?: string }[]', required: true },
      { name: 'columns', type: 'number', required: false, defaultValue: '3' },
      { name: 'enableLightbox', type: 'boolean', required: false, defaultValue: 'true' },
      { name: 'aspectRatio', type: "'square' | 'auto'", required: false, defaultValue: "'square'" },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  enableLightbox?: boolean;
  aspectRatio?: 'square' | 'auto';
}

export function ImageGallery({ images, columns = 3, enableLightbox = true, aspectRatio = 'square' }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => { if (enableLightbox) setLightboxIndex(index); };
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + images.length) % images.length : null);
  const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % images.length : null);

  return (
    <>
      <div className="grid gap-2" style={{ gridTemplateColumns: \`repeat(\${columns}, minmax(0, 1fr))\` }} data-testid="image-gallery">
        {images.map((img, i) => (
          <div key={i} onClick={() => openLightbox(i)} className={\`cursor-pointer overflow-hidden rounded-md \${aspectRatio === 'square' ? 'aspect-square' : ''}\`} data-testid={\`gallery-image-\${i}\`}>
            <img src={img.src} alt={img.alt} className="h-full w-full object-cover transition-transform hover:scale-105" />
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeLightbox} data-testid="lightbox">
          <button onClick={e => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 rounded-full p-2 text-white hover:bg-white/20" data-testid="button-lightbox-close"><X className="h-6 w-6" /></button>
          <button onClick={e => { e.stopPropagation(); prevImage(); }} className="absolute left-4 rounded-full p-2 text-white hover:bg-white/20" data-testid="button-lightbox-prev"><ChevronLeft className="h-6 w-6" /></button>
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
            data-testid="lightbox-image"
          />
          <button onClick={e => { e.stopPropagation(); nextImage(); }} className="absolute right-4 rounded-full p-2 text-white hover:bg-white/20" data-testid="button-lightbox-next"><ChevronRight className="h-6 w-6" /></button>
          {images[lightboxIndex].caption && <p className="absolute bottom-4 text-center text-sm text-white" data-testid="text-lightbox-caption">{images[lightboxIndex].caption}</p>}
        </div>
      )}
    </>
  );
}`,
    variants: ['grid', 'masonry', 'carousel', 'filmstrip'],
    responsive: true,
    accessibility: ['alt text on all images', 'keyboard lightbox navigation', 'Escape to close lightbox', 'aria-label on controls'],
    stateManagement: 'useState for lightbox index',
    styling: 'tailwind',
  },
  {
    id: 'video-player',
    name: 'Video Player',
    category: 'Media',
    description: 'A custom video player with playback controls, progress bar, and volume control',
    keywords: ['video', 'player', 'media', 'playback', 'stream', 'controls'],
    props: [
      { name: 'src', type: 'string', required: true },
      { name: 'poster', type: 'string', required: false },
      { name: 'autoPlay', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'onEnded', type: '() => void', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function VideoPlayer({ src, poster, autoPlay = false, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause(); else videoRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const pct = Number(e.target.value);
    videoRef.current.currentTime = (pct / 100) * videoRef.current.duration;
    setProgress(pct);
  };

  const toggleFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return \`\${m}:\${sec.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="group relative overflow-hidden rounded-md bg-black" data-testid="video-player">
      <video ref={videoRef} src={src} poster={poster} autoPlay={autoPlay} muted={muted} onTimeUpdate={handleTimeUpdate} onEnded={() => { setPlaying(false); onEnded?.(); }} className="w-full" data-testid="video-element" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="mb-2 w-full accent-white" data-testid="input-video-progress" />
        <div className="flex items-center gap-2 text-white">
          <button onClick={togglePlay} data-testid="button-play-pause">{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
          <span className="text-xs">{videoRef.current ? formatTime(videoRef.current.currentTime) : '0:00'} / {videoRef.current ? formatTime(videoRef.current.duration || 0) : '0:00'}</span>
          <div className="flex-1" />
          <button onClick={() => setMuted(!muted)} data-testid="button-mute">{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>
          <button onClick={toggleFullscreen} data-testid="button-fullscreen"><Maximize className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}`,
    variants: ['default', 'minimal', 'theater'],
    responsive: true,
    accessibility: ['keyboard Space to play/pause', 'aria-label on controls', 'captions support'],
    stateManagement: 'useState for playing, progress, muted; useRef for video element',
    styling: 'tailwind',
  },
  {
    id: 'audio-player',
    name: 'Audio Player',
    category: 'Media',
    description: 'A compact audio player with playback controls, progress bar, and time display',
    keywords: ['audio', 'player', 'music', 'sound', 'podcast', 'playback'],
    props: [
      { name: 'src', type: 'string', required: true },
      { name: 'title', type: 'string', required: false },
      { name: 'artist', type: 'string', required: false },
      { name: 'coverImage', type: 'string', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  coverImage?: string;
}

export function AudioPlayer({ src, title, artist, coverImage }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause(); else audioRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return \`\${m}:\${sec.toString().padStart(2, '0')}\`;
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  return (
    <div className="flex items-center gap-4 rounded-md border bg-card p-4" data-testid="audio-player">
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setPlaying(false)} data-testid="audio-element" />
      {coverImage && <img src={coverImage} alt={title || 'Cover'} className="h-14 w-14 rounded-md object-cover" data-testid="img-cover" />}
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-medium" data-testid="text-audio-title">{title}</p>}
        {artist && <p className="text-xs text-muted-foreground" data-testid="text-audio-artist">{artist}</p>}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10">{formatTime(progress)}</span>
          <input type="range" min="0" max={duration || 0} value={progress} onChange={handleSeek} className="flex-1 accent-primary" data-testid="input-audio-progress" />
          <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => skip(-10)} className="p-1 rounded hover-elevate" data-testid="button-skip-back"><SkipBack className="h-4 w-4" /></button>
        <button onClick={togglePlay} className="p-2 rounded-full bg-primary text-primary-foreground" data-testid="button-audio-play">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
        <button onClick={() => skip(10)} className="p-1 rounded hover-elevate" data-testid="button-skip-forward"><SkipForward className="h-4 w-4" /></button>
      </div>
    </div>
  );
}`,
    variants: ['default', 'minimal', 'full'],
    responsive: true,
    accessibility: ['aria-label on controls', 'keyboard Space to play/pause', 'time announcements'],
    stateManagement: 'useState for playing, progress, duration; useRef for audio element',
    styling: 'tailwind',
  },
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'Media',
    description: 'An image/content carousel with navigation arrows, dots indicator, and auto-play',
    keywords: ['carousel', 'slider', 'slideshow', 'swipe', 'banner'],
    props: [
      { name: 'items', type: 'React.ReactNode[]', required: true },
      { name: 'autoPlay', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'interval', type: 'number', required: false, defaultValue: '5000' },
      { name: 'showDots', type: 'boolean', required: false, defaultValue: 'true' },
      { name: 'showArrows', type: 'boolean', required: false, defaultValue: 'true' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function Carousel({ items, autoPlay = false, interval = 5000, showDots = true, showArrows = true }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next]);

  return (
    <div className="relative w-full overflow-hidden rounded-md" data-testid="carousel">
      <div className="flex transition-transform duration-500" style={{ transform: \`translateX(-\${current * 100}%)\` }}>
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0" data-testid={\`carousel-slide-\${i}\`}>{item}</div>
        ))}
      </div>
      {showArrows && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover-elevate" data-testid="button-carousel-prev"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover-elevate" data-testid="button-carousel-next"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
      {showDots && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" data-testid="carousel-dots">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={\`h-2 w-2 rounded-full transition-colors \${i === current ? 'bg-primary' : 'bg-primary/30'}\`}
              aria-label={\`Go to slide \${i + 1}\`}
              data-testid={\`button-dot-\${i}\`}
            />
          ))}
        </div>
      )}
    </div>
  );
}`,
    variants: ['default', 'fade', 'cards', 'fullscreen'],
    responsive: true,
    accessibility: ['aria-label on navigation', 'aria-live for slide changes', 'keyboard arrow key support'],
    stateManagement: 'useState for current slide, useEffect for autoplay',
    styling: 'tailwind',
  },
  {
    id: 'chat-interface',
    name: 'Chat Interface',
    category: 'Chat & Social',
    description: 'A full chat interface with message list, input area, and typing indicator',
    keywords: ['chat', 'messaging', 'conversation', 'messages', 'realtime'],
    props: [
      { name: 'messages', type: '{ id: string; content: string; sender: string; timestamp: string; isOwn?: boolean }[]', required: true },
      { name: 'onSend', type: '(message: string) => void', required: true },
      { name: 'placeholder', type: 'string', required: false, defaultValue: "'Type a message...'" },
      { name: 'isTyping', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'typingUser', type: 'string', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn?: boolean;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  placeholder?: string;
  isTyping?: boolean;
  typingUser?: string;
}

export function ChatInterface({ messages, onSend, placeholder = 'Type a message...', isTyping = false, typingUser }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-full flex-col" data-testid="chat-interface">
      <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={\`flex \${msg.isOwn ? 'justify-end' : 'justify-start'}\`} data-testid={\`message-\${msg.id}\`}>
            <div className={\`max-w-[75%] rounded-md px-3 py-2 \${msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}\`}>
              {!msg.isOwn && <p className="text-xs font-medium mb-0.5">{msg.sender}</p>}
              <p className="text-sm whitespace-pre-wrap" data-testid={\`text-message-\${msg.id}\`}>{msg.content}</p>
              <p className={\`text-xs mt-1 \${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}\`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start" data-testid="typing-indicator">
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">{typingUser || 'Someone'} is typing...</p>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            data-testid="input-chat"
          />
          <button onClick={handleSend} disabled={!input.trim()} className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50" data-testid="button-send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}`,
    variants: ['default', 'bubbles', 'compact', 'threaded'],
    responsive: true,
    accessibility: ['aria-label on message input', 'aria-live for new messages', 'keyboard Enter to send'],
    stateManagement: 'useState for input, useRef for scroll',
    styling: 'tailwind',
  },
  {
    id: 'comment-thread',
    name: 'Comment Thread',
    category: 'Chat & Social',
    description: 'A threaded comment section with nested replies and actions',
    keywords: ['comment', 'thread', 'reply', 'discussion', 'nested'],
    props: [
      { name: 'comments', type: '{ id: string; author: string; content: string; timestamp: string; replies?: Comment[] }[]', required: true },
      { name: 'onReply', type: '(parentId: string, content: string) => void', required: false },
      { name: 'onLike', type: '(commentId: string) => void', required: false },
      { name: 'currentUser', type: 'string', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes?: number;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  onReply?: (parentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  currentUser?: string;
}

function CommentItem({ comment, depth, onReply, onLike }: { comment: Comment; depth: number; onReply?: (parentId: string, content: string) => void; onLike?: (commentId: string) => void }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setReplying(false);
    }
  };

  return (
    <div className={\`\${depth > 0 ? 'ml-6 border-l pl-4' : ''}\`} data-testid={\`comment-\${comment.id}\`}>
      <div className="py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">{comment.author.charAt(0)}</div>
          <span className="text-sm font-medium">{comment.author}</span>
          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
        </div>
        <p className="mt-1 text-sm" data-testid={\`text-comment-\${comment.id}\`}>{comment.content}</p>
        <div className="mt-2 flex items-center gap-3">
          {onLike && (
            <button onClick={() => onLike(comment.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" data-testid={\`button-like-\${comment.id}\`}>
              <ThumbsUp className="h-3.5 w-3.5" /> {comment.likes || 0}
            </button>
          )}
          {onReply && (
            <button onClick={() => setReplying(!replying)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" data-testid={\`button-reply-\${comment.id}\`}>
              <Reply className="h-3.5 w-3.5" /> Reply
            </button>
          )}
        </div>
        {replying && (
          <div className="mt-2 flex items-center gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm" data-testid={\`input-reply-\${comment.id}\`} />
            <button onClick={handleReply} className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground" data-testid={\`button-submit-reply-\${comment.id}\`}>Reply</button>
          </div>
        )}
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} onLike={onLike} />
      ))}
    </div>
  );
}

export function CommentThread({ comments, onReply, onLike }: CommentThreadProps) {
  return (
    <div className="divide-y" data-testid="comment-thread">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} depth={0} onReply={onReply} onLike={onLike} />
      ))}
    </div>
  );
}`,
    variants: ['default', 'flat', 'nested', 'compact'],
    responsive: true,
    accessibility: ['aria-label on action buttons', 'semantic article elements', 'keyboard navigation between comments'],
    stateManagement: 'useState for reply state per comment',
    styling: 'tailwind',
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    category: 'Chat & Social',
    description: 'A chronological feed of user activities and events with avatars and timestamps',
    keywords: ['activity', 'feed', 'stream', 'events', 'log', 'updates'],
    props: [
      { name: 'activities', type: '{ id: string; user: string; action: string; target?: string; timestamp: string; icon?: React.ReactNode }[]', required: true },
      { name: 'onLoadMore', type: '() => void', required: false },
      { name: 'hasMore', type: 'boolean', required: false, defaultValue: 'false' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ActivityFeed({ activities, onLoadMore, hasMore = false }: ActivityFeedProps) {
  return (
    <div className="space-y-0" data-testid="activity-feed">
      {activities.map(activity => (
        <div key={activity.id} className="flex gap-3 border-b py-3" data-testid={\`activity-\${activity.id}\`}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
            {activity.icon || <Activity className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span>{' '}
              <span className="text-muted-foreground">{activity.action}</span>{' '}
              {activity.target && <span className="font-medium">{activity.target}</span>}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={\`text-activity-time-\${activity.id}\`}>{activity.timestamp}</p>
          </div>
        </div>
      ))}
      {hasMore && onLoadMore && (
        <button onClick={onLoadMore} className="w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground" data-testid="button-load-more">
          Load more
        </button>
      )}
    </div>
  );
}`,
    variants: ['default', 'compact', 'grouped-by-day'],
    responsive: true,
    accessibility: ['semantic list markup', 'aria-label on activities', 'time element for timestamps'],
    stateManagement: 'stateless (controlled by parent)',
    styling: 'tailwind',
  },
  {
    id: 'user-profile-card',
    name: 'User Profile Card',
    category: 'Chat & Social',
    description: 'A user profile card with avatar, name, bio, and social stats',
    keywords: ['profile', 'user', 'card', 'avatar', 'bio', 'social'],
    props: [
      { name: 'name', type: 'string', required: true },
      { name: 'avatar', type: 'string', required: false },
      { name: 'bio', type: 'string', required: false },
      { name: 'stats', type: '{ label: string; value: string | number }[]', required: false },
      { name: 'onFollow', type: '() => void', required: false },
      { name: 'isFollowing', type: 'boolean', required: false, defaultValue: 'false' },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { UserPlus, UserCheck } from 'lucide-react';

interface UserProfileCardProps {
  name: string;
  avatar?: string;
  bio?: string;
  stats?: { label: string; value: string | number }[];
  onFollow?: () => void;
  isFollowing?: boolean;
}

export function UserProfileCard({ name, avatar, bio, stats, onFollow, isFollowing = false }: UserProfileCardProps) {
  return (
    <div className="rounded-md border bg-card p-6 text-center" data-testid="user-profile-card">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold" data-testid="avatar-profile">
        {avatar ? <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" /> : name.charAt(0).toUpperCase()}
      </div>
      <h3 className="text-lg font-semibold" data-testid="text-profile-name">{name}</h3>
      {bio && <p className="mt-1 text-sm text-muted-foreground" data-testid="text-profile-bio">{bio}</p>}
      {stats && stats.length > 0 && (
        <div className="mt-4 flex justify-center gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="text-center" data-testid={\`stat-\${stat.label}\`}>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
      {onFollow && (
        <button
          onClick={onFollow}
          className={\`mt-4 flex items-center gap-2 mx-auto rounded-md px-4 py-2 text-sm \${isFollowing ? 'border text-muted-foreground' : 'bg-primary text-primary-foreground'}\`}
          data-testid="button-follow"
        >
          {isFollowing ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
        </button>
      )}
    </div>
  );
}`,
    variants: ['default', 'horizontal', 'compact', 'detailed'],
    responsive: true,
    accessibility: ['alt text on avatar', 'aria-label on follow button', 'semantic heading for name'],
    stateManagement: 'controlled by parent via isFollowing',
    styling: 'tailwind',
  },
  {
    id: 'reaction-picker',
    name: 'Reaction Picker',
    category: 'Chat & Social',
    description: 'A reaction picker popover for adding reactions to messages or posts',
    keywords: ['reaction', 'picker', 'emoji', 'like', 'respond', 'sentiment'],
    props: [
      { name: 'reactions', type: '{ id: string; icon: React.ReactNode; label: string; count: number; active: boolean }[]', required: true },
      { name: 'onReact', type: '(reactionId: string) => void', required: true },
      { name: 'availableReactions', type: '{ id: string; icon: React.ReactNode; label: string }[]', required: false },
    ],
    dependencies: ['react', 'lucide-react'],
    codeTemplate: `import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Reaction {
  id: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
}

interface AvailableReaction {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface ReactionPickerProps {
  reactions: Reaction[];
  onReact: (reactionId: string) => void;
  availableReactions?: AvailableReaction[];
}

export function ReactionPicker({ reactions, onReact, availableReactions }: ReactionPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1" data-testid="reaction-picker">
      {reactions.map(reaction => (
        <button
          key={reaction.id}
          onClick={() => onReact(reaction.id)}
          className={\`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors \${reaction.active ? 'border-primary bg-primary/10 text-primary' : 'hover-elevate'}\`}
          title={reaction.label}
          data-testid={\`reaction-\${reaction.id}\`}
        >
          {reaction.icon}
          <span>{reaction.count}</span>
        </button>
      ))}
      {availableReactions && (
        <div className="relative">
          <button onClick={() => setPickerOpen(prev => !prev)} className="rounded-full border p-1 hover-elevate" aria-label="Add reaction" data-testid="button-add-reaction">
            <Plus className="h-3.5 w-3.5" />
          </button>
          {pickerOpen && (
            <div className="absolute bottom-full mb-1 left-0 flex gap-1 rounded-md border bg-popover p-1.5 shadow-md" data-testid="reaction-popover">
              {availableReactions.map(r => (
                <button
                  key={r.id}
                  onClick={() => { onReact(r.id); setPickerOpen(false); }}
                  className="rounded p-1.5 hover-elevate"
                  title={r.label}
                  data-testid={\`pick-reaction-\${r.id}\`}
                >
                  {r.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}`,
    variants: ['inline', 'popover', 'floating'],
    responsive: true,
    accessibility: ['aria-label on reaction buttons', 'title attributes for labels', 'keyboard navigation'],
    stateManagement: 'useState for picker open state',
    styling: 'tailwind',
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    category: 'Charts & Data Viz',
    description: 'A responsive bar chart for comparing values across categories',
    keywords: ['bar', 'chart', 'graph', 'comparison', 'data', 'visualization'],
    props: [
      { name: 'data', type: '{ label: string; value: number; color?: string }[]', required: true },
      { name: 'height', type: 'number', required: false, defaultValue: '300' },
      { name: 'showValues', type: 'boolean', required: false, defaultValue: 'true' },
      { name: 'orientation', type: "'vertical' | 'horizontal'", required: false, defaultValue: "'vertical'" },
    ],
    dependencies: ['react'],
    codeTemplate: `interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export function BarChart({ data, height = 300, showValues = true, orientation = 'vertical' }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-2" data-testid="bar-chart-horizontal">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2" data-testid={\`bar-\${i}\`}>
            <span className="w-20 truncate text-right text-xs text-muted-foreground">{item.label}</span>
            <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{ width: \`\${(item.value / maxValue) * 100}%\`, backgroundColor: item.color || 'hsl(var(--primary))' }}
              />
            </div>
            {showValues && <span className="w-12 text-xs text-muted-foreground">{item.value}</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height }} data-testid="bar-chart">
      <div className="flex flex-1 items-end gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1" data-testid={\`bar-\${i}\`}>
            {showValues && <span className="text-xs text-muted-foreground">{item.value}</span>}
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{ height: \`\${(item.value / maxValue) * 100}%\`, backgroundColor: item.color || 'hsl(var(--primary))' }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t pt-2">
        {data.map((item, i) => (
          <span key={i} className="flex-1 truncate text-center text-xs text-muted-foreground">{item.label}</span>
        ))}
      </div>
    </div>
  );
}`,
    variants: ['vertical', 'horizontal', 'stacked', 'grouped'],
    responsive: true,
    accessibility: ['aria-label for chart', 'role="img"', 'data table fallback for screen readers'],
    stateManagement: 'stateless',
    styling: 'tailwind',
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    category: 'Charts & Data Viz',
    description: 'A line chart for displaying trends over time with SVG rendering',
    keywords: ['line', 'chart', 'graph', 'trend', 'time-series', 'visualization'],
    props: [
      { name: 'data', type: '{ label: string; value: number }[]', required: true },
      { name: 'height', type: 'number', required: false, defaultValue: '300' },
      { name: 'color', type: 'string', required: false, defaultValue: "'hsl(var(--primary))'" },
      { name: 'showDots', type: 'boolean', required: false, defaultValue: 'true' },
      { name: 'showArea', type: 'boolean', required: false, defaultValue: 'false' },
    ],
    dependencies: ['react'],
    codeTemplate: `interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
}

export function LineChart({ data, height = 300, color = 'hsl(var(--primary))', showDots = true, showArea = false }: LineChartProps) {
  if (data.length === 0) return null;

  const padding = 40;
  const width = 600;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * chartWidth,
    y: padding + (1 - (d.value - minValue) / range) * chartHeight,
  }));

  const pathD = points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ');
  const areaD = pathD + \` L \${points[points.length - 1].x} \${padding + chartHeight} L \${points[0].x} \${padding + chartHeight} Z\`;

  return (
    <div className="w-full" data-testid="line-chart">
      <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full" style={{ height }}>
        {showArea && <path d={areaD} fill={color} opacity={0.1} />}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} data-testid={\`dot-\${i}\`}>
            <title>{\`\${data[i].label}: \${data[i].value}\`}</title>
          </circle>
        ))}
        {data.map((d, i) => (
          <text key={i} x={points[i].x} y={height - 5} textAnchor="middle" className="fill-muted-foreground text-[10px]">{d.label}</text>
        ))}
      </svg>
    </div>
  );
}`,
    variants: ['default', 'area', 'multi-line', 'curved'],
    responsive: true,
    accessibility: ['title elements on data points', 'aria-label on chart', 'data table alternative'],
    stateManagement: 'stateless',
    styling: 'tailwind + inline SVG',
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    category: 'Charts & Data Viz',
    description: 'A pie/donut chart for displaying proportional data with SVG rendering',
    keywords: ['pie', 'chart', 'donut', 'proportion', 'percentage', 'visualization'],
    props: [
      { name: 'data', type: '{ label: string; value: number; color: string }[]', required: true },
      { name: 'size', type: 'number', required: false, defaultValue: '200' },
      { name: 'donut', type: 'boolean', required: false, defaultValue: 'false' },
      { name: 'showLabels', type: 'boolean', required: false, defaultValue: 'true' },
    ],
    dependencies: ['react'],
    codeTemplate: `interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  donut?: boolean;
  showLabels?: boolean;
}

export function PieChart({ data, size = 200, donut = false, showLabels = true }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = donut ? radius * 0.6 : 0;

  let currentAngle = -Math.PI / 2;

  const slices = data.map(d => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const ix1 = cx + innerRadius * Math.cos(startAngle);
    const iy1 = cy + innerRadius * Math.sin(startAngle);
    const ix2 = cx + innerRadius * Math.cos(endAngle);
    const iy2 = cy + innerRadius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathData = donut
      ? \`M \${x1} \${y1} A \${radius} \${radius} 0 \${largeArc} 1 \${x2} \${y2} L \${ix2} \${iy2} A \${innerRadius} \${innerRadius} 0 \${largeArc} 0 \${ix1} \${iy1} Z\`
      : \`M \${cx} \${cy} L \${x1} \${y1} A \${radius} \${radius} 0 \${largeArc} 1 \${x2} \${y2} Z\`;

    return { ...d, pathData, percentage: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="flex items-center gap-4" data-testid="pie-chart">
      <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.pathData} fill={slice.color} className="transition-opacity hover:opacity-80" data-testid={\`slice-\${i}\`}>
            <title>{\`\${slice.label}: \${slice.percentage}%\`}</title>
          </path>
        ))}
      </svg>
      {showLabels && (
        <div className="space-y-1" data-testid="pie-legend">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: slice.color }} />
              <span className="text-muted-foreground">{slice.label}</span>
              <span className="font-medium">{slice.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`,
    variants: ['pie', 'donut', 'half-donut'],
    responsive: true,
    accessibility: ['title elements on slices', 'aria-label on chart', 'legend with color indicators'],
    stateManagement: 'stateless',
    styling: 'tailwind + inline SVG',
  },
  {
    id: 'area-chart',
    name: 'Area Chart',
    category: 'Charts & Data Viz',
    description: 'An area chart for visualizing data volume over time with filled regions',
    keywords: ['area', 'chart', 'graph', 'filled', 'volume', 'visualization'],
    props: [
      { name: 'data', type: '{ label: string; value: number }[]', required: true },
      { name: 'height', type: 'number', required: false, defaultValue: '300' },
      { name: 'color', type: 'string', required: false, defaultValue: "'hsl(var(--primary))'" },
      { name: 'gradient', type: 'boolean', required: false, defaultValue: 'true' },
    ],
    dependencies: ['react'],
    codeTemplate: `interface AreaChartData {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartData[];
  height?: number;
  color?: string;
  gradient?: boolean;
}

export function AreaChart({ data, height = 300, color = 'hsl(var(--primary))', gradient = true }: AreaChartProps) {
  if (data.length === 0) return null;

  const padding = 40;
  const width = 600;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * chartWidth,
    y: padding + (1 - (d.value - minValue) / range) * chartHeight,
  }));

  const lineD = points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ');
  const areaD = lineD + \` L \${points[points.length - 1].x} \${padding + chartHeight} L \${points[0].x} \${padding + chartHeight} Z\`;

  const gradientId = 'area-gradient-' + Math.random().toString(36).slice(2, 9);

  return (
    <div className="w-full" data-testid="area-chart">
      <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full" style={{ height }}>
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
        )}
        <path d={areaD} fill={gradient ? \`url(#\${gradientId})\` : color} opacity={gradient ? 1 : 0.1} />
        <path d={lineD} fill="none" stroke={color} strokeWidth={2} />
        {data.map((d, i) => (
          <text key={i} x={points[i].x} y={height - 5} textAnchor="middle" className="fill-muted-foreground text-[10px]">{d.label}</text>
        ))}
      </svg>
    </div>
  );
}`,
    variants: ['default', 'stacked', 'stepped'],
    responsive: true,
    accessibility: ['aria-label on chart', 'role="img"', 'data table alternative'],
    stateManagement: 'stateless',
    styling: 'tailwind + inline SVG',
  },
  {
    id: 'sparkline',
    name: 'Sparkline',
    category: 'Charts & Data Viz',
    description: 'A compact inline sparkline chart for showing trends in small spaces',
    keywords: ['sparkline', 'inline', 'chart', 'trend', 'mini', 'graph'],
    props: [
      { name: 'data', type: 'number[]', required: true },
      { name: 'width', type: 'number', required: false, defaultValue: '100' },
      { name: 'height', type: 'number', required: false, defaultValue: '32' },
      { name: 'color', type: 'string', required: false, defaultValue: "'hsl(var(--primary))'" },
      { name: 'showArea', type: 'boolean', required: false, defaultValue: 'false' },
    ],
    dependencies: ['react'],
    codeTemplate: `interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function Sparkline({ data, width = 100, height = 32, color = 'hsl(var(--primary))', showArea = false }: SparklineProps) {
  if (data.length < 2) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  const pad = 2;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - minValue) / range) * (height - pad * 2),
  }));

  const lineD = points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ');
  const areaD = lineD + \` L \${points[points.length - 1].x} \${height - pad} L \${points[0].x} \${height - pad} Z\`;

  return (
    <svg width={width} height={height} className="inline-block" data-testid="sparkline">
      {showArea && <path d={areaD} fill={color} opacity={0.1} />}
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}`,
    variants: ['line', 'area', 'bar'],
    responsive: false,
    accessibility: ['aria-label with trend description', 'title element for value summary'],
    stateManagement: 'stateless',
    styling: 'inline SVG',
  },
];
