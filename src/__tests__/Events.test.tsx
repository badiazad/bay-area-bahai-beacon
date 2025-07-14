import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Events from '../pages/Events'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
  }))
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}))

// Mock React Query hooks
const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => mockUseQuery(),
  }
})

// Mock components
vi.mock('@/components/layout/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}))

vi.mock('@/components/events/EventCalendarView', () => ({
  EventCalendarView: ({ events, onEventSelect }: any) => (
    <div data-testid="calendar-view">
      Calendar View - {events?.length || 0} events
    </div>
  )
}))

vi.mock('@/components/events/EventRSVPModal', () => ({
  EventRSVPModal: ({ event, isOpen }: any) => 
    isOpen ? <div data-testid="rsvp-modal">RSVP Modal for {event?.title}</div> : null
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 1, 2024 at 12:00 PM')
}))

// Mock Lucide icons
const MockIcon = () => <span>Icon</span>
vi.mock('lucide-react', () => ({
  Search: MockIcon,
  Filter: MockIcon,
  LayoutGrid: MockIcon,
  Calendar: MockIcon,
  MapPin: MockIcon,
  Clock: MockIcon,
  Users: MockIcon,
  Mail: MockIcon,
  ChevronDown: MockIcon,
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const mockEvent = {
  id: 'test-event-1',
  title: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  address: '123 Test St',
  start_date: '2024-01-01T12:00:00Z',
  end_date: '2024-01-01T14:00:00Z',
  calendar_type: 'community_gathering',
  featured_image_url: 'test-image.jpg',
  host_name: 'Test Host',
  host_email: 'host@test.com',
  max_attendees: 50,
  tags: ['test'],
  status: 'published',
  latitude: 37.7749,
  longitude: -122.4194,
  _count: { rsvps: 5 }
}

describe('Events Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    expect(screen.getByText('Loading events...')).toBeInTheDocument()
  })

  it('should render events list when data is loaded', () => {
    mockUseQuery.mockReturnValue({
      data: [mockEvent],
      isLoading: false,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    expect(screen.getByText('Community Events')).toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
  })

  it('should handle empty events list', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    expect(screen.getByText('Community Events')).toBeInTheDocument()
    expect(screen.getByText('No events found matching your criteria.')).toBeInTheDocument()
  })

  it('should handle error state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch events')
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    // Should still show the page structure
    expect(screen.getByText('Community Events')).toBeInTheDocument()
  })

  it('should render all event card elements', () => {
    mockUseQuery.mockReturnValue({
      data: [mockEvent],
      isLoading: false,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    // Check all important elements are present
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
    expect(screen.getByText('Host: Test Host')).toBeInTheDocument()
    expect(screen.getByText('RSVP')).toBeInTheDocument()
    expect(screen.getByText('Google Cal')).toBeInTheDocument()
    expect(screen.getByText('Outlook')).toBeInTheDocument()
    expect(screen.getByText('Directions')).toBeInTheDocument()
    expect(screen.getByText('Contact Host')).toBeInTheDocument()
  })

  it('should render search and filter controls', () => {
    mockUseQuery.mockReturnValue({
      data: [mockEvent],
      isLoading: false,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    expect(screen.getByPlaceholderText('Search events, locations, or descriptions...')).toBeInTheDocument()
    expect(screen.getByText('List View')).toBeInTheDocument()
    expect(screen.getByText('Calendar View')).toBeInTheDocument()
  })

  it('should handle events without optional fields', () => {
    const minimalEvent = {
      ...mockEvent,
      description: null,
      address: null,
      featured_image_url: null,
      tags: null,
      _count: { rsvps: 0 }
    }

    mockUseQuery.mockReturnValue({
      data: [minimalEvent],
      isLoading: false,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
    // Should not crash when optional fields are missing
  })

  it('should call supabase query with correct parameters', () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
    }
    
    mockSupabase.from.mockReturnValue(mockQuery)
    
    mockUseQuery.mockReturnValue({
      data: [mockEvent],
      isLoading: false,
      error: null
    })

    render(
      <TestWrapper>
        <Events />
      </TestWrapper>
    )

    // Verify supabase.from was called with 'events'
    expect(mockSupabase.from).toHaveBeenCalledWith('events')
  })
})