# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Configure environment variables
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... implement feature ...

# Run tests
npm test

# Run linting
npm run lint

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Avoid `any` type - use proper typing

#### React
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow React best practices

#### Styling
- Use Material-UI components
- Follow design system guidelines
- Implement responsive design
- Ensure accessibility compliance

### 3. Testing

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 4. API Development

#### Creating API Endpoints
```typescript
// services/api/endpoints.ts
export const documentApi = {
  getDocuments: (params: PaginationParams) =>
    api.get<Document[]>('/documents', { params }),
  
  createDocument: (data: CreateDocumentRequest) =>
    api.post<Document>('/documents', data),
};
```

#### Using API Hooks
```typescript
// components/DocumentList.tsx
import { useApiGet } from '../hooks/useApi';

export const DocumentList = () => {
  const { data, loading, error, execute } = useApiGet<Document[]>('/documents');
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {data?.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};
```

### 5. State Management

#### Redux Slices
```typescript
// store/slices/documentsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: PaginationParams) => {
    const response = await documentApi.getDocuments(params);
    return response.data;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    loading: false,
    error: null,
  },
  reducers: {
    // ... reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      });
  },
});
```

#### Using Redux in Components
```typescript
// components/DocumentList.tsx
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchDocuments } from '../store/slices/documentsSlice';

export const DocumentList = () => {
  const dispatch = useAppDispatch();
  const { documents, loading, error } = useAppSelector(state => state.documents);
  
  useEffect(() => {
    dispatch(fetchDocuments({ page: 1, limit: 20 }));
  }, [dispatch]);
  
  // ... component logic
};
```

### 6. Form Handling

#### Form with Validation
```typescript
// components/DocumentForm.tsx
import { useForm } from '../hooks/useForm';
import { documentSchemas } from '../core/validators';

export const DocumentForm = () => {
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      documentType: '',
    },
    validationSchema: documentSchemas.documentUpload,
    onSubmit: async (values) => {
      await documentApi.createDocument(values);
    },
  });
  
  return (
    <form onSubmit={form.submit}>
      <Input
        value={form.values.title}
        onChange={(e) => form.setValue('title', e.target.value)}
        error={form.errors.title}
        onBlur={() => form.setTouched('title')}
      />
      {/* ... other fields */}
      <Button type="submit" loading={form.isSubmitting}>
        Create Document
      </Button>
    </form>
  );
};
```

### 7. Error Handling

#### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import { ErrorBoundary } from './ErrorBoundary';

export const App = () => {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <ErrorFallback error={error} onRetry={retry} />
      )}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
};
```

#### API Error Handling
```typescript
// hooks/useApi.ts
export const useApi = <T>(apiFunction: () => Promise<T>) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error as Error;
      setState({ data: null, loading: false, error: apiError });
      throw apiError;
    }
  }, [apiFunction]);
  
  return { ...state, execute };
};
```

### 8. Performance Optimization

#### Memoization
```typescript
// components/ExpensiveComponent.tsx
import { memo, useMemo } from 'react';

export const ExpensiveComponent = memo(({ data, filter }) => {
  const filteredData = useMemo(() => {
    return data.filter(item => item.category === filter);
  }, [data, filter]);
  
  return (
    <div>
      {filteredData.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
});
```

#### Virtual Scrolling
```typescript
// components/VirtualList.tsx
import { useVirtualScroll } from '../hooks/useVirtualScroll';

export const VirtualList = ({ items }) => {
  const { visibleRange, totalHeight, offsetY, handleScroll } = useVirtualScroll({
    itemCount: items.length,
    itemHeight: 120,
    containerHeight: 400,
  });
  
  return (
    <div style={{ height: 400, overflow: 'auto' }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(visibleRange.startIndex, visibleRange.endIndex).map(renderItem)}
        </div>
      </div>
    </div>
  );
};
```

### 9. Accessibility

#### ARIA Implementation
```typescript
// components/Modal.tsx
export const Modal = ({ isOpen, onClose, children }) => {
  const { trapFocus } = useFocusManagement();
  
  useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('modal');
      if (modal) {
        return trapFocus(modal);
      }
    }
  }, [isOpen, trapFocus]);
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      id="modal"
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
    </div>
  );
};
```

#### Keyboard Navigation
```typescript
// components/Menu.tsx
export const Menu = ({ items }) => {
  const { activeIndex, handleKeyDown } = useKeyboardNavigation();
  
  return (
    <ul role="menu">
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={activeIndex === index ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, items)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

### 10. Testing Best Practices

#### Component Testing
```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
  
  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Hook Testing
```typescript
// __tests__/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

#### Integration Testing
```typescript
// __tests__/DocumentList.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { DocumentList } from '../DocumentList';

describe('DocumentList Integration', () => {
  it('should load and display documents', async () => {
    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });
  });
});
```

## Code Quality

### 1. Linting and Formatting
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Run Prettier
npm run format

# Check formatting
npm run format:check
```

### 2. Type Checking
```bash
# Run TypeScript compiler
npm run type-check

# Watch mode
npm run type-check:watch
```

### 3. Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## Debugging

### 1. Development Tools
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API request monitoring
- **Console**: Error logging and debugging

### 2. Error Tracking
```typescript
// utils/errorTracking.ts
export const trackError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    console.error('Error tracked:', error, context);
  } else {
    console.error('Development error:', error, context);
  }
};
```

### 3. Performance Monitoring
```typescript
// hooks/usePerformance.ts
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
};
```

## Deployment

### 1. Build Process
```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle
npm run analyze
```

### 2. Environment Configuration
```bash
# Production environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Rebuild
npm run build
```

#### 2. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update type definitions
npm update @types/react @types/react-dom
```

#### 3. Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run dev -- --inspect
```

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

### Best Practices
- [React Best Practices](https://reactjs.org/docs/thinking-in-react.html)
- [TypeScript Best Practices](https://typescript-eslint.io/docs/linting/typed-linting/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
