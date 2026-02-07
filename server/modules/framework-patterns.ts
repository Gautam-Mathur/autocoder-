// Framework Patterns Library - Expanded templates for multiple languages and frameworks
// This gives AutoCoder breadth across many technologies

export interface FrameworkPattern {
  id: string;
  name: string;
  language: string;
  framework: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'utility';
  description: string;
  template: string;
  dependencies?: string[];
}

// React Patterns
export const REACT_PATTERNS: FrameworkPattern[] = [
  {
    id: 'react-hook-form',
    name: 'Form with Validation',
    language: 'typescript',
    framework: 'react',
    category: 'frontend',
    description: 'Form component with validation using controlled inputs',
    template: `import { useState } from 'react';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="mt-1 w-full px-3 py-2 border rounded-md"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}`,
  },
  {
    id: 'react-data-fetching',
    name: 'Data Fetching Hook',
    language: 'typescript',
    framework: 'react',
    category: 'frontend',
    description: 'Custom hook for data fetching with loading and error states',
    template: `import { useState, useEffect, useCallback } from 'react';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useData<T>(url: string): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Usage example:
// const { data, loading, error, refetch } = useData<User[]>('/api/users');`,
  },
  {
    id: 'react-modal',
    name: 'Modal Component',
    language: 'typescript',
    framework: 'react',
    category: 'frontend',
    description: 'Accessible modal dialog with animations',
    template: `import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-fade-in"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'react-infinite-scroll',
    name: 'Infinite Scroll List',
    language: 'typescript',
    framework: 'react',
    category: 'frontend',
    description: 'Virtualized infinite scroll list for large datasets',
    template: `import { useState, useEffect, useRef, useCallback } from 'react';

interface Item {
  id: number;
  title: string;
}

interface UseInfiniteScrollProps {
  fetchData: (page: number) => Promise<Item[]>;
  pageSize?: number;
}

export function useInfiniteScroll({ fetchData, pageSize = 20 }: UseInfiniteScrollProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newItems = await fetchData(page);
      setItems(prev => [...prev, ...newItems]);
      setHasMore(newItems.length === pageSize);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, loading, hasMore, pageSize]);

  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore]);

  useEffect(() => {
    loadMore();
  }, []);

  return { items, loading, hasMore, lastItemRef };
}

// Component usage:
export function InfiniteList() {
  const fetchItems = async (page: number): Promise<Item[]> => {
    const res = await fetch(\`/api/items?page=\${page}\`);
    return res.json();
  };

  const { items, loading, lastItemRef } = useInfiniteScroll({ fetchData: fetchItems });

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={item.id}
          ref={i === items.length - 1 ? lastItemRef : null}
          className="p-4 bg-white dark:bg-gray-800 rounded shadow"
        >
          {item.title}
        </div>
      ))}
      {loading && <div className="text-center py-4">Loading...</div>}
    </div>
  );
}`,
  },
];

// Python/FastAPI Patterns
export const PYTHON_PATTERNS: FrameworkPattern[] = [
  {
    id: 'fastapi-crud',
    name: 'FastAPI CRUD API',
    language: 'python',
    framework: 'fastapi',
    category: 'backend',
    description: 'Complete CRUD API with FastAPI and Pydantic',
    template: `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4

app = FastAPI(title="API", version="1.0.0")

# Models
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: str
    
    class Config:
        from_attributes = True

# In-memory storage (replace with database)
items_db: dict[str, Item] = {}

# Routes
@app.get("/items", response_model=List[Item])
async def get_items():
    return list(items_db.values())

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.post("/items", response_model=Item, status_code=201)
async def create_item(item: ItemCreate):
    item_id = str(uuid4())
    db_item = Item(id=item_id, **item.dict())
    items_db[item_id] = db_item
    return db_item

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: str, item: ItemCreate):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item = Item(id=item_id, **item.dict())
    items_db[item_id] = db_item
    return db_item

@app.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]`,
    dependencies: ['fastapi', 'uvicorn', 'pydantic'],
  },
  {
    id: 'fastapi-auth',
    name: 'FastAPI JWT Authentication',
    language: 'python',
    framework: 'fastapi',
    category: 'backend',
    description: 'JWT authentication with password hashing',
    template: `from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    username: str
    email: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Fake users DB
fake_users_db = {
    "testuser": {
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": pwd_context.hash("testpass"),
        "disabled": False,
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str) -> Optional[UserInDB]:
    if username in fake_users_db:
        return UserInDB(**fake_users_db[username])
    return None

def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = get_user(username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user`,
    dependencies: ['fastapi', 'python-jose', 'passlib', 'bcrypt'],
  },
];

// Go/Gin Patterns
export const GO_PATTERNS: FrameworkPattern[] = [
  {
    id: 'go-gin-api',
    name: 'Gin REST API',
    language: 'go',
    framework: 'gin',
    category: 'backend',
    description: 'REST API with Gin framework',
    template: `package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Item struct {
	ID          string  \`json:"id"\`
	Name        string  \`json:"name" binding:"required"\`
	Description string  \`json:"description"\`
	Price       float64 \`json:"price" binding:"required,gt=0"\`
}

var items = make(map[string]Item)

func main() {
	r := gin.Default()
	
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Routes
	r.GET("/items", getItems)
	r.GET("/items/:id", getItem)
	r.POST("/items", createItem)
	r.PUT("/items/:id", updateItem)
	r.DELETE("/items/:id", deleteItem)

	r.Run(":8080")
}

func getItems(c *gin.Context) {
	itemList := make([]Item, 0, len(items))
	for _, item := range items {
		itemList = append(itemList, item)
	}
	c.JSON(http.StatusOK, itemList)
}

func getItem(c *gin.Context) {
	id := c.Param("id")
	if item, ok := items[id]; ok {
		c.JSON(http.StatusOK, item)
		return
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
}

func createItem(c *gin.Context) {
	var item Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.ID = uuid.New().String()
	items[item.ID] = item
	c.JSON(http.StatusCreated, item)
}

func updateItem(c *gin.Context) {
	id := c.Param("id")
	if _, ok := items[id]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	var item Item
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.ID = id
	items[id] = item
	c.JSON(http.StatusOK, item)
}

func deleteItem(c *gin.Context) {
	id := c.Param("id")
	if _, ok := items[id]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	delete(items, id)
	c.Status(http.StatusNoContent)
}`,
    dependencies: ['github.com/gin-gonic/gin', 'github.com/google/uuid'],
  },
];

// Utility Patterns
export const UTILITY_PATTERNS: FrameworkPattern[] = [
  {
    id: 'debounce',
    name: 'Debounce Function',
    language: 'typescript',
    framework: 'vanilla',
    category: 'utility',
    description: 'Debounce function for limiting rapid calls',
    template: `export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// Usage:
// const debouncedSearch = debounce((query: string) => search(query), 300);`,
  },
  {
    id: 'throttle',
    name: 'Throttle Function',
    language: 'typescript',
    framework: 'vanilla',
    category: 'utility',
    description: 'Throttle function for rate limiting',
    template: `export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Usage:
// const throttledScroll = throttle(() => updatePosition(), 100);`,
  },
  {
    id: 'local-storage',
    name: 'Type-safe LocalStorage',
    language: 'typescript',
    framework: 'vanilla',
    category: 'utility',
    description: 'Type-safe wrapper for localStorage',
    template: `export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};

// Usage:
// storage.set('user', { name: 'John', id: 1 });
// const user = storage.get<{ name: string; id: number }>('user', { name: '', id: 0 });`,
  },
  {
    id: 'format-helpers',
    name: 'Formatting Helpers',
    language: 'typescript',
    framework: 'vanilla',
    category: 'utility',
    description: 'Common formatting utilities',
    template: `export const formatters = {
  currency(amount: number, currency = 'USD', locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },

  number(value: number, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(value);
  },

  date(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  relativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return this.date(d);
    if (days > 0) return \`\${days}d ago\`;
    if (hours > 0) return \`\${hours}h ago\`;
    if (minutes > 0) return \`\${minutes}m ago\`;
    return 'just now';
  },

  truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + '...' : str;
  },

  slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
};`,
  },
];

// CSS Patterns
export const CSS_PATTERNS: FrameworkPattern[] = [
  {
    id: 'css-grid-layouts',
    name: 'Responsive Grid System',
    language: 'css',
    framework: 'vanilla',
    category: 'frontend',
    description: 'Flexible responsive grid layouts',
    template: `.grid {
  display: grid;
  gap: var(--gap, 1rem);
}

.grid-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(var(--min-col-width, 250px), 1fr));
}

.grid-auto-fill {
  grid-template-columns: repeat(auto-fill, minmax(var(--min-col-width, 250px), 1fr));
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-3, .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}`,
  },
  {
    id: 'css-animations',
    name: 'Animation Library',
    language: 'css',
    framework: 'vanilla',
    category: 'frontend',
    description: 'Reusable CSS animations',
    template: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
.animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
.animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
.animate-slide-in-left { animation: slideInLeft 0.5s ease-out forwards; }
.animate-slide-in-right { animation: slideInRight 0.5s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
.animate-bounce { animation: bounce 1s ease-in-out infinite; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
.animate-spin { animation: spin 1s linear infinite; }

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}`,
  },
];

// Get all patterns
export function getAllPatterns(): FrameworkPattern[] {
  return [
    ...REACT_PATTERNS,
    ...PYTHON_PATTERNS,
    ...GO_PATTERNS,
    ...UTILITY_PATTERNS,
    ...CSS_PATTERNS,
  ];
}

// Find patterns by criteria
export function findPatterns(criteria: {
  language?: string;
  framework?: string;
  category?: string;
  search?: string;
}): FrameworkPattern[] {
  let patterns = getAllPatterns();
  
  if (criteria.language) {
    patterns = patterns.filter(p => p.language === criteria.language);
  }
  if (criteria.framework) {
    patterns = patterns.filter(p => p.framework === criteria.framework);
  }
  if (criteria.category) {
    patterns = patterns.filter(p => p.category === criteria.category);
  }
  if (criteria.search) {
    const search = criteria.search.toLowerCase();
    patterns = patterns.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.id.includes(search)
    );
  }
  
  return patterns;
}

// Get pattern by ID
export function getPattern(id: string): FrameworkPattern | undefined {
  return getAllPatterns().find(p => p.id === id);
}
