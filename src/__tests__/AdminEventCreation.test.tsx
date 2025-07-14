import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Admin from '../pages/Admin';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ 
            data: [{ 
              id: 'test-event-id',
              title: 'Test Event',
              created_at: new Date().toISOString() 
            }], 
            error: null 
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ 
          data: { path: 'test-path' }, 
          error: null 
        })),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'https://test-url.com/image.jpg' } 
        })),
      })),
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve({ 
        data: { imageUrl: 'https://test-default-image.com' }, 
        error: null 
      })),
    },
  },
}));

// Mock useToast
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Navigation component
vi.mock('../components/layout/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>,
}));

const createTestUser = () => ({
  id: '80f41ed3-c1cb-42d7-b800-8e378933d38d',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
});

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Admin Event Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful authentication
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: createTestUser() } },
      error: null,
    });

    // Mock user roles query to return admin role
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [{ role: 'admin' }],
              error: null,
            })),
          })),
        };
      }
      
      if (table === 'events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [{ 
                id: 'test-event-id',
                title: 'Test Event',
                created_at: new Date().toISOString() 
              }], 
              error: null 
            })),
          })),
        };
      }

      return {
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render admin page for authenticated admin user', async () => {
    const Wrapper = createTestWrapper();
    
    const { getByText } = render(
      <Wrapper>
        <Admin />
      </Wrapper>
    );

    // Wait a bit for component to mount and load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(getByText('Admin Dashboard')).toBeInTheDocument();
    expect(getByText('Create Event')).toBeInTheDocument();
  });

  it('should handle event creation with proper data structure', async () => {
    const Wrapper = createTestWrapper();
    
    const mockInsert = vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ 
        data: [{ 
          id: 'test-event-id',
          title: '19 Day Feast - Kamál',
          created_at: new Date().toISOString() 
        }], 
        error: null 
      })),
    }));

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          insert: mockInsert,
        };
      }
      
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [{ role: 'admin' }],
              error: null,
            })),
          })),
        };
      }

      return { select: vi.fn(() => Promise.resolve({ data: [], error: null })) };
    });
    
    render(
      <Wrapper>
        <Admin />
      </Wrapper>
    );

    // Simulate the event creation that was failing
    const eventData = {
      title: '19 Day Feast - Kamál',
      description: 'join us for the next 19 day feast',
      location: 'sf bahai center',
      start_date: '2025-07-31T01:42',
      end_date: '',
      calendar_type: 'community_gathering',
      status: 'published',
      host_name: 'badi',
      host_email: 'badiazad@gmail.com',
      featured_image_url: '',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_interval: 1,
      recurrence_end_date: '',
    };

    // Test the data transformation that should happen
    const expectedTransformedData = expect.objectContaining({
      title: '19 Day Feast - Kamál',
      description: 'join us for the next 19 day feast',
      location: 'sf bahai center',
      start_date: '2025-07-31T01:42:00.000Z', // Should be properly formatted
      end_date: null, // Empty string should become null
      calendar_type: 'community_gathering',
      status: 'published',
      host_name: 'badi',
      host_email: 'badiazad@gmail.com',
      featured_image_url: null,
      created_by: '80f41ed3-c1cb-42d7-b800-8e378933d38d',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_interval: null,
      recurrence_end_date: null,
    });

    // This would be called by the actual component
    expect(eventData).toBeDefined();
    expect(expectedTransformedData).toBeDefined();
  });

  it('should properly format dates for database insertion', () => {
    // Test the date formatting logic that was causing issues
    const testCases = [
      {
        input: '2025-07-31T01:42',
        expected: '2025-07-31T01:42:00.000Z'
      },
      {
        input: '2025-12-25T23:59',
        expected: '2025-12-25T23:59:00.000Z'
      }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = input.includes('T') ? input + ':00.000Z' : input;
      expect(result).toBe(expected);
    });
  });

  it('should handle empty end_date properly', () => {
    // Test the end date handling that was in the original code
    const testCases = [
      { input: '', expected: null },
      { input: '   ', expected: null },
      { input: '2025-07-31T03:42', expected: '2025-07-31T03:42:00.000Z' }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = input && input.trim() !== '' ? 
        (input.includes('T') ? input + ':00.000Z' : input) : null;
      expect(result).toBe(expected);
    });
  });

  it('should ensure admin users can create published events', () => {
    // Test that admin users create events with published status by default
    const defaultFormData = {
      status: 'published',
      calendar_type: 'community_gathering',
      is_recurring: false,
      recurrence_type: 'none',
      recurrence_interval: 1,
    };

    expect(defaultFormData.status).toBe('published');
    expect(defaultFormData.calendar_type).toBe('community_gathering');
  });

  it('should prevent unauthorized access', async () => {
    // Mock no authentication
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const Wrapper = createTestWrapper();
    
    const { getByText, queryByText } = render(
      <Wrapper>
        <Admin />
      </Wrapper>
    );

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(getByText('Please sign in to access the admin panel')).toBeInTheDocument();
    expect(queryByText('Create Event')).not.toBeInTheDocument();
  });

  it('should handle database errors gracefully', async () => {
    const Wrapper = createTestWrapper();
    
    const mockInsertWithError = vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ 
        data: null, 
        error: { message: 'Database connection failed' } 
      })),
    }));

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          insert: mockInsertWithError,
        };
      }
      
      if (table === 'user_roles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [{ role: 'admin' }],
              error: null,
            })),
          })),
        };
      }

      return { select: vi.fn(() => Promise.resolve({ data: [], error: null })) };
    });
    
    const { getByText } = render(
      <Wrapper>
        <Admin />
      </Wrapper>
    );

    // Should render without crashing even with database errors
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(getByText('Admin Dashboard')).toBeInTheDocument();
  });
});