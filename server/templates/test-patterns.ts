export interface TestPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  framework: string;
  testType: 'unit' | 'integration' | 'e2e' | 'snapshot' | 'accessibility' | 'performance';
  codeTemplate: string;
  assertions: string[];
  setupCode?: string;
  teardownCode?: string;
  mocks?: string[];
  useCases: string[];
}

export const testPatterns: TestPattern[] = [
  {
    id: 'pure-function',
    name: 'Pure Function Test',
    category: 'unit',
    description: 'Tests a pure function with deterministic input/output behavior',
    keywords: ['pure', 'function', 'transform', 'calculate', 'format'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { {{functionName}} } from '{{modulePath}}';

describe('{{functionName}}', () => {
  it('should return expected output for valid input', () => {
    const result = {{functionName}}({{validInput}});
    expect(result).toEqual({{expectedOutput}});
  });

  it('should handle edge cases', () => {
    expect({{functionName}}({{edgeCaseInput}})).toEqual({{edgeCaseOutput}});
  });

  it('should throw for invalid input', () => {
    expect(() => {{functionName}}({{invalidInput}})).toThrow();
  });
});`,
    assertions: [
      'expect(result).toEqual(expectedOutput)',
      'expect(result).toBeDefined()',
      'expect(() => fn(invalid)).toThrow()',
      'expect(result).toHaveLength(expectedLength)',
    ],
    useCases: [
      'Testing data transformation functions',
      'Verifying mathematical calculations',
      'Validating string formatting utilities',
    ],
  },
  {
    id: 'class-method',
    name: 'Class Method Test',
    category: 'unit',
    description: 'Tests methods on a class instance with setup and state verification',
    keywords: ['class', 'method', 'instance', 'object', 'state'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect, beforeEach } from 'vitest';
import { {{ClassName}} } from '{{modulePath}}';

describe('{{ClassName}}', () => {
  let instance: {{ClassName}};

  beforeEach(() => {
    instance = new {{ClassName}}({{constructorArgs}});
  });

  it('should initialize with correct default state', () => {
    expect(instance.{{property}}).toBe({{defaultValue}});
  });

  it('should update state when {{methodName}} is called', () => {
    instance.{{methodName}}({{methodArgs}});
    expect(instance.{{property}}).toBe({{updatedValue}});
  });

  it('should return correct value from {{getterName}}', () => {
    const result = instance.{{getterName}}();
    expect(result).toEqual({{expectedReturn}});
  });
});`,
    assertions: [
      'expect(instance.property).toBe(defaultValue)',
      'expect(instance.method()).toEqual(expected)',
      'expect(instance.state).toHaveProperty(key)',
      'expect(() => instance.method(invalid)).toThrow()',
    ],
    setupCode: `let instance: ClassName;
beforeEach(() => {
  instance = new ClassName();
});`,
    useCases: [
      'Testing service class methods',
      'Verifying state management in class instances',
      'Testing builder or factory patterns',
    ],
  },
  {
    id: 'hook-test',
    name: 'React Hook Test',
    category: 'unit',
    description: 'Tests a custom React hook using renderHook',
    keywords: ['hook', 'react', 'useState', 'useEffect', 'custom'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { {{hookName}} } from '{{modulePath}}';

describe('{{hookName}}', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => {{hookName}}({{initialArgs}}));
    expect(result.current.{{stateField}}).toBe({{initialValue}});
  });

  it('should update state when action is called', () => {
    const { result } = renderHook(() => {{hookName}}({{initialArgs}}));
    act(() => {
      result.current.{{actionName}}({{actionArgs}});
    });
    expect(result.current.{{stateField}}).toBe({{updatedValue}});
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => {{hookName}}({{initialArgs}}));
    unmount();
  });
});`,
    assertions: [
      'expect(result.current.value).toBe(initialValue)',
      'expect(result.current.loading).toBe(false)',
      'expect(result.current.error).toBeNull()',
      'expect(result.current.data).toEqual(expectedData)',
    ],
    useCases: [
      'Testing custom state management hooks',
      'Verifying data fetching hooks',
      'Testing form handling hooks',
    ],
  },
  {
    id: 'utility-test',
    name: 'Utility Function Test',
    category: 'unit',
    description: 'Tests utility/helper functions with various input scenarios',
    keywords: ['utility', 'helper', 'utils', 'common', 'shared'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { {{utilName}} } from '{{modulePath}}';

describe('{{utilName}}', () => {
  it('should handle standard input', () => {
    expect({{utilName}}({{standardInput}})).toBe({{standardOutput}});
  });

  it('should handle empty input', () => {
    expect({{utilName}}({{emptyInput}})).toBe({{emptyOutput}});
  });

  it('should handle null/undefined gracefully', () => {
    expect({{utilName}}(null)).toBe({{nullOutput}});
    expect({{utilName}}(undefined)).toBe({{undefinedOutput}});
  });

  it('should handle boundary values', () => {
    expect({{utilName}}({{minValue}})).toBe({{minOutput}});
    expect({{utilName}}({{maxValue}})).toBe({{maxOutput}});
  });
});`,
    assertions: [
      'expect(result).toBe(expected)',
      'expect(result).toBeFalsy()',
      'expect(result).toBeGreaterThanOrEqual(0)',
      'expect(typeof result).toBe(expectedType)',
    ],
    useCases: [
      'Testing date formatting utilities',
      'Verifying slug generation',
      'Testing currency formatters',
    ],
  },
  {
    id: 'validation-test',
    name: 'Validation Logic Test',
    category: 'unit',
    description: 'Tests input validation functions and schema validators',
    keywords: ['validation', 'schema', 'zod', 'validate', 'input', 'sanitize'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { {{validatorName}} } from '{{modulePath}}';

describe('{{validatorName}}', () => {
  it('should accept valid input', () => {
    const result = {{validatorName}}({{validInput}});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({{expectedData}});
  });

  it('should reject missing required fields', () => {
    const result = {{validatorName}}({{missingFieldsInput}});
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: '{{requiredField}}' })
    );
  });

  it('should reject invalid field types', () => {
    const result = {{validatorName}}({{invalidTypeInput}});
    expect(result.success).toBe(false);
  });

  it('should sanitize input strings', () => {
    const result = {{validatorName}}({{unsanitizedInput}});
    expect(result.data.{{field}}).not.toContain('<script>');
  });
});`,
    assertions: [
      'expect(result.success).toBe(true)',
      'expect(result.errors).toHaveLength(0)',
      'expect(result.errors).toContainEqual(expect.objectContaining({ field: name }))',
      'expect(result.data).toMatchObject(expected)',
      'expect(result.success).toBe(false)',
    ],
    useCases: [
      'Testing form validation schemas',
      'Verifying API request body validation',
      'Testing email/password validators',
    ],
  },
  {
    id: 'reducer-test',
    name: 'Reducer Test',
    category: 'unit',
    description: 'Tests a state reducer function with action dispatching',
    keywords: ['reducer', 'state', 'action', 'dispatch', 'store'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { {{reducerName}}, initialState } from '{{modulePath}}';

describe('{{reducerName}}', () => {
  it('should return initial state for unknown action', () => {
    const state = {{reducerName}}(initialState, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  it('should handle {{actionType}} action', () => {
    const action = { type: '{{actionType}}', payload: {{payload}} };
    const state = {{reducerName}}(initialState, action);
    expect(state.{{stateField}}).toEqual({{expectedValue}});
  });

  it('should handle sequential actions correctly', () => {
    let state = {{reducerName}}(initialState, { type: '{{firstAction}}', payload: {{firstPayload}} });
    state = {{reducerName}}(state, { type: '{{secondAction}}', payload: {{secondPayload}} });
    expect(state.{{stateField}}).toEqual({{finalValue}});
  });

  it('should not mutate previous state', () => {
    const prev = { ...initialState };
    {{reducerName}}(prev, { type: '{{actionType}}', payload: {{payload}} });
    expect(prev).toEqual(initialState);
  });
});`,
    assertions: [
      'expect(state).toEqual(initialState)',
      'expect(state.field).toBe(expectedValue)',
      'expect(state.items).toHaveLength(expectedLength)',
      'expect(prev).toEqual(initialState)',
    ],
    useCases: [
      'Testing shopping cart reducers',
      'Verifying form state reducers',
      'Testing notification/alert state management',
    ],
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint Test',
    category: 'integration',
    description: 'Tests an API endpoint with HTTP requests and response validation',
    keywords: ['api', 'endpoint', 'http', 'rest', 'request', 'response'],
    framework: 'vitest',
    testType: 'integration',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '{{appPath}}';

describe('{{method}} {{endpoint}}', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    server.close();
  });

  it('should return {{expectedStatus}} for valid request', async () => {
    const res = await request(server)
      .{{httpMethod}}('{{endpoint}}')
      .send({{requestBody}});
    expect(res.status).toBe({{expectedStatus}});
    expect(res.body).toHaveProperty('{{responseProperty}}');
  });

  it('should return 400 for invalid request body', async () => {
    const res = await request(server)
      .{{httpMethod}}('{{endpoint}}')
      .send({{invalidBody}});
    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent resource', async () => {
    const res = await request(server)
      .get('{{endpoint}}/99999');
    expect(res.status).toBe(404);
  });
});`,
    assertions: [
      'expect(res.status).toBe(200)',
      'expect(res.body).toHaveProperty(key)',
      'expect(res.body.data).toBeInstanceOf(Array)',
      'expect(res.headers["content-type"]).toContain("application/json")',
      'expect(res.status).toBe(400)',
    ],
    setupCode: `let server: any;
beforeAll(async () => {
  server = app.listen(0);
});`,
    teardownCode: `afterAll(async () => {
  server.close();
});`,
    useCases: [
      'Testing CRUD API endpoints',
      'Verifying authentication endpoints',
      'Testing search and filter APIs',
    ],
  },
  {
    id: 'database-query',
    name: 'Database Query Test',
    category: 'integration',
    description: 'Tests database operations with a test database instance',
    keywords: ['database', 'query', 'sql', 'orm', 'drizzle', 'postgres'],
    framework: 'vitest',
    testType: 'integration',
    codeTemplate: `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '{{dbPath}}';
import { {{tableName}} } from '{{schemaPath}}';
import { eq } from 'drizzle-orm';

describe('{{tableName}} queries', () => {
  let testId: number;

  beforeEach(async () => {
    const [inserted] = await db.insert({{tableName}}).values({{testRecord}}).returning();
    testId = inserted.id;
  });

  afterEach(async () => {
    await db.delete({{tableName}}).where(eq({{tableName}}.id, testId));
  });

  it('should insert a record successfully', async () => {
    const [record] = await db.insert({{tableName}}).values({{newRecord}}).returning();
    expect(record).toHaveProperty('id');
    expect(record.{{field}}).toBe({{expectedValue}});
    await db.delete({{tableName}}).where(eq({{tableName}}.id, record.id));
  });

  it('should query records by field', async () => {
    const records = await db.select().from({{tableName}}).where(eq({{tableName}}.{{filterField}}, {{filterValue}}));
    expect(records.length).toBeGreaterThanOrEqual(1);
  });

  it('should update a record', async () => {
    await db.update({{tableName}}).set({ {{updateField}}: {{updateValue}} }).where(eq({{tableName}}.id, testId));
    const [updated] = await db.select().from({{tableName}}).where(eq({{tableName}}.id, testId));
    expect(updated.{{updateField}}).toBe({{updateValue}});
  });
});`,
    assertions: [
      'expect(record).toHaveProperty("id")',
      'expect(records.length).toBeGreaterThanOrEqual(1)',
      'expect(updated.field).toBe(newValue)',
      'expect(deleted).toHaveLength(0)',
    ],
    setupCode: `let testId: number;
beforeEach(async () => {
  const [inserted] = await db.insert(table).values(testData).returning();
  testId = inserted.id;
});`,
    teardownCode: `afterEach(async () => {
  await db.delete(table).where(eq(table.id, testId));
});`,
    useCases: [
      'Testing user CRUD operations',
      'Verifying complex query joins',
      'Testing data migration scripts',
    ],
  },
  {
    id: 'middleware-chain',
    name: 'Middleware Chain Test',
    category: 'integration',
    description: 'Tests Express middleware execution order and behavior',
    keywords: ['middleware', 'express', 'auth', 'chain', 'next'],
    framework: 'vitest',
    testType: 'integration',
    codeTemplate: `import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { {{middlewareName}} } from '{{modulePath}}';

describe('{{middlewareName}}', () => {
  const mockReq = () => ({
    headers: {},
    body: {},
    params: {},
    query: {},
  } as unknown as Request);

  const mockRes = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = vi.fn() as NextFunction;

  it('should call next() for valid requests', () => {
    const req = mockReq();
    req.headers.authorization = 'Bearer {{validToken}}';
    const res = mockRes();
    {{middlewareName}}(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 for missing auth', () => {
    const req = mockReq();
    const res = mockRes();
    {{middlewareName}}(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should attach user data to request', () => {
    const req = mockReq();
    req.headers.authorization = 'Bearer {{validToken}}';
    const res = mockRes();
    {{middlewareName}}(req, res, mockNext);
    expect((req as any).user).toBeDefined();
  });
});`,
    assertions: [
      'expect(mockNext).toHaveBeenCalled()',
      'expect(res.status).toHaveBeenCalledWith(401)',
      'expect(req.user).toBeDefined()',
      'expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))',
    ],
    mocks: [
      'vi.fn() for next()',
      'vi.fn().mockReturnValue(res) for res.status/json/send',
    ],
    useCases: [
      'Testing authentication middleware',
      'Verifying rate limiting middleware',
      'Testing request validation middleware',
    ],
  },
  {
    id: 'service-layer',
    name: 'Service Layer Test',
    category: 'integration',
    description: 'Tests a service class that coordinates between storage and business logic',
    keywords: ['service', 'business', 'logic', 'layer', 'orchestration'],
    framework: 'vitest',
    testType: 'integration',
    codeTemplate: `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { {{ServiceName}} } from '{{servicePath}}';
import { IStorage } from '{{storagePath}}';

describe('{{ServiceName}}', () => {
  let service: {{ServiceName}};
  let mockStorage: Partial<IStorage>;

  beforeEach(() => {
    mockStorage = {
      {{storageMethod}}: vi.fn().mockResolvedValue({{mockReturnValue}}),
      {{anotherMethod}}: vi.fn().mockResolvedValue({{anotherMockReturn}}),
    };
    service = new {{ServiceName}}(mockStorage as IStorage);
  });

  it('should call storage method with correct params', async () => {
    await service.{{serviceMethod}}({{serviceArgs}});
    expect(mockStorage.{{storageMethod}}).toHaveBeenCalledWith({{expectedStorageArgs}});
  });

  it('should transform storage result correctly', async () => {
    const result = await service.{{serviceMethod}}({{serviceArgs}});
    expect(result).toEqual({{transformedResult}});
  });

  it('should handle storage errors gracefully', async () => {
    (mockStorage.{{storageMethod}} as any).mockRejectedValue(new Error('DB Error'));
    await expect(service.{{serviceMethod}}({{serviceArgs}})).rejects.toThrow('DB Error');
  });
});`,
    assertions: [
      'expect(mockStorage.method).toHaveBeenCalledWith(args)',
      'expect(result).toEqual(expected)',
      'expect(service.method(args)).rejects.toThrow()',
      'expect(mockStorage.method).toHaveBeenCalledTimes(1)',
    ],
    mocks: [
      'vi.fn().mockResolvedValue(data) for storage methods',
      'vi.fn().mockRejectedValue(error) for error scenarios',
    ],
    setupCode: `let service: ServiceName;
let mockStorage: Partial<IStorage>;
beforeEach(() => {
  mockStorage = { method: vi.fn().mockResolvedValue(data) };
  service = new ServiceName(mockStorage as IStorage);
});`,
    useCases: [
      'Testing order processing services',
      'Verifying notification dispatch logic',
      'Testing data aggregation services',
    ],
  },
  {
    id: 'websocket',
    name: 'WebSocket Test',
    category: 'integration',
    description: 'Tests WebSocket connection, messaging, and event handling',
    keywords: ['websocket', 'ws', 'realtime', 'socket', 'event', 'message'],
    framework: 'vitest',
    testType: 'integration',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { createServer } from '{{serverPath}}';

describe('WebSocket {{endpoint}}', () => {
  let server: any;
  let port: number;

  beforeAll(async () => {
    server = await createServer();
    port = server.address().port;
  });

  afterAll(() => {
    server.close();
  });

  it('should establish a connection', async () => {
    const ws = new WebSocket(\`ws://localhost:\${port}{{wsPath}}\`);
    await new Promise<void>((resolve) => ws.on('open', resolve));
    expect(ws.readyState).toBe(WebSocket.OPEN);
    ws.close();
  });

  it('should receive messages after sending', async () => {
    const ws = new WebSocket(\`ws://localhost:\${port}{{wsPath}}\`);
    await new Promise<void>((resolve) => ws.on('open', resolve));
    const messagePromise = new Promise<string>((resolve) => {
      ws.on('message', (data) => resolve(data.toString()));
    });
    ws.send(JSON.stringify({{testMessage}}));
    const response = await messagePromise;
    const parsed = JSON.parse(response);
    expect(parsed).toHaveProperty('{{responseField}}');
    ws.close();
  });

  it('should handle disconnect gracefully', async () => {
    const ws = new WebSocket(\`ws://localhost:\${port}{{wsPath}}\`);
    await new Promise<void>((resolve) => ws.on('open', resolve));
    ws.close();
    await new Promise<void>((resolve) => ws.on('close', resolve));
    expect(ws.readyState).toBe(WebSocket.CLOSED);
  });
});`,
    assertions: [
      'expect(ws.readyState).toBe(WebSocket.OPEN)',
      'expect(parsed).toHaveProperty(field)',
      'expect(ws.readyState).toBe(WebSocket.CLOSED)',
      'expect(parsed.type).toBe(expectedType)',
    ],
    setupCode: `let server: any;
let port: number;
beforeAll(async () => {
  server = await createServer();
  port = server.address().port;
});`,
    teardownCode: `afterAll(() => {
  server.close();
});`,
    useCases: [
      'Testing real-time chat functionality',
      'Verifying live notification delivery',
      'Testing collaborative editing features',
    ],
  },
  {
    id: 'render-test',
    name: 'Component Render Test',
    category: 'component',
    description: 'Tests that a React component renders correctly with given props',
    keywords: ['render', 'component', 'react', 'dom', 'props'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}}', () => {
  it('should render without crashing', () => {
    render(<{{ComponentName}} {{requiredProps}} />);
    expect(screen.getByTestId('{{testId}}')).toBeInTheDocument();
  });

  it('should display correct content', () => {
    render(<{{ComponentName}} {{propsWithContent}} />);
    expect(screen.getByText('{{expectedText}}')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    render(<{{ComponentName}} {{propsWithVariant}} />);
    const element = screen.getByTestId('{{testId}}');
    expect(element).toHaveClass('{{expectedClass}}');
  });

  it('should render children when provided', () => {
    render(
      <{{ComponentName}} {{requiredProps}}>
        <span data-testid="child">Child Content</span>
      </{{ComponentName}}>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});`,
    assertions: [
      'expect(element).toBeInTheDocument()',
      'expect(screen.getByText(text)).toBeInTheDocument()',
      'expect(element).toHaveClass(className)',
      'expect(screen.queryByTestId(id)).toBeNull()',
    ],
    useCases: [
      'Testing UI component rendering',
      'Verifying card/list item display',
      'Testing layout component structure',
    ],
  },
  {
    id: 'user-interaction',
    name: 'User Interaction Test',
    category: 'component',
    description: 'Tests user interactions like clicks, typing, and selections',
    keywords: ['click', 'interaction', 'event', 'user', 'input', 'type'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}} interactions', () => {
  it('should call onClick handler when button is clicked', async () => {
    const handleClick = vi.fn();
    render(<{{ComponentName}} onClick={handleClick} />);
    await userEvent.click(screen.getByTestId('{{buttonTestId}}'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should update input value on typing', async () => {
    render(<{{ComponentName}} />);
    const input = screen.getByTestId('{{inputTestId}}');
    await userEvent.type(input, '{{typedText}}');
    expect(input).toHaveValue('{{typedText}}');
  });

  it('should toggle visibility on click', async () => {
    render(<{{ComponentName}} />);
    const toggle = screen.getByTestId('{{toggleTestId}}');
    await userEvent.click(toggle);
    expect(screen.getByTestId('{{contentTestId}}')).toBeVisible();
  });

  it('should disable button after submission', async () => {
    render(<{{ComponentName}} />);
    const button = screen.getByTestId('{{submitTestId}}');
    await userEvent.click(button);
    expect(button).toBeDisabled();
  });
});`,
    assertions: [
      'expect(handleClick).toHaveBeenCalledTimes(1)',
      'expect(input).toHaveValue(expectedValue)',
      'expect(element).toBeVisible()',
      'expect(button).toBeDisabled()',
    ],
    mocks: ['vi.fn() for event handlers'],
    useCases: [
      'Testing button click handlers',
      'Verifying form input behavior',
      'Testing dropdown/select interactions',
    ],
  },
  {
    id: 'form-submission',
    name: 'Form Submission Test',
    category: 'component',
    description: 'Tests form submission flow including validation and callbacks',
    keywords: ['form', 'submit', 'validation', 'input', 'field'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{FormComponent}} } from '{{componentPath}}';

describe('{{FormComponent}} submission', () => {
  const mockSubmit = vi.fn();

  it('should submit form with valid data', async () => {
    render(<{{FormComponent}} onSubmit={mockSubmit} />);
    await userEvent.type(screen.getByTestId('input-{{field1}}'), '{{value1}}');
    await userEvent.type(screen.getByTestId('input-{{field2}}'), '{{value2}}');
    await userEvent.click(screen.getByTestId('button-submit'));
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ {{field1}}: '{{value1}}', {{field2}}: '{{value2}}' })
      );
    });
  });

  it('should show validation errors for empty required fields', async () => {
    render(<{{FormComponent}} onSubmit={mockSubmit} />);
    await userEvent.click(screen.getByTestId('button-submit'));
    await waitFor(() => {
      expect(screen.getByText('{{requiredErrorMessage}}')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<{{FormComponent}} onSubmit={mockSubmit} />);
    await userEvent.type(screen.getByTestId('input-email'), 'invalid-email');
    await userEvent.click(screen.getByTestId('button-submit'));
    await waitFor(() => {
      expect(screen.getByText('{{emailErrorMessage}}')).toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    mockSubmit.mockResolvedValue(undefined);
    render(<{{FormComponent}} onSubmit={mockSubmit} />);
    await userEvent.type(screen.getByTestId('input-{{field1}}'), '{{value1}}');
    await userEvent.click(screen.getByTestId('button-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('input-{{field1}}')).toHaveValue('');
    });
  });
});`,
    assertions: [
      'expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining(data))',
      'expect(screen.getByText(errorMessage)).toBeInTheDocument()',
      'expect(input).toHaveValue("")',
      'expect(mockSubmit).not.toHaveBeenCalled()',
      'expect(screen.getByTestId("button-submit")).toBeDisabled()',
    ],
    mocks: ['vi.fn() for onSubmit handler'],
    useCases: [
      'Testing login/registration forms',
      'Verifying contact form submissions',
      'Testing settings/profile update forms',
    ],
  },
  {
    id: 'conditional-rendering',
    name: 'Conditional Rendering Test',
    category: 'component',
    description: 'Tests components that render different content based on state or props',
    keywords: ['conditional', 'render', 'state', 'toggle', 'show', 'hide'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}} conditional rendering', () => {
  it('should render loading state', () => {
    render(<{{ComponentName}} isLoading={true} />);
    expect(screen.getByTestId('{{loadingTestId}}')).toBeInTheDocument();
    expect(screen.queryByTestId('{{contentTestId}}')).not.toBeInTheDocument();
  });

  it('should render content when loaded', () => {
    render(<{{ComponentName}} isLoading={false} data={{{testData}}} />);
    expect(screen.queryByTestId('{{loadingTestId}}')).not.toBeInTheDocument();
    expect(screen.getByTestId('{{contentTestId}}')).toBeInTheDocument();
  });

  it('should render empty state when data is empty', () => {
    render(<{{ComponentName}} isLoading={false} data={[]} />);
    expect(screen.getByTestId('{{emptyStateTestId}}')).toBeInTheDocument();
  });

  it('should render admin controls for admin users', () => {
    render(<{{ComponentName}} role="admin" />);
    expect(screen.getByTestId('{{adminControlTestId}}')).toBeInTheDocument();
  });

  it('should hide admin controls for regular users', () => {
    render(<{{ComponentName}} role="user" />);
    expect(screen.queryByTestId('{{adminControlTestId}}')).not.toBeInTheDocument();
  });
});`,
    assertions: [
      'expect(element).toBeInTheDocument()',
      'expect(screen.queryByTestId(id)).not.toBeInTheDocument()',
      'expect(screen.queryByTestId(id)).toBeNull()',
      'expect(screen.getByText(text)).toBeVisible()',
    ],
    useCases: [
      'Testing loading/empty/error states',
      'Verifying role-based UI rendering',
      'Testing feature flag conditional display',
    ],
  },
  {
    id: 'error-state',
    name: 'Error State Test',
    category: 'component',
    description: 'Tests component behavior when errors occur',
    keywords: ['error', 'boundary', 'fallback', 'retry', 'failure'],
    framework: 'vitest',
    testType: 'unit',
    codeTemplate: `import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}} error handling', () => {
  it('should display error message on failure', () => {
    render(<{{ComponentName}} error={{ message: '{{errorMessage}}' }} />);
    expect(screen.getByTestId('{{errorTestId}}')).toBeInTheDocument();
    expect(screen.getByText('{{errorMessage}}')).toBeInTheDocument();
  });

  it('should show retry button on error', () => {
    render(<{{ComponentName}} error={{ message: 'Failed' }} />);
    expect(screen.getByTestId('button-retry')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const handleRetry = vi.fn();
    render(<{{ComponentName}} error={{ message: 'Failed' }} onRetry={handleRetry} />);
    await userEvent.click(screen.getByTestId('button-retry'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render main content when error is present', () => {
    render(<{{ComponentName}} error={{ message: 'Failed' }} data={{{testData}}} />);
    expect(screen.queryByTestId('{{contentTestId}}')).not.toBeInTheDocument();
  });
});`,
    assertions: [
      'expect(screen.getByText(errorMessage)).toBeInTheDocument()',
      'expect(screen.getByTestId("button-retry")).toBeInTheDocument()',
      'expect(handleRetry).toHaveBeenCalledTimes(1)',
      'expect(screen.queryByTestId(contentId)).not.toBeInTheDocument()',
    ],
    mocks: ['vi.fn() for onRetry handler'],
    useCases: [
      'Testing API failure error displays',
      'Verifying network error handling in components',
      'Testing form submission error states',
    ],
  },
  {
    id: 'user-registration-flow',
    name: 'User Registration Flow',
    category: 'e2e',
    description: 'Tests the complete user registration process end-to-end',
    keywords: ['registration', 'signup', 'onboarding', 'user', 'flow'],
    framework: 'vitest',
    testType: 'e2e',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('User Registration Flow', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should complete registration successfully', async () => {
    await page.goto('{{baseUrl}}/register');
    await page.fill('[data-testid="input-name"]', '{{testName}}');
    await page.fill('[data-testid="input-email"]', '{{testEmail}}');
    await page.fill('[data-testid="input-password"]', '{{testPassword}}');
    await page.fill('[data-testid="input-confirm-password"]', '{{testPassword}}');
    await page.click('[data-testid="button-submit"]');
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  it('should show validation errors for weak password', async () => {
    await page.goto('{{baseUrl}}/register');
    await page.fill('[data-testid="input-password"]', '123');
    await page.click('[data-testid="button-submit"]');
    const error = await page.textContent('[data-testid="text-password-error"]');
    expect(error).toBeTruthy();
  });

  it('should prevent duplicate email registration', async () => {
    await page.goto('{{baseUrl}}/register');
    await page.fill('[data-testid="input-email"]', '{{existingEmail}}');
    await page.fill('[data-testid="input-password"]', '{{testPassword}}');
    await page.click('[data-testid="button-submit"]');
    const error = await page.textContent('[data-testid="text-error-message"]');
    expect(error).toContain('already exists');
  });
});`,
    assertions: [
      'expect(page.url()).toContain("/dashboard")',
      'expect(error).toBeTruthy()',
      'expect(error).toContain("already exists")',
      'expect(await page.isVisible(selector)).toBe(true)',
    ],
    setupCode: `let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});`,
    teardownCode: `afterAll(async () => {
  await browser.close();
});`,
    useCases: [
      'Testing user signup flows',
      'Verifying onboarding wizard completion',
      'Testing social auth registration',
    ],
  },
  {
    id: 'crud-workflow',
    name: 'CRUD Workflow Test',
    category: 'e2e',
    description: 'Tests create, read, update, and delete operations end-to-end',
    keywords: ['crud', 'create', 'read', 'update', 'delete', 'workflow'],
    framework: 'vitest',
    testType: 'e2e',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('{{ResourceName}} CRUD Workflow', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('{{baseUrl}}');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should create a new {{resourceName}}', async () => {
    await page.click('[data-testid="button-create-{{resourceName}}"]');
    await page.fill('[data-testid="input-{{fieldName}}"]', '{{testValue}}');
    await page.click('[data-testid="button-submit"]');
    await page.waitForSelector('[data-testid="text-{{resourceName}}-title"]');
    const title = await page.textContent('[data-testid="text-{{resourceName}}-title"]');
    expect(title).toContain('{{testValue}}');
  });

  it('should read and display {{resourceName}} details', async () => {
    await page.click('[data-testid="card-{{resourceName}}-1"]');
    await page.waitForSelector('[data-testid="text-{{resourceName}}-detail"]');
    const detail = await page.textContent('[data-testid="text-{{resourceName}}-detail"]');
    expect(detail).toBeTruthy();
  });

  it('should update an existing {{resourceName}}', async () => {
    await page.click('[data-testid="button-edit-{{resourceName}}"]');
    await page.fill('[data-testid="input-{{fieldName}}"]', '{{updatedValue}}');
    await page.click('[data-testid="button-submit"]');
    const updated = await page.textContent('[data-testid="text-{{resourceName}}-title"]');
    expect(updated).toContain('{{updatedValue}}');
  });

  it('should delete a {{resourceName}}', async () => {
    await page.click('[data-testid="button-delete-{{resourceName}}"]');
    await page.click('[data-testid="button-confirm-delete"]');
    await page.waitForTimeout(500);
    const items = await page.$$('[data-testid^="card-{{resourceName}}"]');
    expect(items.length).toBeGreaterThanOrEqual(0);
  });
});`,
    assertions: [
      'expect(title).toContain(testValue)',
      'expect(detail).toBeTruthy()',
      'expect(updated).toContain(updatedValue)',
      'expect(items.length).toBeGreaterThanOrEqual(0)',
    ],
    setupCode: `let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto(baseUrl);
});`,
    teardownCode: `afterAll(async () => {
  await browser.close();
});`,
    useCases: [
      'Testing product management in admin panels',
      'Verifying blog post CRUD operations',
      'Testing task/ticket management workflows',
    ],
  },
  {
    id: 'search-and-filter',
    name: 'Search and Filter Test',
    category: 'e2e',
    description: 'Tests search functionality with filtering and result validation',
    keywords: ['search', 'filter', 'query', 'results', 'sort'],
    framework: 'vitest',
    testType: 'e2e',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('Search and Filter', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('{{baseUrl}}/{{listPage}}');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should return results matching search query', async () => {
    await page.fill('[data-testid="input-search"]', '{{searchTerm}}');
    await page.waitForTimeout(300);
    const results = await page.$$('[data-testid^="card-result"]');
    expect(results.length).toBeGreaterThan(0);
    const firstResult = await results[0].textContent();
    expect(firstResult?.toLowerCase()).toContain('{{searchTerm}}'.toLowerCase());
  });

  it('should show empty state for no results', async () => {
    await page.fill('[data-testid="input-search"]', '{{noResultsTerm}}');
    await page.waitForTimeout(300);
    expect(await page.isVisible('[data-testid="text-no-results"]')).toBe(true);
  });

  it('should filter results by category', async () => {
    await page.click('[data-testid="select-category"]');
    await page.click('[data-testid="option-{{categoryValue}}"]');
    await page.waitForTimeout(300);
    const results = await page.$$('[data-testid^="card-result"]');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should clear filters and show all results', async () => {
    await page.click('[data-testid="button-clear-filters"]');
    await page.waitForTimeout(300);
    const results = await page.$$('[data-testid^="card-result"]');
    expect(results.length).toBeGreaterThan(0);
  });
});`,
    assertions: [
      'expect(results.length).toBeGreaterThan(0)',
      'expect(firstResult?.toLowerCase()).toContain(searchTerm)',
      'expect(await page.isVisible(emptySelector)).toBe(true)',
      'expect(results.length).toBeGreaterThan(0)',
    ],
    setupCode: `let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto(baseUrl);
});`,
    teardownCode: `afterAll(async () => {
  await browser.close();
});`,
    useCases: [
      'Testing product catalog search',
      'Verifying user directory filtering',
      'Testing document/file search functionality',
    ],
  },
  {
    id: 'navigation-flow',
    name: 'Navigation Flow Test',
    category: 'e2e',
    description: 'Tests page navigation, routing, and breadcrumb behavior',
    keywords: ['navigation', 'routing', 'breadcrumb', 'page', 'link', 'redirect'],
    framework: 'vitest',
    testType: 'e2e',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('Navigation Flow', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should navigate to home page', async () => {
    await page.goto('{{baseUrl}}');
    expect(page.url()).toContain('{{baseUrl}}');
    expect(await page.isVisible('[data-testid="{{homeTestId}}"]')).toBe(true);
  });

  it('should navigate between pages via sidebar', async () => {
    await page.click('[data-testid="link-{{targetPage}}"]');
    await page.waitForURL('**/{{targetPage}}');
    expect(page.url()).toContain('/{{targetPage}}');
  });

  it('should redirect unauthenticated users to login', async () => {
    await page.goto('{{baseUrl}}/{{protectedRoute}}');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  it('should preserve query parameters during navigation', async () => {
    await page.goto('{{baseUrl}}/{{listPage}}?filter={{filterValue}}');
    expect(page.url()).toContain('filter={{filterValue}}');
    const results = await page.$$('[data-testid^="card-result"]');
    expect(results.length).toBeGreaterThanOrEqual(0);
  });
});`,
    assertions: [
      'expect(page.url()).toContain(expectedPath)',
      'expect(await page.isVisible(selector)).toBe(true)',
      'expect(page.url()).toContain("/login")',
      'expect(page.url()).toContain("filter=")',
    ],
    setupCode: `let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});`,
    teardownCode: `afterAll(async () => {
  await browser.close();
});`,
    useCases: [
      'Testing multi-page app navigation',
      'Verifying protected route redirects',
      'Testing breadcrumb navigation paths',
    ],
  },
  {
    id: 'component-snapshot',
    name: 'Component Snapshot Test',
    category: 'snapshot',
    description: 'Captures and compares component render output snapshots',
    keywords: ['snapshot', 'render', 'component', 'regression', 'visual'],
    framework: 'vitest',
    testType: 'snapshot',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}} snapshots', () => {
  it('should match snapshot with default props', () => {
    const { container } = render(<{{ComponentName}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with custom props', () => {
    const { container } = render(
      <{{ComponentName}} {{customProps}} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot in loading state', () => {
    const { container } = render(<{{ComponentName}} isLoading={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match inline snapshot for key element', () => {
    const { getByTestId } = render(<{{ComponentName}} />);
    expect(getByTestId('{{keyTestId}}').textContent).toMatchInlineSnapshot();
  });
});`,
    assertions: [
      'expect(container.firstChild).toMatchSnapshot()',
      'expect(container.firstChild).toMatchInlineSnapshot()',
      'expect(element.textContent).toMatchSnapshot()',
    ],
    useCases: [
      'Regression testing UI component output',
      'Tracking visual changes in design system components',
    ],
  },
  {
    id: 'api-response-snapshot',
    name: 'API Response Snapshot Test',
    category: 'snapshot',
    description: 'Captures and compares API response structure snapshots',
    keywords: ['api', 'response', 'snapshot', 'schema', 'structure'],
    framework: 'vitest',
    testType: 'snapshot',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '{{appPath}}';

describe('API Response Snapshots', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    server.close();
  });

  it('should match snapshot for {{endpoint}} response structure', async () => {
    const res = await request(server).get('{{endpoint}}');
    const structure = Object.keys(res.body).sort();
    expect(structure).toMatchSnapshot();
  });

  it('should match snapshot for list response shape', async () => {
    const res = await request(server).get('{{listEndpoint}}');
    const firstItem = res.body.data?.[0];
    if (firstItem) {
      const shape = Object.keys(firstItem).sort();
      expect(shape).toMatchSnapshot();
    }
  });

  it('should match snapshot for error response format', async () => {
    const res = await request(server).get('{{invalidEndpoint}}');
    expect(res.body).toMatchSnapshot({
      message: expect.any(String),
      timestamp: expect.any(String),
    });
  });
});`,
    assertions: [
      'expect(structure).toMatchSnapshot()',
      'expect(shape).toMatchSnapshot()',
      'expect(res.body).toMatchSnapshot({ message: expect.any(String) })',
    ],
    setupCode: `let server: any;
beforeAll(async () => {
  server = app.listen(0);
});`,
    teardownCode: `afterAll(async () => {
  server.close();
});`,
    useCases: [
      'Tracking API contract changes',
      'Regression testing response schemas',
      'Verifying error response formats remain consistent',
    ],
  },
  {
    id: 'keyboard-navigation',
    name: 'Keyboard Navigation Test',
    category: 'accessibility',
    description: 'Tests keyboard-based navigation and focus management',
    keywords: ['keyboard', 'tab', 'focus', 'accessibility', 'a11y', 'navigation'],
    framework: 'vitest',
    testType: 'accessibility',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}} keyboard navigation', () => {
  it('should focus first interactive element on tab', async () => {
    render(<{{ComponentName}} />);
    await userEvent.tab();
    expect(screen.getByTestId('{{firstFocusableId}}')).toHaveFocus();
  });

  it('should navigate through elements with tab', async () => {
    render(<{{ComponentName}} />);
    await userEvent.tab();
    expect(screen.getByTestId('{{firstFocusableId}}')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByTestId('{{secondFocusableId}}')).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByTestId('{{thirdFocusableId}}')).toHaveFocus();
  });

  it('should activate button with Enter key', async () => {
    const { getByTestId } = render(<{{ComponentName}} />);
    const button = getByTestId('{{buttonTestId}}');
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByTestId('{{resultTestId}}')).toBeInTheDocument();
  });

  it('should close modal with Escape key', async () => {
    render(<{{ComponentName}} isOpen={true} />);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByTestId('{{modalTestId}}')).not.toBeInTheDocument();
  });

  it('should trap focus within modal', async () => {
    render(<{{ComponentName}} isOpen={true} />);
    const lastElement = screen.getByTestId('{{lastFocusableId}}');
    lastElement.focus();
    await userEvent.tab();
    expect(screen.getByTestId('{{firstFocusableId}}')).toHaveFocus();
  });
});`,
    assertions: [
      'expect(element).toHaveFocus()',
      'expect(screen.queryByTestId(id)).not.toBeInTheDocument()',
      'expect(element).toBeInTheDocument()',
      'expect(document.activeElement).toBe(expectedElement)',
    ],
    useCases: [
      'Testing modal focus trapping',
      'Verifying menu keyboard navigation',
      'Testing form field tab order',
    ],
  },
  {
    id: 'aria-attributes',
    name: 'ARIA Attributes Test',
    category: 'accessibility',
    description: 'Tests ARIA roles, labels, and attributes for accessibility compliance',
    keywords: ['aria', 'role', 'label', 'accessibility', 'a11y', 'screen-reader'],
    framework: 'vitest',
    testType: 'accessibility',
    codeTemplate: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { {{ComponentName}} } from '{{componentPath}}';

describe('{{ComponentName}} ARIA attributes', () => {
  it('should have correct role attribute', () => {
    render(<{{ComponentName}} />);
    expect(screen.getByRole('{{expectedRole}}')).toBeInTheDocument();
  });

  it('should have aria-label on interactive elements', () => {
    render(<{{ComponentName}} />);
    const element = screen.getByTestId('{{interactiveTestId}}');
    expect(element).toHaveAttribute('aria-label');
  });

  it('should update aria-expanded on toggle', async () => {
    const { getByTestId } = render(<{{ComponentName}} />);
    const trigger = getByTestId('{{triggerTestId}}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.click();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should associate labels with form inputs', () => {
    render(<{{ComponentName}} />);
    const input = screen.getByLabelText('{{labelText}}');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id');
  });

  it('should have aria-live region for dynamic content', () => {
    render(<{{ComponentName}} />);
    const liveRegion = screen.getByTestId('{{liveRegionTestId}}');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});`,
    assertions: [
      'expect(screen.getByRole(role)).toBeInTheDocument()',
      'expect(element).toHaveAttribute("aria-label")',
      'expect(element).toHaveAttribute("aria-expanded", "true")',
      'expect(screen.getByLabelText(label)).toBeInTheDocument()',
      'expect(element).toHaveAttribute("aria-live", "polite")',
    ],
    useCases: [
      'Testing form accessibility compliance',
      'Verifying dropdown/accordion ARIA states',
      'Testing alert and notification announcements',
    ],
  },
  {
    id: 'response-time',
    name: 'Response Time Test',
    category: 'performance',
    description: 'Tests API endpoint response times against acceptable thresholds',
    keywords: ['performance', 'response', 'time', 'latency', 'speed', 'benchmark'],
    framework: 'vitest',
    testType: 'performance',
    codeTemplate: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '{{appPath}}';

describe('Performance: Response Times', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    server.close();
  });

  it('should respond to {{endpoint}} within {{threshold}}ms', async () => {
    const start = performance.now();
    const res = await request(server).get('{{endpoint}}');
    const duration = performance.now() - start;
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan({{threshold}});
  });

  it('should handle concurrent requests within acceptable time', async () => {
    const concurrentRequests = Array.from({ length: {{concurrency}} }, () =>
      request(server).get('{{endpoint}}')
    );
    const start = performance.now();
    const responses = await Promise.all(concurrentRequests);
    const duration = performance.now() - start;
    responses.forEach(res => expect(res.status).toBe(200));
    expect(duration).toBeLessThan({{concurrentThreshold}});
  });

  it('should maintain performance under payload', async () => {
    const largePayload = { data: Array.from({ length: {{payloadSize}} }, (_, i) => ({ id: i, value: 'test' })) };
    const start = performance.now();
    const res = await request(server)
      .post('{{postEndpoint}}')
      .send(largePayload);
    const duration = performance.now() - start;
    expect(res.status).toBeLessThan(500);
    expect(duration).toBeLessThan({{payloadThreshold}});
  });

  it('should respond with consistent times across multiple calls', async () => {
    const times: number[] = [];
    for (let i = 0; i < {{iterations}}; i++) {
      const start = performance.now();
      await request(server).get('{{endpoint}}');
      times.push(performance.now() - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const maxDeviation = Math.max(...times) - Math.min(...times);
    expect(avg).toBeLessThan({{avgThreshold}});
    expect(maxDeviation).toBeLessThan({{deviationThreshold}});
  });
});`,
    assertions: [
      'expect(duration).toBeLessThan(threshold)',
      'expect(res.status).toBe(200)',
      'expect(avg).toBeLessThan(avgThreshold)',
      'expect(maxDeviation).toBeLessThan(deviationThreshold)',
      'expect(res.status).toBeLessThan(500)',
    ],
    setupCode: `let server: any;
beforeAll(async () => {
  server = app.listen(0);
});`,
    teardownCode: `afterAll(async () => {
  server.close();
});`,
    useCases: [
      'Benchmarking API endpoint latency',
      'Testing database query performance under load',
      'Verifying acceptable response times for critical paths',
    ],
  },
];
