import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Events from '@/pages/Events';

// Mock Supabase
const mockQuery = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            then: mockQuery
          })
        })
      })
    })
  }
}));

// Mock Navigation component
vi.mock('@/components/layout/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}));

// Mock child components
vi.mock('@/components/events/EventCalendarView', () => ({
  EventCalendarView: ({ events }: any) => (
    <div data-testid="calendar-view">Calendar with {events.length} events</div>
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

const mockEventData = [
  {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    location: 'Test Location',
    start_date: '2024-12-01T10:00:00Z',
    end_date: '2024-12-01T11:00:00Z',
    calendar_type: 'devotional',
    featured_image_url: '',
    host_name: 'Test Host',
    host_email: 'test@example.com',
    status: 'published',
    slug: 'test-event',
    created_at: '2024-01-01T10:00:00Z',
    created_by: 'user-123',
    _count: { rsvps: 5 }
  }
];

describe('Events Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders without crashing', () => {
    mockQuery.mockResolvedValue({ data: [], error: null });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockQuery.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
    expect(screen.getByText('Fetching community events from database...')).toBeInTheDocument();
  });

  it('displays events when data loads successfully', async () => {
    mockQuery.mockResolvedValue({ data: mockEventData, error: null });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Community Events')).toBeInTheDocument();
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    const errorMessage = 'Network error';
    mockQuery.mockResolvedValue({ 
      data: null, 
      error: { message: errorMessage } 
    });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load events')).toBeInTheDocument();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('displays empty state when no events exist', async () => {
    mockQuery.mockResolvedValue({ data: [], error: null });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No events found matching your criteria.')).toBeInTheDocument();
    });
  });

  it('handles timeout errors specifically', async () => {
    mockQuery.mockResolvedValue({ 
      data: null, 
      error: { message: 'Request timeout occurred' } 
    });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('The request timed out. Please try again.')).toBeInTheDocument();
    });
  });

  it('switches between list and calendar view', async () => {
    mockQuery.mockResolvedValue({ data: mockEventData, error: null });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
    
    // Switch to calendar view
    const calendarViewButton = screen.getByText('Calendar View');
    calendarViewButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    });
  });

  it('filters events by search term', async () => {
    mockQuery.mockResolvedValue({ data: mockEventData, error: null });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search events, locations, or descriptions...')).toBeInTheDocument();
    });
  });

  it('displays RSVP count correctly', async () => {
    mockQuery.mockResolvedValue({ data: mockEventData, error: null });
    
    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('5 RSVPs')).toBeInTheDocument();
    });
  });
});