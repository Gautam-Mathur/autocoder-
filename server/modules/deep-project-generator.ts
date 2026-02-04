/**
 * Deep Project Generator
 * 
 * Generates complex, multi-level projects with 100+ files
 * Capable of generating projects as complex as AutoCoder itself
 */

// ============================================
// PROJECT BLUEPRINTS
// ============================================

interface FileTemplate {
  path: string;
  content: string;
  type: 'source' | 'config' | 'test' | 'style' | 'doc';
  dependencies?: string[];
}

interface ComponentBlueprint {
  name: string;
  path: string;
  type: 'page' | 'component' | 'layout' | 'hook' | 'context' | 'util';
  children?: ComponentBlueprint[];
  props?: Record<string, string>;
  hooks?: string[];
  imports?: string[];
}

interface FeatureModule {
  name: string;
  description: string;
  components: ComponentBlueprint[];
  routes?: RouteDefinition[];
  hooks?: HookDefinition[];
  services?: ServiceDefinition[];
  stores?: StoreDefinition[];
}

interface RouteDefinition {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: string;
  middleware?: string[];
  validation?: string;
}

interface HookDefinition {
  name: string;
  type: 'query' | 'mutation' | 'state' | 'effect' | 'callback';
  dependencies?: string[];
}

interface ServiceDefinition {
  name: string;
  methods: { name: string; params: string[]; returns: string }[];
}

interface StoreDefinition {
  name: string;
  state: Record<string, string>;
  actions: string[];
}

interface ProjectBlueprint {
  id: string;
  name: string;
  description: string;
  type: 'fullstack' | 'frontend' | 'backend' | 'cli' | 'library' | 'monorepo';
  techStack: {
    frontend?: string;
    backend?: string;
    database?: string;
    styling?: string;
    testing?: string;
  };
  structure: {
    directories: string[];
    configFiles: string[];
    features: FeatureModule[];
  };
  estimatedFiles: number;
}

// ============================================
// BLUEPRINT DEFINITIONS
// ============================================

const BLUEPRINTS: Record<string, ProjectBlueprint> = {
  'fullstack-react-express': {
    id: 'fullstack-react-express',
    name: 'Full-Stack React + Express',
    description: 'Complete web application with React frontend and Express backend',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
      testing: 'vitest',
    },
    structure: {
      directories: [
        'client/src/components',
        'client/src/components/ui',
        'client/src/components/layout',
        'client/src/components/features',
        'client/src/pages',
        'client/src/hooks',
        'client/src/lib',
        'client/src/stores',
        'client/src/types',
        'client/src/assets',
        'server/src/routes',
        'server/src/controllers',
        'server/src/services',
        'server/src/middleware',
        'server/src/models',
        'server/src/utils',
        'server/src/validators',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
        'drizzle.config.ts',
        '.env.example',
        '.gitignore',
      ],
      features: [],
    },
    estimatedFiles: 80,
  },

  'saas-platform': {
    id: 'saas-platform',
    name: 'SaaS Platform',
    description: 'Complete SaaS with auth, billing, dashboard, and admin',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
      testing: 'vitest',
    },
    structure: {
      directories: [
        'client/src/components/ui',
        'client/src/components/layout',
        'client/src/components/auth',
        'client/src/components/dashboard',
        'client/src/components/billing',
        'client/src/components/settings',
        'client/src/components/admin',
        'client/src/pages',
        'client/src/hooks',
        'client/src/stores',
        'client/src/lib',
        'server/src/routes',
        'server/src/controllers',
        'server/src/services',
        'server/src/middleware',
        'server/src/models',
        'server/src/jobs',
        'server/src/utils',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
        'drizzle.config.ts',
      ],
      features: [],
    },
    estimatedFiles: 120,
  },

  'api-server': {
    id: 'api-server',
    name: 'REST API Server',
    description: 'Production-ready REST API with authentication and documentation',
    type: 'backend',
    techStack: {
      backend: 'express-typescript',
      database: 'postgresql',
      testing: 'vitest',
    },
    structure: {
      directories: [
        'src/routes',
        'src/controllers',
        'src/services',
        'src/middleware',
        'src/models',
        'src/validators',
        'src/utils',
        'src/config',
        'src/types',
        'tests/unit',
        'tests/integration',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'drizzle.config.ts',
        '.env.example',
      ],
      features: [],
    },
    estimatedFiles: 50,
  },

  'dashboard-app': {
    id: 'dashboard-app',
    name: 'Analytics Dashboard',
    description: 'Data visualization dashboard with charts and metrics',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
    },
    structure: {
      directories: [
        'client/src/components/ui',
        'client/src/components/charts',
        'client/src/components/widgets',
        'client/src/components/layout',
        'client/src/components/filters',
        'client/src/pages',
        'client/src/hooks',
        'client/src/lib',
        'server/src/routes',
        'server/src/services',
        'server/src/analytics',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
      ],
      features: [],
    },
    estimatedFiles: 70,
  },

  'ecommerce': {
    id: 'ecommerce',
    name: 'E-Commerce Platform',
    description: 'Full e-commerce with products, cart, checkout, and orders',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
    },
    structure: {
      directories: [
        'client/src/components/ui',
        'client/src/components/products',
        'client/src/components/cart',
        'client/src/components/checkout',
        'client/src/components/orders',
        'client/src/components/account',
        'client/src/components/layout',
        'client/src/pages',
        'client/src/hooks',
        'client/src/stores',
        'server/src/routes',
        'server/src/controllers',
        'server/src/services',
        'server/src/models',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
      ],
      features: [],
    },
    estimatedFiles: 100,
  },

  'ai-assistant': {
    id: 'ai-assistant',
    name: 'AI Chat Assistant',
    description: 'AI-powered chat application like AutoCoder',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
    },
    structure: {
      directories: [
        'client/src/components/ui',
        'client/src/components/chat',
        'client/src/components/preview',
        'client/src/components/code',
        'client/src/components/layout',
        'client/src/pages',
        'client/src/hooks',
        'client/src/lib',
        'server/src/routes',
        'server/src/services',
        'server/src/ai',
        'server/src/modules',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
      ],
      features: [],
    },
    estimatedFiles: 90,
  },

  'cli-tool': {
    id: 'cli-tool',
    name: 'CLI Application',
    description: 'Command-line tool with commands and configuration',
    type: 'cli',
    techStack: {
      backend: 'typescript',
      testing: 'vitest',
    },
    structure: {
      directories: [
        'src/commands',
        'src/utils',
        'src/config',
        'src/types',
        'tests',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
      ],
      features: [],
    },
    estimatedFiles: 25,
  },

  'monorepo': {
    id: 'monorepo',
    name: 'Monorepo Workspace',
    description: 'Multi-package monorepo with shared libraries',
    type: 'monorepo',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
    },
    structure: {
      directories: [
        'packages/client/src',
        'packages/server/src',
        'packages/shared/src',
        'packages/ui/src',
        'packages/utils/src',
      ],
      configFiles: [
        'package.json',
        'turbo.json',
        'pnpm-workspace.yaml',
      ],
      features: [],
    },
    estimatedFiles: 60,
  },

  'cms': {
    id: 'cms',
    name: 'Content Management System',
    description: 'CMS with content types, media, and publishing workflow',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
    },
    structure: {
      directories: [
        'client/src/components/ui',
        'client/src/components/editor',
        'client/src/components/media',
        'client/src/components/content',
        'client/src/components/layout',
        'client/src/pages',
        'server/src/routes',
        'server/src/services',
        'server/src/models',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
      ],
      features: [],
    },
    estimatedFiles: 75,
  },

  'social-platform': {
    id: 'social-platform',
    name: 'Social Media Platform',
    description: 'Social app with posts, comments, follows, and notifications',
    type: 'fullstack',
    techStack: {
      frontend: 'react-typescript',
      backend: 'express-typescript',
      database: 'postgresql',
      styling: 'tailwind',
    },
    structure: {
      directories: [
        'client/src/components/ui',
        'client/src/components/feed',
        'client/src/components/posts',
        'client/src/components/comments',
        'client/src/components/profile',
        'client/src/components/notifications',
        'client/src/components/layout',
        'client/src/pages',
        'client/src/hooks',
        'client/src/stores',
        'server/src/routes',
        'server/src/controllers',
        'server/src/services',
        'server/src/models',
        'server/src/realtime',
        'shared',
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
      ],
      features: [],
    },
    estimatedFiles: 110,
  },
};

// ============================================
// FEATURE MODULES
// ============================================

const FEATURE_MODULES: Record<string, FeatureModule> = {
  auth: {
    name: 'Authentication',
    description: 'Complete authentication flow',
    components: [
      {
        name: 'AuthProvider',
        path: 'client/src/components/auth/AuthProvider.tsx',
        type: 'context',
        children: [],
      },
      {
        name: 'LoginForm',
        path: 'client/src/components/auth/LoginForm.tsx',
        type: 'component',
        props: { onSuccess: '() => void' },
        hooks: ['useAuth', 'useForm'],
      },
      {
        name: 'RegisterForm',
        path: 'client/src/components/auth/RegisterForm.tsx',
        type: 'component',
        props: { onSuccess: '() => void' },
        hooks: ['useAuth', 'useForm'],
      },
      {
        name: 'ForgotPasswordForm',
        path: 'client/src/components/auth/ForgotPasswordForm.tsx',
        type: 'component',
        hooks: ['useForm'],
      },
      {
        name: 'ResetPasswordForm',
        path: 'client/src/components/auth/ResetPasswordForm.tsx',
        type: 'component',
        hooks: ['useForm'],
      },
      {
        name: 'ProtectedRoute',
        path: 'client/src/components/auth/ProtectedRoute.tsx',
        type: 'component',
        hooks: ['useAuth'],
      },
      {
        name: 'useAuth',
        path: 'client/src/hooks/useAuth.ts',
        type: 'hook',
      },
    ],
    routes: [
      { path: '/api/auth/login', method: 'POST', handler: 'login', validation: 'loginSchema' },
      { path: '/api/auth/register', method: 'POST', handler: 'register', validation: 'registerSchema' },
      { path: '/api/auth/logout', method: 'POST', handler: 'logout', middleware: ['requireAuth'] },
      { path: '/api/auth/me', method: 'GET', handler: 'getCurrentUser', middleware: ['requireAuth'] },
      { path: '/api/auth/forgot-password', method: 'POST', handler: 'forgotPassword' },
      { path: '/api/auth/reset-password', method: 'POST', handler: 'resetPassword' },
    ],
    services: [
      {
        name: 'AuthService',
        methods: [
          { name: 'login', params: ['email', 'password'], returns: 'Promise<User>' },
          { name: 'register', params: ['data'], returns: 'Promise<User>' },
          { name: 'validateToken', params: ['token'], returns: 'Promise<boolean>' },
          { name: 'hashPassword', params: ['password'], returns: 'Promise<string>' },
        ],
      },
    ],
    hooks: [
      { name: 'useAuth', type: 'state', dependencies: ['AuthContext'] },
      { name: 'useLogin', type: 'mutation', dependencies: ['useAuth'] },
      { name: 'useRegister', type: 'mutation', dependencies: ['useAuth'] },
      { name: 'useLogout', type: 'mutation', dependencies: ['useAuth'] },
    ],
  },

  dashboard: {
    name: 'Dashboard',
    description: 'Analytics dashboard with metrics and charts',
    components: [
      {
        name: 'DashboardLayout',
        path: 'client/src/components/dashboard/DashboardLayout.tsx',
        type: 'layout',
        children: [
          { name: 'Sidebar', path: 'client/src/components/dashboard/Sidebar.tsx', type: 'component' },
          { name: 'Header', path: 'client/src/components/dashboard/Header.tsx', type: 'component' },
        ],
      },
      {
        name: 'MetricCard',
        path: 'client/src/components/dashboard/MetricCard.tsx',
        type: 'component',
        props: { title: 'string', value: 'number', change: 'number' },
      },
      {
        name: 'ChartCard',
        path: 'client/src/components/dashboard/ChartCard.tsx',
        type: 'component',
        props: { title: 'string', data: 'ChartData[]' },
      },
      {
        name: 'ActivityFeed',
        path: 'client/src/components/dashboard/ActivityFeed.tsx',
        type: 'component',
      },
      {
        name: 'QuickActions',
        path: 'client/src/components/dashboard/QuickActions.tsx',
        type: 'component',
      },
    ],
    routes: [
      { path: '/api/dashboard/metrics', method: 'GET', handler: 'getMetrics', middleware: ['requireAuth'] },
      { path: '/api/dashboard/charts', method: 'GET', handler: 'getChartData', middleware: ['requireAuth'] },
      { path: '/api/dashboard/activity', method: 'GET', handler: 'getActivity', middleware: ['requireAuth'] },
    ],
    hooks: [
      { name: 'useDashboardMetrics', type: 'query' },
      { name: 'useDashboardCharts', type: 'query' },
      { name: 'useActivityFeed', type: 'query' },
    ],
  },

  crud: {
    name: 'CRUD Operations',
    description: 'Generic CRUD module template',
    components: [
      {
        name: 'EntityList',
        path: 'client/src/components/{entity}/EntityList.tsx',
        type: 'component',
        hooks: ['useEntities'],
      },
      {
        name: 'EntityCard',
        path: 'client/src/components/{entity}/EntityCard.tsx',
        type: 'component',
      },
      {
        name: 'EntityForm',
        path: 'client/src/components/{entity}/EntityForm.tsx',
        type: 'component',
        hooks: ['useForm'],
      },
      {
        name: 'EntityDetail',
        path: 'client/src/components/{entity}/EntityDetail.tsx',
        type: 'component',
        hooks: ['useEntity'],
      },
      {
        name: 'EntityFilters',
        path: 'client/src/components/{entity}/EntityFilters.tsx',
        type: 'component',
      },
    ],
    routes: [
      { path: '/api/{entity}', method: 'GET', handler: 'list' },
      { path: '/api/{entity}/:id', method: 'GET', handler: 'getById' },
      { path: '/api/{entity}', method: 'POST', handler: 'create', validation: 'createSchema' },
      { path: '/api/{entity}/:id', method: 'PUT', handler: 'update', validation: 'updateSchema' },
      { path: '/api/{entity}/:id', method: 'DELETE', handler: 'delete' },
    ],
    services: [
      {
        name: 'EntityService',
        methods: [
          { name: 'findAll', params: ['filters'], returns: 'Promise<Entity[]>' },
          { name: 'findById', params: ['id'], returns: 'Promise<Entity>' },
          { name: 'create', params: ['data'], returns: 'Promise<Entity>' },
          { name: 'update', params: ['id', 'data'], returns: 'Promise<Entity>' },
          { name: 'delete', params: ['id'], returns: 'Promise<void>' },
        ],
      },
    ],
    hooks: [
      { name: 'useEntities', type: 'query' },
      { name: 'useEntity', type: 'query' },
      { name: 'useCreateEntity', type: 'mutation' },
      { name: 'useUpdateEntity', type: 'mutation' },
      { name: 'useDeleteEntity', type: 'mutation' },
    ],
  },

  settings: {
    name: 'Settings',
    description: 'User and app settings',
    components: [
      {
        name: 'SettingsLayout',
        path: 'client/src/components/settings/SettingsLayout.tsx',
        type: 'layout',
        children: [
          { name: 'SettingsNav', path: 'client/src/components/settings/SettingsNav.tsx', type: 'component' },
        ],
      },
      {
        name: 'ProfileSettings',
        path: 'client/src/components/settings/ProfileSettings.tsx',
        type: 'component',
        hooks: ['useAuth', 'useForm'],
      },
      {
        name: 'SecuritySettings',
        path: 'client/src/components/settings/SecuritySettings.tsx',
        type: 'component',
        hooks: ['useForm'],
      },
      {
        name: 'NotificationSettings',
        path: 'client/src/components/settings/NotificationSettings.tsx',
        type: 'component',
      },
      {
        name: 'AppearanceSettings',
        path: 'client/src/components/settings/AppearanceSettings.tsx',
        type: 'component',
      },
    ],
    routes: [
      { path: '/api/settings/profile', method: 'GET', handler: 'getProfile', middleware: ['requireAuth'] },
      { path: '/api/settings/profile', method: 'PUT', handler: 'updateProfile', middleware: ['requireAuth'] },
      { path: '/api/settings/password', method: 'PUT', handler: 'changePassword', middleware: ['requireAuth'] },
      { path: '/api/settings/notifications', method: 'GET', handler: 'getNotificationSettings', middleware: ['requireAuth'] },
      { path: '/api/settings/notifications', method: 'PUT', handler: 'updateNotificationSettings', middleware: ['requireAuth'] },
    ],
  },

  notifications: {
    name: 'Notifications',
    description: 'In-app notification system',
    components: [
      {
        name: 'NotificationProvider',
        path: 'client/src/components/notifications/NotificationProvider.tsx',
        type: 'context',
      },
      {
        name: 'NotificationBell',
        path: 'client/src/components/notifications/NotificationBell.tsx',
        type: 'component',
        hooks: ['useNotifications'],
      },
      {
        name: 'NotificationDropdown',
        path: 'client/src/components/notifications/NotificationDropdown.tsx',
        type: 'component',
      },
      {
        name: 'NotificationItem',
        path: 'client/src/components/notifications/NotificationItem.tsx',
        type: 'component',
      },
      {
        name: 'NotificationList',
        path: 'client/src/components/notifications/NotificationList.tsx',
        type: 'component',
      },
    ],
    routes: [
      { path: '/api/notifications', method: 'GET', handler: 'getNotifications', middleware: ['requireAuth'] },
      { path: '/api/notifications/:id/read', method: 'POST', handler: 'markAsRead', middleware: ['requireAuth'] },
      { path: '/api/notifications/read-all', method: 'POST', handler: 'markAllAsRead', middleware: ['requireAuth'] },
    ],
    hooks: [
      { name: 'useNotifications', type: 'query' },
      { name: 'useMarkNotificationRead', type: 'mutation' },
    ],
  },
};

// ============================================
// COMPONENT TEMPLATES
// ============================================

function generateReactComponent(blueprint: ComponentBlueprint, options: GenerationOptions): string {
  const imports: string[] = [];
  const hookCalls: string[] = [];
  
  if (blueprint.hooks?.includes('useState')) imports.push("import { useState } from 'react';");
  if (blueprint.hooks?.includes('useEffect')) imports.push("import { useEffect } from 'react';");
  if (blueprint.hooks?.includes('useForm')) imports.push("import { useForm } from 'react-hook-form';");
  if (blueprint.hooks?.includes('useAuth')) imports.push("import { useAuth } from '@/hooks/useAuth';");
  
  if (blueprint.children?.length) {
    for (const child of blueprint.children) {
      const childName = child.name;
      const childPath = child.path.replace('client/src/', '@/').replace('.tsx', '');
      imports.push(`import { ${childName} } from '${childPath}';`);
    }
  }
  
  const propsInterface = blueprint.props 
    ? `interface ${blueprint.name}Props {\n${Object.entries(blueprint.props).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n\n`
    : '';
  
  const propsArg = blueprint.props ? `props: ${blueprint.name}Props` : '';

  return `${imports.join('\n')}

${propsInterface}export function ${blueprint.name}(${propsArg}) {
  ${hookCalls.join('\n  ')}

  return (
    <div className="${blueprint.name.toLowerCase()}">
      <h2>${blueprint.name}</h2>
      ${blueprint.children?.map(c => `<${c.name} />`).join('\n      ') || ''}
    </div>
  );
}
`;
}

function generateHook(hook: HookDefinition): string {
  switch (hook.type) {
    case 'query':
      return `import { useQuery } from '@tanstack/react-query';

export function ${hook.name}(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['${hook.name.replace('use', '').toLowerCase()}'],
    queryFn: async () => {
      const res = await fetch('/api/${hook.name.replace('use', '').toLowerCase()}');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    ...options,
  });
}
`;
    case 'mutation':
      return `import { useMutation, useQueryClient } from '@tanstack/react-query';

export function ${hook.name}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch('/api/${hook.name.replace('use', '').replace('Create', '').replace('Update', '').replace('Delete', '').toLowerCase()}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
`;
    case 'state':
      return `import { useState, useCallback } from 'react';

export function ${hook.name}(initialValue?: unknown) {
  const [state, setState] = useState(initialValue);
  
  const update = useCallback((value: unknown) => {
    setState(value);
  }, []);
  
  const reset = useCallback(() => {
    setState(initialValue);
  }, [initialValue]);
  
  return { state, update, reset };
}
`;
    default:
      return `export function ${hook.name}() {
  // Hook implementation
  return {};
}
`;
  }
}

function generateService(service: ServiceDefinition): string {
  const methods = service.methods.map(m => {
    return `  async ${m.name}(${m.params.join(', ')}): ${m.returns} {
    // Implementation
    throw new Error('Not implemented');
  }`;
  }).join('\n\n');

  return `export class ${service.name} {
${methods}
}

export const ${service.name.charAt(0).toLowerCase() + service.name.slice(1)} = new ${service.name}();
`;
}

function generateRoute(routes: RouteDefinition[], controllerName: string): string {
  const routeHandlers = routes.map(r => {
    const middlewareStr = r.middleware?.length 
      ? `, ${r.middleware.join(', ')}` 
      : '';
    return `router.${r.method.toLowerCase()}('${r.path}'${middlewareStr}, ${controllerName}.${r.handler});`;
  }).join('\n');

  return `import { Router } from 'express';
import { ${controllerName} } from '../controllers/${controllerName}';

const router = Router();

${routeHandlers}

export default router;
`;
}

function generateController(routes: RouteDefinition[], name: string): string {
  const handlers = routes.map(r => {
    return `  async ${r.handler}(req: Request, res: Response) {
    try {
      // Implementation
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }`;
  }).join('\n\n');

  return `import { Request, Response } from 'express';

class ${name}Controller {
${handlers}
}

export const ${name.charAt(0).toLowerCase() + name.slice(1)}Controller = new ${name}Controller();
`;
}

// ============================================
// DEEP PROJECT GENERATOR
// ============================================

interface GenerationOptions {
  blueprint: string;
  name: string;
  features: string[];
  includeTests?: boolean;
  includeDocker?: boolean;
  includeDocs?: boolean;
}

interface GeneratedProject {
  name: string;
  blueprint: ProjectBlueprint;
  files: FileTemplate[];
  totalFiles: number;
  structure: string;
  features: string[];
}

export function generateDeepProject(options: GenerationOptions): GeneratedProject {
  const blueprint = BLUEPRINTS[options.blueprint] || BLUEPRINTS['fullstack-react-express'];
  const files: FileTemplate[] = [];
  
  // Generate config files
  files.push(...generateConfigFiles(blueprint, options));
  
  // Generate directory structure files
  for (const dir of blueprint.structure.directories) {
    files.push({
      path: `${dir}/.gitkeep`,
      content: '',
      type: 'config',
    });
  }
  
  // Generate base layout components
  files.push(...generateLayoutComponents(blueprint, options));
  
  // Generate UI component library
  files.push(...generateUIComponents(options));
  
  // Generate feature modules
  for (const featureName of options.features) {
    const feature = FEATURE_MODULES[featureName];
    if (feature) {
      files.push(...generateFeatureModule(feature, options));
    }
  }
  
  // Generate shared types
  files.push(...generateSharedTypes(blueprint, options));
  
  // Generate pages
  files.push(...generatePages(blueprint, options));
  
  // Generate tests if requested
  if (options.includeTests) {
    files.push(...generateTests(files, options));
  }
  
  // Generate docs if requested
  if (options.includeDocs) {
    files.push(...generateDocs(blueprint, options));
  }

  const structure = formatProjectStructure(files);

  return {
    name: options.name,
    blueprint,
    files,
    totalFiles: files.length,
    structure,
    features: options.features,
  };
}

function generateConfigFiles(blueprint: ProjectBlueprint, options: GenerationOptions): FileTemplate[] {
  const files: FileTemplate[] = [];
  
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: options.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        test: 'vitest',
        lint: 'eslint . --ext .ts,.tsx',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        '@tanstack/react-query': '^5.0.0',
        'react-hook-form': '^7.48.0',
        wouter: '^3.0.0',
        'lucide-react': '^0.300.0',
        'tailwindcss': '^3.4.0',
        ...(blueprint.techStack.database === 'postgresql' && { 'drizzle-orm': '^0.29.0' }),
      },
      devDependencies: {
        typescript: '^5.3.0',
        vite: '^5.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        vitest: '^1.0.0',
      },
    }, null, 2),
    type: 'config',
  });

  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        jsx: 'react-jsx',
        paths: { '@/*': ['./client/src/*'] },
      },
      include: ['client/src/**/*', 'server/**/*', 'shared/**/*'],
    }, null, 2),
    type: 'config',
  });

  files.push({
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
`,
    type: 'config',
  });

  files.push({
    path: 'tailwind.config.ts',
    content: `import type { Config } from 'tailwindcss';

export default {
  content: ['./client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
`,
    type: 'config',
  });

  files.push({
    path: '.env.example',
    content: `DATABASE_URL=postgresql://user:password@localhost:5432/db
SESSION_SECRET=your-secret-key
`,
    type: 'config',
  });

  files.push({
    path: '.gitignore',
    content: `node_modules/
dist/
.env
*.log
`,
    type: 'config',
  });

  return files;
}

function generateLayoutComponents(blueprint: ProjectBlueprint, options: GenerationOptions): FileTemplate[] {
  const files: FileTemplate[] = [];

  files.push({
    path: 'client/src/components/layout/Layout.tsx',
    content: `import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
`,
    type: 'source',
  });

  files.push({
    path: 'client/src/components/layout/Header.tsx',
    content: `import { Link } from 'wouter';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6">
      <Link href="/">
        <span className="text-xl font-bold">${options.name}</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Button variant="ghost">Login</Button>
        <Button>Get Started</Button>
      </nav>
    </header>
  );
}
`,
    type: 'source',
  });

  files.push({
    path: 'client/src/components/layout/Sidebar.tsx',
    content: `import { Link, useLocation } from 'wouter';
import { Home, Settings, Users, BarChart } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r p-4">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={\`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 \${location === item.href ? 'bg-gray-100' : ''}\`}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
`,
    type: 'source',
  });

  files.push({
    path: 'client/src/components/layout/Footer.tsx',
    content: `export function Footer() {
  return (
    <footer className="h-16 border-t flex items-center justify-center text-gray-500">
      <p>&copy; ${new Date().getFullYear()} ${options.name}. All rights reserved.</p>
    </footer>
  );
}
`,
    type: 'source',
  });

  files.push({
    path: 'client/src/components/layout/index.ts',
    content: `export { Layout } from './Layout';
export { Header } from './Header';
export { Sidebar } from './Sidebar';
export { Footer } from './Footer';
`,
    type: 'source',
  });

  return files;
}

function generateUIComponents(options: GenerationOptions): FileTemplate[] {
  const files: FileTemplate[] = [];

  const uiComponents = [
    { name: 'Button', props: 'variant?: "default" | "ghost" | "outline"; size?: "sm" | "md" | "lg"; children: ReactNode' },
    { name: 'Card', props: 'children: ReactNode; className?: string' },
    { name: 'Input', props: 'type?: string; placeholder?: string; value?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void' },
    { name: 'Label', props: 'children: ReactNode; htmlFor?: string' },
    { name: 'Select', props: 'options: { value: string; label: string }[]; value?: string; onChange?: (value: string) => void' },
    { name: 'Checkbox', props: 'checked?: boolean; onChange?: (checked: boolean) => void; label?: string' },
    { name: 'Modal', props: 'isOpen: boolean; onClose: () => void; title?: string; children: ReactNode' },
    { name: 'Dropdown', props: 'trigger: ReactNode; items: { label: string; onClick: () => void }[]' },
    { name: 'Avatar', props: 'src?: string; alt?: string; fallback?: string; size?: "sm" | "md" | "lg"' },
    { name: 'Badge', props: 'variant?: "default" | "success" | "warning" | "error"; children: ReactNode' },
    { name: 'Tabs', props: 'tabs: { id: string; label: string; content: ReactNode }[]' },
    { name: 'Table', props: 'columns: Column[]; data: Record<string, unknown>[]' },
    { name: 'Pagination', props: 'page: number; totalPages: number; onPageChange: (page: number) => void' },
    { name: 'Spinner', props: 'size?: "sm" | "md" | "lg"' },
    { name: 'Toast', props: 'message: string; type?: "success" | "error" | "warning" | "info"' },
    { name: 'Tooltip', props: 'content: string; children: ReactNode' },
    { name: 'Skeleton', props: 'width?: string; height?: string' },
    { name: 'Alert', props: 'type?: "success" | "error" | "warning" | "info"; title?: string; children: ReactNode' },
    { name: 'Progress', props: 'value: number; max?: number' },
    { name: 'Switch', props: 'checked?: boolean; onChange?: (checked: boolean) => void' },
  ];

  for (const comp of uiComponents) {
    files.push({
      path: `client/src/components/ui/${comp.name}.tsx`,
      content: `import { ReactNode, ChangeEvent } from 'react';

interface ${comp.name}Props {
  ${comp.props.split('; ').join(';\n  ')}
}

export function ${comp.name}(props: ${comp.name}Props) {
  return (
    <div className="${comp.name.toLowerCase()}" data-testid="${comp.name.toLowerCase()}">
      {/* ${comp.name} implementation */}
    </div>
  );
}
`,
      type: 'source',
    });
  }

  files.push({
    path: 'client/src/components/ui/index.ts',
    content: uiComponents.map(c => `export { ${c.name} } from './${c.name}';`).join('\n'),
    type: 'source',
  });

  return files;
}

function generateFeatureModule(feature: FeatureModule, options: GenerationOptions): FileTemplate[] {
  const files: FileTemplate[] = [];

  // Generate components
  for (const comp of feature.components) {
    files.push({
      path: comp.path,
      content: generateReactComponent(comp, options),
      type: 'source',
    });
  }

  // Generate hooks
  if (feature.hooks) {
    for (const hook of feature.hooks) {
      files.push({
        path: `client/src/hooks/${hook.name}.ts`,
        content: generateHook(hook),
        type: 'source',
      });
    }
  }

  // Generate services
  if (feature.services) {
    for (const service of feature.services) {
      files.push({
        path: `server/src/services/${service.name}.ts`,
        content: generateService(service),
        type: 'source',
      });
    }
  }

  // Generate routes
  if (feature.routes) {
    const routeName = feature.name.toLowerCase().replace(/\s+/g, '-');
    files.push({
      path: `server/src/routes/${routeName}.ts`,
      content: generateRoute(feature.routes, `${feature.name}Controller`),
      type: 'source',
    });

    files.push({
      path: `server/src/controllers/${feature.name}Controller.ts`,
      content: generateController(feature.routes, feature.name),
      type: 'source',
    });
  }

  return files;
}

function generateSharedTypes(blueprint: ProjectBlueprint, options: GenerationOptions): FileTemplate[] {
  const files: FileTemplate[] = [];

  files.push({
    path: 'shared/types.ts',
    content: `export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
`,
    type: 'source',
  });

  if (blueprint.techStack.database === 'postgresql') {
    files.push({
      path: 'shared/schema.ts',
      content: `import { pgTable, text, varchar, serial, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql\`gen_random_uuid()\`),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').default(sql\`CURRENT_TIMESTAMP\`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
`,
      type: 'source',
    });
  }

  return files;
}

function generatePages(blueprint: ProjectBlueprint, options: GenerationOptions): FileTemplate[] {
  const files: FileTemplate[] = [];
  
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Settings', path: '/settings' },
    { name: 'NotFound', path: '*' },
  ];

  for (const page of pages) {
    files.push({
      path: `client/src/pages/${page.name}.tsx`,
      content: `import { Layout } from '@/components/layout';

export function ${page.name}Page() {
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">${page.name}</h1>
        {/* Page content */}
      </div>
    </Layout>
  );
}
`,
      type: 'source',
    });
  }

  files.push({
    path: 'client/src/App.tsx',
    content: `import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { HomePage } from './pages/Home';
import { DashboardPage } from './pages/Dashboard';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { SettingsPage } from './pages/Settings';
import { NotFoundPage } from './pages/NotFound';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </QueryClientProvider>
  );
}
`,
    type: 'source',
  });

  files.push({
    path: 'client/src/main.tsx',
    content: `import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
`,
    type: 'source',
  });

  files.push({
    path: 'client/src/index.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    type: 'style',
  });

  return files;
}

function generateTests(files: FileTemplate[], options: GenerationOptions): FileTemplate[] {
  const tests: FileTemplate[] = [];
  
  const sourceFiles = files.filter(f => f.type === 'source' && f.path.endsWith('.tsx'));
  
  for (const file of sourceFiles.slice(0, 20)) { // Generate tests for first 20 components
    const componentName = file.path.split('/').pop()?.replace('.tsx', '');
    if (!componentName) continue;
    
    tests.push({
      path: file.path.replace('.tsx', '.test.tsx'),
      content: `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });

  it('matches snapshot', () => {
    const { container } = render(<${componentName} />);
    expect(container).toMatchSnapshot();
  });
});
`,
      type: 'test',
    });
  }

  return tests;
}

function generateDocs(blueprint: ProjectBlueprint, options: GenerationOptions): FileTemplate[] {
  return [
    {
      path: 'README.md',
      content: `# ${options.name}

${blueprint.description}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack

${Object.entries(blueprint.techStack)
  .filter(([_, v]) => v)
  .map(([k, v]) => `- **${k}**: ${v}`)
  .join('\n')}

## Features

${options.features.map(f => `- ${FEATURE_MODULES[f]?.name || f}`).join('\n')}

## Project Structure

\`\`\`
${formatProjectStructure([])}
\`\`\`
`,
      type: 'doc',
    },
  ];
}

function formatProjectStructure(files: FileTemplate[]): string {
  const tree: Record<string, any> = {};
  
  for (const file of files) {
    const parts = file.path.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = null;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }
  
  function renderTree(obj: Record<string, any>, prefix: string = ''): string {
    const entries = Object.entries(obj);
    return entries.map(([key, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? '    ' : '│   ';
      
      if (value === null) {
        return `${prefix}${connector}${key}`;
      } else {
        return `${prefix}${connector}${key}/\n${renderTree(value, prefix + childPrefix)}`;
      }
    }).join('\n');
  }
  
  return renderTree(tree);
}

// ============================================
// EXPORTS
// ============================================

export function listBlueprints(): { id: string; name: string; description: string; estimatedFiles: number }[] {
  return Object.values(BLUEPRINTS).map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    estimatedFiles: b.estimatedFiles,
  }));
}

export function listFeatures(): { id: string; name: string; description: string }[] {
  return Object.entries(FEATURE_MODULES).map(([id, f]) => ({
    id,
    name: f.name,
    description: f.description,
  }));
}

export function getBlueprint(id: string): ProjectBlueprint | undefined {
  return BLUEPRINTS[id];
}

export function getFeature(id: string): FeatureModule | undefined {
  return FEATURE_MODULES[id];
}

export { BLUEPRINTS, FEATURE_MODULES };
export type { ProjectBlueprint, FeatureModule, GenerationOptions, GeneratedProject, FileTemplate };
