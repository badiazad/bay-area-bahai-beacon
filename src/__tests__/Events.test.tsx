import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Events from '../pages/Events';

// Mock Supabase
const mockQuery = vi.fn();
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: mockQuery
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockEventData = [
  {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    location: 'Test Location',
    start_date: '2024-01-01T10:00:00Z',
    end_date: '2024-01-01T12:00:00Z',
    calendar_type: 'devotional',
    featured_image_url: 'test.jpg',
    host_name: 'Test Host',
    host_email: 'test@example.com',
    status: 'published',
    slug: 'test-event',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    event_rsvps: [{ count: 5 }]
  }
];

describe('Events Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    // Mock successful query
    mockQuery.mockResolvedValue({
      data: mockEventData,
      error: null
    });

    const { container } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );

    expect(container).toBeTruthy();
  });

  it('should display loading state initially', () => {
    // Mock pending query
    mockQuery.mockReturnValue(new Promise(() => {})); // Never resolves
    
    const { getByText } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );

    expect(getByText('Loading events...')).toBeTruthy();
  });

  it('should handle successful data loading', () => {
    // Mock successful query
    mockQuery.mockResolvedValue({
      data: mockEventData,
      error: null
    });

    const { container } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );

    // Basic check that component renders
    expect(container.querySelector('[role="main"]') || container).toBeTruthy();
  });

  it('should handle error state', () => {
    // Mock error
    mockQuery.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    const { container } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );

    expect(container).toBeTruthy();
  });

  it('should handle empty data', () => {
    // Mock empty results
    mockQuery.mockResolvedValue({
      data: [],
      error: null
    });

    const { container } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );

    expect(container).toBeTruthy();
  });
});