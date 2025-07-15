import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Events from '@/pages/Events';

// Mock Supabase with simplified query interface
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}));

// Mock Navigation component
vi.mock('@/components/layout/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}));

// Mock child components
vi.mock('@/components/events/EventCalendarView', () => ({
  EventCalendarView: ({ events }: any) => (
    <div data-testid="calendar-view">Calendar with {events?.length || 0} events</div>
  )
}));

vi.mock('@/components/events/EventDetailsDialog', () => ({
  EventDetailsDialog: () => <div data-testid="event-details-dialog">Event Details</div>
}));

vi.mock('@/components/events/EventRSVPModal', () => ({
  EventRSVPModal: () => <div data-testid="event-rsvp-modal">RSVP Modal</div>
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
};

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

describe('Events Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    expect(getByTestId('navigation')).toBeDefined();
  });

  it('displays loading state initially', () => {
    const { getByText } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    expect(getByText('Loading events...')).toBeDefined();
  });

  it('has search and filter functionality', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    expect(getByPlaceholderText('Search events, locations, or descriptions...')).toBeDefined();
  });

  it('has view toggle buttons', () => {
    const { getByText } = render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    expect(getByText('List View')).toBeDefined();
    expect(getByText('Calendar View')).toBeDefined();
  });
});