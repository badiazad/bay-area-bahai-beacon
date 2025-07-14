import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user-id', 
              email: 'test@example.com' 
            } 
          } 
        } 
      }),
      getUser: vi.fn().mockResolvedValue({ 
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          } 
        } 
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: [], error: null })
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { imageUrl: 'test-image-url' }, error: null })
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
      }))
    }
  }
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useMutation: vi.fn(() => ({ 
    mutate: vi.fn(), 
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false 
  })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: any) => children
}))

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  BrowserRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ children }: any) => children,
  Link: ({ children, to }: any) => children
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => 'Jan 1, 2024 at 12:00 PM')
}))

// Mock Lucide icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) => null
  return new Proxy({}, {
    get: () => MockIcon
  })
})

// Mock Toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() }))
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light', setTheme: vi.fn() })),
  ThemeProvider: ({ children }: any) => children
}))

// Global mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Google Maps
Object.defineProperty(window, 'google', {
  value: {
    maps: {
      places: {
        Autocomplete: vi.fn().mockImplementation(() => ({
          addListener: vi.fn(),
          getPlace: vi.fn().mockReturnValue({
            name: 'Test Place',
            formatted_address: 'Test Address'
          })
        }))
      }
    }
  }
})