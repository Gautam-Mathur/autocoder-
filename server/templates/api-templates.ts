export interface ApiTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  pathPattern: string;
  requestSchema: { field: string; type: string; required: boolean; validation?: string }[];
  responseSchema: { field: string; type: string }[];
  middleware: string[];
  queryParams?: { name: string; type: string; description: string }[];
  headers?: Record<string, string>;
  errorResponses: { status: number; message: string }[];
  codeTemplate: string;
  rateLimiting?: { requests: number; windowMs: number };
}

export const apiTemplates: ApiTemplate[] = [
  {
    id: 'list-with-pagination',
    name: 'List Resources with Pagination',
    category: 'crud',
    description: 'Paginated listing of resources with sorting and optional filtering',
    keywords: ['list', 'pagination', 'paginate', 'page', 'offset', 'limit', 'sort', 'collection'],
    method: 'GET',
    pathPattern: '/api/:resource',
    requestSchema: [],
    responseSchema: [
      { field: 'data', type: 'array' },
      { field: 'total', type: 'number' },
      { field: 'page', type: 'number' },
      { field: 'pageSize', type: 'number' },
      { field: 'totalPages', type: 'number' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    queryParams: [
      { name: 'page', type: 'number', description: 'Page number starting from 1' },
      { name: 'pageSize', type: 'number', description: 'Number of items per page' },
      { name: 'sortBy', type: 'string', description: 'Field name to sort by' },
      { name: 'sortOrder', type: 'string', description: 'Sort direction: asc or desc' },
    ],
    errorResponses: [
      { status: 400, message: 'Invalid pagination parameters' },
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/:resource', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
  const offset = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    storage.findMany(req.params.resource, { offset, limit: pageSize, orderBy: { [sortBy]: sortOrder } }),
    storage.count(req.params.resource),
  ]);
  res.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});`,
    rateLimiting: { requests: 100, windowMs: 60000 },
  },
  {
    id: 'get-by-id',
    name: 'Get Resource by ID',
    category: 'crud',
    description: 'Retrieve a single resource by its unique identifier',
    keywords: ['get', 'find', 'fetch', 'read', 'single', 'detail', 'by-id'],
    method: 'GET',
    pathPattern: '/api/:resource/:id',
    requestSchema: [],
    responseSchema: [
      { field: 'id', type: 'number' },
      { field: 'createdAt', type: 'string' },
      { field: 'updatedAt', type: 'string' },
    ],
    middleware: ['authenticate'],
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'Resource not found' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/:resource/:id', authenticate, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });
  const item = await storage.findById(req.params.resource, id);
  if (!item) return res.status(404).json({ error: 'Resource not found' });
  res.json(item);
});`,
  },
  {
    id: 'create-resource',
    name: 'Create Resource',
    category: 'crud',
    description: 'Create a new resource with validation',
    keywords: ['create', 'add', 'new', 'insert', 'post'],
    method: 'POST',
    pathPattern: '/api/:resource',
    requestSchema: [
      { field: 'name', type: 'string', required: true, validation: 'min:1,max:255' },
      { field: 'description', type: 'string', required: false, validation: 'max:1000' },
    ],
    responseSchema: [
      { field: 'id', type: 'number' },
      { field: 'name', type: 'string' },
      { field: 'createdAt', type: 'string' },
    ],
    middleware: ['authenticate', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Validation failed' },
      { status: 401, message: 'Authentication required' },
      { status: 409, message: 'Resource already exists' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/:resource', authenticate, async (req: Request, res: Response) => {
  const parsed = insertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  const existing = await storage.findByField(req.params.resource, 'name', parsed.data.name);
  if (existing) return res.status(409).json({ error: 'Resource already exists' });
  const created = await storage.create(req.params.resource, parsed.data);
  res.status(201).json(created);
});`,
  },
  {
    id: 'update-resource',
    name: 'Update Resource (Full)',
    category: 'crud',
    description: 'Full replacement update of an existing resource',
    keywords: ['update', 'replace', 'put', 'modify', 'edit', 'full-update'],
    method: 'PUT',
    pathPattern: '/api/:resource/:id',
    requestSchema: [
      { field: 'name', type: 'string', required: true, validation: 'min:1,max:255' },
      { field: 'description', type: 'string', required: true, validation: 'max:1000' },
    ],
    responseSchema: [
      { field: 'id', type: 'number' },
      { field: 'name', type: 'string' },
      { field: 'updatedAt', type: 'string' },
    ],
    middleware: ['authenticate', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Validation failed' },
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'Resource not found' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.put('/api/:resource/:id', authenticate, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });
  const existing = await storage.findById(req.params.resource, id);
  if (!existing) return res.status(404).json({ error: 'Resource not found' });
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  const updated = await storage.update(req.params.resource, id, parsed.data);
  res.json(updated);
});`,
  },
  {
    id: 'partial-update',
    name: 'Partial Update Resource',
    category: 'crud',
    description: 'Partial update of specific fields on a resource',
    keywords: ['patch', 'partial', 'partial-update', 'merge', 'modify'],
    method: 'PATCH',
    pathPattern: '/api/:resource/:id',
    requestSchema: [
      { field: 'name', type: 'string', required: false, validation: 'min:1,max:255' },
      { field: 'description', type: 'string', required: false, validation: 'max:1000' },
      { field: 'status', type: 'string', required: false, validation: 'enum:active,inactive,archived' },
    ],
    responseSchema: [
      { field: 'id', type: 'number' },
      { field: 'updatedAt', type: 'string' },
    ],
    middleware: ['authenticate', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Validation failed' },
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'Resource not found' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.patch('/api/:resource/:id', authenticate, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });
  const existing = await storage.findById(req.params.resource, id);
  if (!existing) return res.status(404).json({ error: 'Resource not found' });
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  const updated = await storage.update(req.params.resource, id, { ...parsed.data, updatedAt: new Date().toISOString() });
  res.json(updated);
});`,
  },
  {
    id: 'delete-resource',
    name: 'Delete Resource',
    category: 'crud',
    description: 'Soft or hard delete of a resource by ID',
    keywords: ['delete', 'remove', 'destroy', 'archive'],
    method: 'DELETE',
    pathPattern: '/api/:resource/:id',
    requestSchema: [],
    responseSchema: [
      { field: 'success', type: 'boolean' },
      { field: 'message', type: 'string' },
    ],
    middleware: ['authenticate', 'authorize'],
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 403, message: 'Insufficient permissions' },
      { status: 404, message: 'Resource not found' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.delete('/api/:resource/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });
  const existing = await storage.findById(req.params.resource, id);
  if (!existing) return res.status(404).json({ error: 'Resource not found' });
  await storage.delete(req.params.resource, id);
  res.json({ success: true, message: 'Resource deleted successfully' });
});`,
  },
  {
    id: 'full-text-search',
    name: 'Full-Text Search',
    category: 'search',
    description: 'Search resources using full-text search with relevance scoring',
    keywords: ['search', 'full-text', 'query', 'find', 'lookup', 'fts'],
    method: 'GET',
    pathPattern: '/api/:resource/search',
    requestSchema: [],
    responseSchema: [
      { field: 'results', type: 'array' },
      { field: 'total', type: 'number' },
      { field: 'query', type: 'string' },
      { field: 'took', type: 'number' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    queryParams: [
      { name: 'q', type: 'string', description: 'Search query string' },
      { name: 'fields', type: 'string', description: 'Comma-separated list of fields to search' },
      { name: 'page', type: 'number', description: 'Page number' },
      { name: 'pageSize', type: 'number', description: 'Results per page' },
    ],
    errorResponses: [
      { status: 400, message: 'Search query is required' },
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/:resource/search', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.trim().length === 0) return res.status(400).json({ error: 'Search query is required' });
  const fields = (req.query.fields as string)?.split(',') || ['name', 'description'];
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
  const start = Date.now();
  const results = await storage.search(req.params.resource, q, { fields, offset: (page - 1) * pageSize, limit: pageSize });
  const total = await storage.searchCount(req.params.resource, q, { fields });
  res.json({ results, total, query: q, took: Date.now() - start });
});`,
    rateLimiting: { requests: 60, windowMs: 60000 },
  },
  {
    id: 'advanced-filter',
    name: 'Advanced Filter',
    category: 'search',
    description: 'Filter resources with complex conditions, ranges, and logical operators',
    keywords: ['filter', 'advanced', 'where', 'condition', 'range', 'between'],
    method: 'POST',
    pathPattern: '/api/:resource/filter',
    requestSchema: [
      { field: 'filters', type: 'array', required: true, validation: 'minItems:1' },
      { field: 'filters[].field', type: 'string', required: true },
      { field: 'filters[].operator', type: 'string', required: true, validation: 'enum:eq,neq,gt,gte,lt,lte,in,nin,like,between' },
      { field: 'filters[].value', type: 'any', required: true },
      { field: 'logic', type: 'string', required: false, validation: 'enum:and,or' },
    ],
    responseSchema: [
      { field: 'data', type: 'array' },
      { field: 'total', type: 'number' },
      { field: 'appliedFilters', type: 'array' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    queryParams: [
      { name: 'page', type: 'number', description: 'Page number' },
      { name: 'pageSize', type: 'number', description: 'Results per page' },
    ],
    errorResponses: [
      { status: 400, message: 'Invalid filter configuration' },
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/:resource/filter', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const { filters, logic = 'and' } = req.body;
  if (!Array.isArray(filters) || filters.length === 0) return res.status(400).json({ error: 'At least one filter is required' });
  const allowedOps = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'like', 'between'];
  for (const f of filters) {
    if (!f.field || !allowedOps.includes(f.operator)) return res.status(400).json({ error: 'Invalid filter configuration' });
  }
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
  const data = await storage.filterMany(req.params.resource, filters, logic, { offset: (page - 1) * pageSize, limit: pageSize });
  const total = await storage.filterCount(req.params.resource, filters, logic);
  res.json({ data, total, appliedFilters: filters });
});`,
    rateLimiting: { requests: 60, windowMs: 60000 },
  },
  {
    id: 'autocomplete',
    name: 'Autocomplete / Typeahead',
    category: 'search',
    description: 'Fast prefix-based autocomplete suggestions for search inputs',
    keywords: ['autocomplete', 'typeahead', 'suggest', 'prefix', 'instant-search'],
    method: 'GET',
    pathPattern: '/api/:resource/autocomplete',
    requestSchema: [],
    responseSchema: [
      { field: 'suggestions', type: 'array' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    queryParams: [
      { name: 'q', type: 'string', description: 'Partial search text' },
      { name: 'field', type: 'string', description: 'Field to search in' },
      { name: 'limit', type: 'number', description: 'Max number of suggestions' },
    ],
    errorResponses: [
      { status: 400, message: 'Query parameter q is required' },
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/:resource/autocomplete', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.length < 1) return res.status(400).json({ error: 'Query parameter q is required' });
  const field = (req.query.field as string) || 'name';
  const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
  const suggestions = await storage.autocomplete(req.params.resource, field, q, limit);
  res.json({ suggestions });
});`,
    rateLimiting: { requests: 200, windowMs: 60000 },
  },
  {
    id: 'faceted-search',
    name: 'Faceted Search',
    category: 'search',
    description: 'Search with facet counts for filtering categories, tags, and ranges',
    keywords: ['facets', 'faceted', 'aggregation', 'counts', 'categories', 'filter-counts'],
    method: 'POST',
    pathPattern: '/api/:resource/faceted-search',
    requestSchema: [
      { field: 'query', type: 'string', required: false },
      { field: 'facets', type: 'array', required: true, validation: 'minItems:1' },
      { field: 'facets[].field', type: 'string', required: true },
      { field: 'facets[].type', type: 'string', required: true, validation: 'enum:terms,range,date_histogram' },
      { field: 'selectedFacets', type: 'object', required: false },
    ],
    responseSchema: [
      { field: 'results', type: 'array' },
      { field: 'facets', type: 'object' },
      { field: 'total', type: 'number' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    errorResponses: [
      { status: 400, message: 'At least one facet configuration is required' },
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/:resource/faceted-search', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const { query, facets, selectedFacets = {} } = req.body;
  if (!Array.isArray(facets) || facets.length === 0) return res.status(400).json({ error: 'At least one facet configuration is required' });
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
  const results = await storage.facetedSearch(req.params.resource, { query, facets, selectedFacets, offset: (page - 1) * pageSize, limit: pageSize });
  const facetCounts: Record<string, any> = {};
  for (const facet of facets) {
    facetCounts[facet.field] = await storage.getFacetCounts(req.params.resource, facet.field, facet.type, selectedFacets);
  }
  res.json({ results: results.data, facets: facetCounts, total: results.total });
});`,
    rateLimiting: { requests: 30, windowMs: 60000 },
  },
  {
    id: 'register',
    name: 'User Registration',
    category: 'auth',
    description: 'Register a new user account with email and password',
    keywords: ['register', 'signup', 'sign-up', 'create-account', 'onboard'],
    method: 'POST',
    pathPattern: '/api/auth/register',
    requestSchema: [
      { field: 'email', type: 'string', required: true, validation: 'email' },
      { field: 'password', type: 'string', required: true, validation: 'min:8,max:128' },
      { field: 'name', type: 'string', required: true, validation: 'min:1,max:100' },
    ],
    responseSchema: [
      { field: 'user', type: 'object' },
      { field: 'token', type: 'string' },
    ],
    middleware: ['rateLimiter', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Validation failed' },
      { status: 409, message: 'Email already registered' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/auth/register', rateLimiter, async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
  const existing = await storage.findUserByEmail(parsed.data.email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  const user = await storage.createUser({ email: parsed.data.email, name: parsed.data.name, password: hashedPassword });
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const { password, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token });
});`,
    rateLimiting: { requests: 10, windowMs: 900000 },
  },
  {
    id: 'login',
    name: 'User Login',
    category: 'auth',
    description: 'Authenticate user with email and password, return JWT tokens',
    keywords: ['login', 'signin', 'sign-in', 'authenticate', 'credentials'],
    method: 'POST',
    pathPattern: '/api/auth/login',
    requestSchema: [
      { field: 'email', type: 'string', required: true, validation: 'email' },
      { field: 'password', type: 'string', required: true, validation: 'min:1' },
    ],
    responseSchema: [
      { field: 'user', type: 'object' },
      { field: 'accessToken', type: 'string' },
      { field: 'refreshToken', type: 'string' },
      { field: 'expiresIn', type: 'number' },
    ],
    middleware: ['rateLimiter', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Email and password are required' },
      { status: 401, message: 'Invalid email or password' },
      { status: 429, message: 'Too many login attempts' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/auth/login', rateLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = await storage.findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
  await storage.saveRefreshToken(user.id, refreshToken);
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, accessToken, refreshToken, expiresIn: 900 });
});`,
    rateLimiting: { requests: 20, windowMs: 900000 },
  },
  {
    id: 'logout',
    name: 'User Logout',
    category: 'auth',
    description: 'Invalidate the current session or refresh token',
    keywords: ['logout', 'signout', 'sign-out', 'end-session', 'revoke'],
    method: 'POST',
    pathPattern: '/api/auth/logout',
    requestSchema: [
      { field: 'refreshToken', type: 'string', required: false },
    ],
    responseSchema: [
      { field: 'success', type: 'boolean' },
      { field: 'message', type: 'string' },
    ],
    middleware: ['authenticate'],
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/auth/logout', authenticate, async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await storage.revokeRefreshToken(refreshToken);
  }
  await storage.revokeAllTokens(req.user.id);
  res.json({ success: true, message: 'Logged out successfully' });
});`,
  },
  {
    id: 'refresh-token',
    name: 'Refresh Access Token',
    category: 'auth',
    description: 'Exchange a valid refresh token for a new access token',
    keywords: ['refresh', 'token', 'renew', 'rotate', 'access-token'],
    method: 'POST',
    pathPattern: '/api/auth/refresh',
    requestSchema: [
      { field: 'refreshToken', type: 'string', required: true },
    ],
    responseSchema: [
      { field: 'accessToken', type: 'string' },
      { field: 'refreshToken', type: 'string' },
      { field: 'expiresIn', type: 'number' },
    ],
    middleware: ['rateLimiter'],
    errorResponses: [
      { status: 400, message: 'Refresh token is required' },
      { status: 401, message: 'Invalid or expired refresh token' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/auth/refresh', rateLimiter, async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: number; type: string };
    if (payload.type !== 'refresh') return res.status(401).json({ error: 'Invalid token type' });
    const stored = await storage.findRefreshToken(refreshToken);
    if (!stored) return res.status(401).json({ error: 'Token has been revoked' });
    await storage.revokeRefreshToken(refreshToken);
    const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: payload.userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' });
    await storage.saveRefreshToken(payload.userId, newRefreshToken);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: 900 });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});`,
    rateLimiting: { requests: 30, windowMs: 900000 },
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    category: 'auth',
    description: 'Request a password reset email and handle token-based reset',
    keywords: ['password', 'reset', 'forgot', 'recover', 'change-password'],
    method: 'POST',
    pathPattern: '/api/auth/password-reset',
    requestSchema: [
      { field: 'email', type: 'string', required: true, validation: 'email' },
    ],
    responseSchema: [
      { field: 'success', type: 'boolean' },
      { field: 'message', type: 'string' },
    ],
    middleware: ['rateLimiter'],
    errorResponses: [
      { status: 400, message: 'Valid email is required' },
      { status: 429, message: 'Too many reset attempts' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/auth/password-reset', rateLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Valid email is required' });
  const user = await storage.findUserByEmail(email);
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    await storage.savePasswordResetToken(user.id, hashedToken, new Date(Date.now() + 3600000));
    await emailService.sendPasswordResetEmail(email, resetToken);
  }
  res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
});`,
    rateLimiting: { requests: 5, windowMs: 900000 },
  },
  {
    id: 'file-upload',
    name: 'File Upload',
    category: 'file',
    description: 'Upload single or multiple files with type and size validation',
    keywords: ['upload', 'file', 'attachment', 'multipart', 'form-data'],
    method: 'POST',
    pathPattern: '/api/files/upload',
    requestSchema: [
      { field: 'file', type: 'file', required: true, validation: 'maxSize:10485760' },
    ],
    responseSchema: [
      { field: 'id', type: 'string' },
      { field: 'filename', type: 'string' },
      { field: 'mimeType', type: 'string' },
      { field: 'size', type: 'number' },
      { field: 'url', type: 'string' },
    ],
    middleware: ['authenticate', 'multerUpload', 'rateLimiter'],
    headers: { 'Content-Type': 'multipart/form-data' },
    errorResponses: [
      { status: 400, message: 'No file provided' },
      { status: 401, message: 'Authentication required' },
      { status: 413, message: 'File too large' },
      { status: 415, message: 'Unsupported file type' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => cb(null, \`\${Date.now()}-\${file.originalname}\`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post('/api/files/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const record = await storage.createFile({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadedBy: req.user.id,
  });
  res.status(201).json({ id: record.id, filename: record.originalName, mimeType: record.mimeType, size: record.size, url: \`/api/files/\${record.id}\` });
});`,
    rateLimiting: { requests: 20, windowMs: 60000 },
  },
  {
    id: 'file-download',
    name: 'File Download',
    category: 'file',
    description: 'Download a file by ID with proper content headers and streaming',
    keywords: ['download', 'file', 'stream', 'attachment', 'binary'],
    method: 'GET',
    pathPattern: '/api/files/:id/download',
    requestSchema: [],
    responseSchema: [],
    middleware: ['authenticate'],
    headers: { 'Content-Disposition': 'attachment' },
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'File not found' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/files/:id/download', authenticate, async (req: Request, res: Response) => {
  const file = await storage.findFileById(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  const filePath = path.resolve(file.path);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', \`attachment; filename="\${file.originalName}"\`);
  res.setHeader('Content-Length', file.size.toString());
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});`,
  },
  {
    id: 'image-resize',
    name: 'Image Resize',
    category: 'file',
    description: 'Resize an uploaded image to specified dimensions with format conversion',
    keywords: ['image', 'resize', 'thumbnail', 'crop', 'transform', 'optimize'],
    method: 'POST',
    pathPattern: '/api/files/:id/resize',
    requestSchema: [
      { field: 'width', type: 'number', required: true, validation: 'min:1,max:4096' },
      { field: 'height', type: 'number', required: false, validation: 'min:1,max:4096' },
      { field: 'format', type: 'string', required: false, validation: 'enum:jpeg,png,webp,avif' },
      { field: 'quality', type: 'number', required: false, validation: 'min:1,max:100' },
      { field: 'fit', type: 'string', required: false, validation: 'enum:cover,contain,fill,inside,outside' },
    ],
    responseSchema: [
      { field: 'id', type: 'string' },
      { field: 'url', type: 'string' },
      { field: 'width', type: 'number' },
      { field: 'height', type: 'number' },
      { field: 'size', type: 'number' },
      { field: 'format', type: 'string' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    errorResponses: [
      { status: 400, message: 'Invalid resize parameters' },
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'Image not found' },
      { status: 415, message: 'File is not an image' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/files/:id/resize', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const file = await storage.findFileById(req.params.id);
  if (!file) return res.status(404).json({ error: 'Image not found' });
  if (!file.mimeType.startsWith('image/')) return res.status(415).json({ error: 'File is not an image' });
  const { width, height, format = 'webp', quality = 80, fit = 'cover' } = req.body;
  if (!width || width < 1 || width > 4096) return res.status(400).json({ error: 'Invalid width' });
  const outputPath = \`./uploads/resized-\${Date.now()}-\${width}x\${height || 'auto'}.\${format}\`;
  const result = await sharp(file.path)
    .resize({ width, height: height || undefined, fit })
    .toFormat(format, { quality })
    .toFile(outputPath);
  const record = await storage.createFile({
    filename: path.basename(outputPath),
    originalName: \`resized-\${file.originalName}\`,
    mimeType: \`image/\${format}\`,
    size: result.size,
    path: outputPath,
    uploadedBy: req.user.id,
  });
  res.json({ id: record.id, url: \`/api/files/\${record.id}\`, width: result.width, height: result.height, size: result.size, format });
});`,
    rateLimiting: { requests: 30, windowMs: 60000 },
  },
  {
    id: 'batch-create',
    name: 'Batch Create',
    category: 'batch',
    description: 'Create multiple resources in a single request with transaction support',
    keywords: ['batch', 'bulk', 'create', 'insert', 'multiple', 'mass'],
    method: 'POST',
    pathPattern: '/api/:resource/batch',
    requestSchema: [
      { field: 'items', type: 'array', required: true, validation: 'minItems:1,maxItems:1000' },
    ],
    responseSchema: [
      { field: 'created', type: 'number' },
      { field: 'failed', type: 'number' },
      { field: 'results', type: 'array' },
      { field: 'errors', type: 'array' },
    ],
    middleware: ['authenticate', 'rateLimiter', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Items array is required' },
      { status: 401, message: 'Authentication required' },
      { status: 413, message: 'Batch size exceeds maximum of 1000' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/:resource/batch', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Items array is required' });
  if (items.length > 1000) return res.status(413).json({ error: 'Batch size exceeds maximum of 1000' });
  const results: any[] = [];
  const errors: any[] = [];
  await db.transaction(async (tx) => {
    for (let i = 0; i < items.length; i++) {
      try {
        const parsed = insertSchema.safeParse(items[i]);
        if (!parsed.success) { errors.push({ index: i, error: parsed.error.issues }); continue; }
        const created = await storage.createWithTx(tx, req.params.resource, parsed.data);
        results.push(created);
      } catch (err: any) {
        errors.push({ index: i, error: err.message });
      }
    }
  });
  res.status(201).json({ created: results.length, failed: errors.length, results, errors });
});`,
    rateLimiting: { requests: 10, windowMs: 60000 },
  },
  {
    id: 'batch-update',
    name: 'Batch Update',
    category: 'batch',
    description: 'Update multiple resources by ID in a single request',
    keywords: ['batch', 'bulk', 'update', 'modify', 'mass-update'],
    method: 'PATCH',
    pathPattern: '/api/:resource/batch',
    requestSchema: [
      { field: 'updates', type: 'array', required: true, validation: 'minItems:1,maxItems:1000' },
      { field: 'updates[].id', type: 'number', required: true },
      { field: 'updates[].data', type: 'object', required: true },
    ],
    responseSchema: [
      { field: 'updated', type: 'number' },
      { field: 'failed', type: 'number' },
      { field: 'results', type: 'array' },
      { field: 'errors', type: 'array' },
    ],
    middleware: ['authenticate', 'rateLimiter', 'validateBody'],
    errorResponses: [
      { status: 400, message: 'Updates array is required' },
      { status: 401, message: 'Authentication required' },
      { status: 413, message: 'Batch size exceeds maximum of 1000' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.patch('/api/:resource/batch', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) return res.status(400).json({ error: 'Updates array is required' });
  if (updates.length > 1000) return res.status(413).json({ error: 'Batch size exceeds maximum of 1000' });
  const results: any[] = [];
  const errors: any[] = [];
  await db.transaction(async (tx) => {
    for (const update of updates) {
      try {
        if (!update.id || !update.data) { errors.push({ id: update.id, error: 'Missing id or data' }); continue; }
        const existing = await storage.findByIdWithTx(tx, req.params.resource, update.id);
        if (!existing) { errors.push({ id: update.id, error: 'Not found' }); continue; }
        const updated = await storage.updateWithTx(tx, req.params.resource, update.id, update.data);
        results.push(updated);
      } catch (err: any) {
        errors.push({ id: update.id, error: err.message });
      }
    }
  });
  res.json({ updated: results.length, failed: errors.length, results, errors });
});`,
    rateLimiting: { requests: 10, windowMs: 60000 },
  },
  {
    id: 'batch-delete',
    name: 'Batch Delete',
    category: 'batch',
    description: 'Delete multiple resources by IDs in a single request',
    keywords: ['batch', 'bulk', 'delete', 'remove', 'mass-delete'],
    method: 'DELETE',
    pathPattern: '/api/:resource/batch',
    requestSchema: [
      { field: 'ids', type: 'array', required: true, validation: 'minItems:1,maxItems:1000' },
    ],
    responseSchema: [
      { field: 'deleted', type: 'number' },
      { field: 'failed', type: 'number' },
      { field: 'errors', type: 'array' },
    ],
    middleware: ['authenticate', 'authorize', 'rateLimiter'],
    errorResponses: [
      { status: 400, message: 'IDs array is required' },
      { status: 401, message: 'Authentication required' },
      { status: 403, message: 'Insufficient permissions' },
      { status: 413, message: 'Batch size exceeds maximum of 1000' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.delete('/api/:resource/batch', authenticate, authorize('admin'), rateLimiter, async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'IDs array is required' });
  if (ids.length > 1000) return res.status(413).json({ error: 'Batch size exceeds maximum of 1000' });
  let deleted = 0;
  const errors: any[] = [];
  await db.transaction(async (tx) => {
    for (const id of ids) {
      try {
        const existing = await storage.findByIdWithTx(tx, req.params.resource, id);
        if (!existing) { errors.push({ id, error: 'Not found' }); continue; }
        await storage.deleteWithTx(tx, req.params.resource, id);
        deleted++;
      } catch (err: any) {
        errors.push({ id, error: err.message });
      }
    }
  });
  res.json({ deleted, failed: errors.length, errors });
});`,
    rateLimiting: { requests: 5, windowMs: 60000 },
  },
  {
    id: 'websocket-connection',
    name: 'WebSocket Connection',
    category: 'realtime',
    description: 'Establish a WebSocket connection for bidirectional real-time communication',
    keywords: ['websocket', 'ws', 'realtime', 'real-time', 'socket', 'bidirectional', 'live'],
    method: 'GET',
    pathPattern: '/ws',
    requestSchema: [],
    responseSchema: [
      { field: 'type', type: 'string' },
      { field: 'payload', type: 'object' },
      { field: 'timestamp', type: 'string' },
    ],
    middleware: ['wsAuthenticate'],
    queryParams: [
      { name: 'token', type: 'string', description: 'Authentication token for WebSocket upgrade' },
    ],
    errorResponses: [
      { status: 401, message: 'Authentication required for WebSocket connection' },
      { status: 426, message: 'WebSocket upgrade required' },
    ],
    codeTemplate: `const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url!, \`http://\${request.headers.host}\`);
  const token = url.searchParams.get('token');
  if (!token) { socket.destroy(); return; }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    wss.handleUpgrade(request, socket, head, (ws) => {
      (ws as any).user = user;
      wss.emit('connection', ws, request);
    });
  } catch {
    socket.destroy();
  }
});

wss.on('connection', (ws, req) => {
  const userId = (ws as any).user.userId;
  clients.set(userId, ws);
  ws.send(JSON.stringify({ type: 'connected', payload: { userId }, timestamp: new Date().toISOString() }));
  ws.on('message', async (data) => {
    const message = JSON.parse(data.toString());
    await handleWebSocketMessage(ws, userId, message);
  });
  ws.on('close', () => { clients.delete(userId); });
});`,
  },
  {
    id: 'server-sent-events',
    name: 'Server-Sent Events',
    category: 'realtime',
    description: 'Stream real-time updates to clients using Server-Sent Events (SSE)',
    keywords: ['sse', 'server-sent-events', 'stream', 'realtime', 'push', 'event-stream'],
    method: 'GET',
    pathPattern: '/api/events/stream',
    requestSchema: [],
    responseSchema: [
      { field: 'event', type: 'string' },
      { field: 'data', type: 'object' },
      { field: 'id', type: 'string' },
    ],
    middleware: ['authenticate'],
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    queryParams: [
      { name: 'channels', type: 'string', description: 'Comma-separated list of event channels to subscribe to' },
    ],
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/events/stream', authenticate, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const channels = (req.query.channels as string)?.split(',') || ['default'];
  const clientId = crypto.randomUUID();
  const client = { id: clientId, userId: req.user.id, res, channels };
  sseClients.set(clientId, client);
  res.write(\`data: \${JSON.stringify({ event: 'connected', data: { clientId, channels } })}\\n\\n\`);
  const heartbeat = setInterval(() => { res.write(': heartbeat\\n\\n'); }, 30000);
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);
  });
});`,
  },
  {
    id: 'long-polling',
    name: 'Long Polling',
    category: 'realtime',
    description: 'Long polling endpoint for clients that cannot use WebSocket or SSE',
    keywords: ['long-polling', 'poll', 'comet', 'realtime', 'updates', 'fallback'],
    method: 'GET',
    pathPattern: '/api/events/poll',
    requestSchema: [],
    responseSchema: [
      { field: 'events', type: 'array' },
      { field: 'lastEventId', type: 'string' },
      { field: 'hasMore', type: 'boolean' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    queryParams: [
      { name: 'lastEventId', type: 'string', description: 'ID of the last received event' },
      { name: 'timeout', type: 'number', description: 'Long poll timeout in seconds (max 30)' },
    ],
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 408, message: 'Request timeout' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.get('/api/events/poll', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const lastEventId = req.query.lastEventId as string;
  const timeout = Math.min(30, parseInt(req.query.timeout as string) || 25) * 1000;
  const events = await storage.getEventsSince(req.user.id, lastEventId);
  if (events.length > 0) {
    return res.json({ events, lastEventId: events[events.length - 1].id, hasMore: events.length >= 50 });
  }
  const pollPromise = new Promise<any[]>((resolve) => {
    const handler = (event: any) => { resolve([event]); };
    eventEmitter.once(\`user:\${req.user.id}\`, handler);
    setTimeout(() => {
      eventEmitter.removeListener(\`user:\${req.user.id}\`, handler);
      resolve([]);
    }, timeout);
  });
  const polledEvents = await pollPromise;
  if (polledEvents.length === 0) return res.json({ events: [], lastEventId: lastEventId || null, hasMore: false });
  res.json({ events: polledEvents, lastEventId: polledEvents[polledEvents.length - 1].id, hasMore: false });
});`,
    rateLimiting: { requests: 120, windowMs: 60000 },
  },
  {
    id: 'webhook-receiver',
    name: 'Webhook Receiver',
    category: 'specialized',
    description: 'Receive and process incoming webhooks with signature verification',
    keywords: ['webhook', 'callback', 'hook', 'event', 'notification', 'integration'],
    method: 'POST',
    pathPattern: '/api/webhooks/:provider',
    requestSchema: [
      { field: 'event', type: 'string', required: true },
      { field: 'data', type: 'object', required: true },
      { field: 'timestamp', type: 'string', required: true },
    ],
    responseSchema: [
      { field: 'received', type: 'boolean' },
    ],
    middleware: ['rawBodyParser', 'webhookSignatureVerifier'],
    headers: { 'X-Webhook-Signature': 'HMAC-SHA256 signature' },
    errorResponses: [
      { status: 400, message: 'Invalid webhook payload' },
      { status: 401, message: 'Invalid webhook signature' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/webhooks/:provider', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const provider = req.params.provider;
  const signature = req.headers['x-webhook-signature'] as string;
  const secret = process.env[\`WEBHOOK_SECRET_\${provider.toUpperCase()}\`];
  if (!secret) return res.status(400).json({ error: 'Unknown webhook provider' });
  const expectedSig = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expectedSig))) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
  const payload = JSON.parse(req.body.toString());
  await storage.createWebhookEvent({ provider, event: payload.event, data: payload.data, receivedAt: new Date() });
  res.json({ received: true });
  setImmediate(() => processWebhookEvent(provider, payload));
});`,
  },
  {
    id: 'export-to-csv',
    name: 'Export to CSV',
    category: 'specialized',
    description: 'Export filtered resources as a downloadable CSV file',
    keywords: ['export', 'csv', 'download', 'report', 'spreadsheet', 'data-export'],
    method: 'POST',
    pathPattern: '/api/:resource/export/csv',
    requestSchema: [
      { field: 'columns', type: 'array', required: false },
      { field: 'filters', type: 'object', required: false },
      { field: 'sortBy', type: 'string', required: false },
      { field: 'sortOrder', type: 'string', required: false, validation: 'enum:asc,desc' },
    ],
    responseSchema: [],
    middleware: ['authenticate', 'rateLimiter'],
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="export.csv"' },
    errorResponses: [
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'No data found for export' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/:resource/export/csv', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const { columns, filters = {}, sortBy = 'id', sortOrder = 'asc' } = req.body;
  const data = await storage.findMany(req.params.resource, { where: filters, orderBy: { [sortBy]: sortOrder }, limit: 10000 });
  if (data.length === 0) return res.status(404).json({ error: 'No data found for export' });
  const fields = columns || Object.keys(data[0]);
  const header = fields.join(',');
  const rows = data.map((item: any) => fields.map((f: string) => {
    const val = String(item[f] ?? '');
    return val.includes(',') || val.includes('"') || val.includes('\\n') ? \`"\${val.replace(/"/g, '""')}"\` : val;
  }).join(','));
  const csv = [header, ...rows].join('\\n');
  const filename = \`\${req.params.resource}-export-\${new Date().toISOString().split('T')[0]}.csv\`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', \`attachment; filename="\${filename}"\`);
  res.send(csv);
});`,
    rateLimiting: { requests: 10, windowMs: 60000 },
  },
  {
    id: 'import-from-csv',
    name: 'Import from CSV',
    category: 'specialized',
    description: 'Import resources from an uploaded CSV file with validation and error reporting',
    keywords: ['import', 'csv', 'upload', 'bulk-import', 'spreadsheet', 'data-import'],
    method: 'POST',
    pathPattern: '/api/:resource/import/csv',
    requestSchema: [
      { field: 'file', type: 'file', required: true, validation: 'mimeType:text/csv' },
      { field: 'skipHeader', type: 'boolean', required: false },
      { field: 'columnMapping', type: 'object', required: false },
    ],
    responseSchema: [
      { field: 'imported', type: 'number' },
      { field: 'failed', type: 'number' },
      { field: 'total', type: 'number' },
      { field: 'errors', type: 'array' },
    ],
    middleware: ['authenticate', 'multerUpload', 'rateLimiter'],
    headers: { 'Content-Type': 'multipart/form-data' },
    errorResponses: [
      { status: 400, message: 'CSV file is required' },
      { status: 401, message: 'Authentication required' },
      { status: 415, message: 'File must be a CSV' },
      { status: 422, message: 'CSV parsing failed' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/:resource/import/csv', authenticate, upload.single('file'), rateLimiter, async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });
  if (req.file.mimetype !== 'text/csv') return res.status(415).json({ error: 'File must be a CSV' });
  const content = fs.readFileSync(req.file.path, 'utf-8');
  const lines = content.split('\\n').filter(l => l.trim());
  const skipHeader = req.body.skipHeader !== 'false';
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const dataLines = skipHeader ? lines.slice(1) : lines;
  const columnMapping = req.body.columnMapping ? JSON.parse(req.body.columnMapping) : null;
  let imported = 0;
  const errors: any[] = [];
  await db.transaction(async (tx) => {
    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const record: Record<string, any> = {};
        header.forEach((col, idx) => { record[columnMapping?.[col] || col] = values[idx]; });
        const parsed = insertSchema.safeParse(record);
        if (!parsed.success) { errors.push({ row: i + 1, error: parsed.error.issues }); return; }
        await storage.createWithTx(tx, req.params.resource, parsed.data);
        imported++;
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message });
      }
    }
  });
  res.json({ imported, failed: errors.length, total: dataLines.length, errors });
});`,
    rateLimiting: { requests: 5, windowMs: 60000 },
  },
  {
    id: 'send-notification',
    name: 'Send Notification',
    category: 'specialized',
    description: 'Send push, email, or in-app notifications to users',
    keywords: ['notification', 'notify', 'push', 'email', 'alert', 'message', 'broadcast'],
    method: 'POST',
    pathPattern: '/api/notifications/send',
    requestSchema: [
      { field: 'recipients', type: 'array', required: true, validation: 'minItems:1' },
      { field: 'type', type: 'string', required: true, validation: 'enum:push,email,in-app,sms' },
      { field: 'title', type: 'string', required: true, validation: 'min:1,max:200' },
      { field: 'body', type: 'string', required: true, validation: 'min:1,max:5000' },
      { field: 'data', type: 'object', required: false },
      { field: 'priority', type: 'string', required: false, validation: 'enum:low,normal,high,urgent' },
    ],
    responseSchema: [
      { field: 'sent', type: 'number' },
      { field: 'failed', type: 'number' },
      { field: 'notificationId', type: 'string' },
    ],
    middleware: ['authenticate', 'authorize', 'rateLimiter'],
    errorResponses: [
      { status: 400, message: 'Invalid notification payload' },
      { status: 401, message: 'Authentication required' },
      { status: 403, message: 'Insufficient permissions to send notifications' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/notifications/send', authenticate, authorize('admin'), rateLimiter, async (req: Request, res: Response) => {
  const { recipients, type, title, body, data = {}, priority = 'normal' } = req.body;
  if (!recipients?.length || !type || !title || !body) return res.status(400).json({ error: 'Invalid notification payload' });
  const notificationId = crypto.randomUUID();
  let sent = 0;
  let failed = 0;
  for (const recipientId of recipients) {
    try {
      await storage.createNotification({
        id: notificationId,
        recipientId,
        type,
        title,
        body,
        data,
        priority,
        status: 'pending',
        createdAt: new Date(),
      });
      if (type === 'push' && sseClients.has(recipientId)) {
        sseClients.get(recipientId)!.res.write(\`data: \${JSON.stringify({ event: 'notification', data: { title, body, data } })}\\n\\n\`);
      }
      sent++;
    } catch {
      failed++;
    }
  }
  res.json({ sent, failed, notificationId });
});`,
    rateLimiting: { requests: 50, windowMs: 60000 },
  },
  {
    id: 'generate-report',
    name: 'Generate Report',
    category: 'specialized',
    description: 'Generate a structured report with aggregations, charts data, and summary statistics',
    keywords: ['report', 'generate', 'analytics', 'summary', 'statistics', 'aggregate'],
    method: 'POST',
    pathPattern: '/api/reports/generate',
    requestSchema: [
      { field: 'type', type: 'string', required: true, validation: 'enum:summary,detailed,comparison,trend' },
      { field: 'resource', type: 'string', required: true },
      { field: 'dateRange', type: 'object', required: true },
      { field: 'dateRange.start', type: 'string', required: true, validation: 'iso8601' },
      { field: 'dateRange.end', type: 'string', required: true, validation: 'iso8601' },
      { field: 'groupBy', type: 'string', required: false },
      { field: 'metrics', type: 'array', required: true, validation: 'minItems:1' },
    ],
    responseSchema: [
      { field: 'reportId', type: 'string' },
      { field: 'type', type: 'string' },
      { field: 'generatedAt', type: 'string' },
      { field: 'summary', type: 'object' },
      { field: 'data', type: 'array' },
      { field: 'charts', type: 'array' },
    ],
    middleware: ['authenticate', 'rateLimiter'],
    errorResponses: [
      { status: 400, message: 'Invalid report configuration' },
      { status: 401, message: 'Authentication required' },
      { status: 404, message: 'No data found for the specified criteria' },
      { status: 500, message: 'Internal server error' },
    ],
    codeTemplate: `app.post('/api/reports/generate', authenticate, rateLimiter, async (req: Request, res: Response) => {
  const { type, resource, dateRange, groupBy, metrics } = req.body;
  if (!type || !resource || !dateRange?.start || !dateRange?.end || !metrics?.length) {
    return res.status(400).json({ error: 'Invalid report configuration' });
  }
  const data = await storage.findMany(resource, {
    where: { createdAt: { gte: new Date(dateRange.start), lte: new Date(dateRange.end) } },
    limit: 50000,
  });
  if (data.length === 0) return res.status(404).json({ error: 'No data found for the specified criteria' });
  const summary: Record<string, any> = { totalRecords: data.length };
  for (const metric of metrics) {
    const values = data.map((d: any) => Number(d[metric]) || 0);
    summary[metric] = {
      sum: values.reduce((a: number, b: number) => a + b, 0),
      avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
  const grouped = groupBy ? data.reduce((acc: any, item: any) => {
    const key = item[groupBy] || 'other';
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {}) : {};
  const charts = Object.entries(grouped).map(([label, items]) => ({ label, count: (items as any[]).length }));
  const reportId = crypto.randomUUID();
  await storage.saveReport({ id: reportId, type, resource, config: req.body, summary, generatedAt: new Date(), generatedBy: req.user.id });
  res.json({ reportId, type, generatedAt: new Date().toISOString(), summary, data: data.slice(0, 1000), charts });
});`,
    rateLimiting: { requests: 10, windowMs: 60000 },
  },
  {
    id: 'health-check',
    name: 'Health Check',
    category: 'specialized',
    description: 'System health check endpoint reporting service, database, and dependency status',
    keywords: ['health', 'healthcheck', 'status', 'ping', 'alive', 'ready', 'liveness'],
    method: 'GET',
    pathPattern: '/api/health',
    requestSchema: [],
    responseSchema: [
      { field: 'status', type: 'string' },
      { field: 'uptime', type: 'number' },
      { field: 'timestamp', type: 'string' },
      { field: 'services', type: 'object' },
      { field: 'version', type: 'string' },
    ],
    middleware: [],
    errorResponses: [
      { status: 503, message: 'Service unavailable' },
    ],
    codeTemplate: `app.get('/api/health', async (_req: Request, res: Response) => {
  const services: Record<string, { status: string; latency?: number }> = {};
  try {
    const dbStart = Date.now();
    await db.execute(sql\`SELECT 1\`);
    services.database = { status: 'healthy', latency: Date.now() - dbStart };
  } catch {
    services.database = { status: 'unhealthy' };
  }
  services.memory = {
    status: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'degraded',
    latency: 0,
  };
  const allHealthy = Object.values(services).every(s => s.status === 'healthy');
  const status = allHealthy ? 'healthy' : 'degraded';
  res.status(allHealthy ? 200 : 503).json({
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services,
    version: process.env.APP_VERSION || '1.0.0',
  });
});`,
  },
];
