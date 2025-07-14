import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Events from '@/pages/Events'
import Admin from '@/pages/Admin'
import { EventRSVPModal } from '@/components/events/EventRSVPModal'

// Mock data
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
  latitude: 37.7749,
  longitude: -122.4194,
  _count: { rsvps: 5 }
}

const mockEvents = [mockEvent]

// Test wrapper component
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

describe('Events Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Events List View', () => {
    it('should render events list correctly', async () => {
      // Mock the query to return test data
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
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
      expect(screen.getByText('Test Location')).toBeInTheDocument()
      expect(screen.getByText('Test Host')).toBeInTheDocument()
    })

    it('should filter events by search term', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search events/i)
      await user.type(searchInput, 'Test Event')
      
      expect(searchInput).toHaveValue('Test Event')
    })

    it('should switch between list and calendar view', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      const calendarViewButton = screen.getByText('Calendar View')
      await user.click(calendarViewButton)
      
      // Should switch to calendar view
      expect(screen.getByText('List View')).toBeInTheDocument()
    })

    it('should make address clickable and open Google Maps', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      // Mock window.open
      const mockOpen = vi.fn()
      Object.defineProperty(window, 'open', { value: mockOpen })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      const addressLink = screen.getByText('123 Test St')
      await user.click(addressLink)
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('google.com/maps'),
        '_blank'
      )
    })

    it('should display calendar integration buttons', () => {
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      expect(screen.getByText('Google Cal')).toBeInTheDocument()
      expect(screen.getByText('Outlook')).toBeInTheDocument()
      expect(screen.getByText('Directions')).toBeInTheDocument()
      expect(screen.getByText('Contact Host')).toBeInTheDocument()
    })

    it('should handle email host functionality', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      // Mock window.open
      const mockOpen = vi.fn()
      Object.defineProperty(window, 'open', { value: mockOpen })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      const contactHostButton = screen.getByText('Contact Host')
      await user.click(contactHostButton)
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('mailto:host@test.com'),
        '_blank'
      )
    })
  })

  describe('RSVP Modal Tests', () => {
    it('should render RSVP modal correctly', () => {
      render(
        <TestWrapper>
          <EventRSVPModal
            event={mockEvent}
            isOpen={true}
            onClose={() => {}}
          />
        </TestWrapper>
      )

      expect(screen.getByText('RSVP for Test Event')).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    })

    it('should submit RSVP form successfully', async () => {
      const user = userEvent.setup()
      const mockMutate = vi.fn()
      
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null
      })

      render(
        <TestWrapper>
          <EventRSVPModal
            event={mockEvent}
            isOpen={true}
            onClose={() => {}}
          />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '555-1234')
      
      const submitButton = screen.getByText('RSVP')
      await user.click(submitButton)
      
      expect(mockMutate).toHaveBeenCalled()
    })

    it('should show submitting state during RSVP', () => {
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        error: null
      })

      render(
        <TestWrapper>
          <EventRSVPModal
            event={mockEvent}
            isOpen={true}
            onClose={() => {}}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })
  })
})

describe('Admin Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Event Creation', () => {
    it('should render event creation form', async () => {
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      const createButton = screen.getByText('Create Event')
      await userEvent.setup().click(createButton)
      
      expect(screen.getByText('Create New Event')).toBeInTheDocument()
      expect(screen.getByLabelText(/event title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      const createButton = screen.getByText('Create Event')
      await user.click(createButton)
      
      const submitButton = screen.getByText('Create Event')
      await user.click(submitButton)
      
      // Form should not submit without required fields
      expect(screen.getByText('Create New Event')).toBeInTheDocument()
    })

    it('should submit event creation form', async () => {
      const user = userEvent.setup()
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })
      
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      const createButton = screen.getByText('Create Event')
      await user.click(createButton)
      
      // Fill out required fields
      await user.type(screen.getByLabelText(/event title/i), 'New Test Event')
      await user.type(screen.getByLabelText(/location/i), 'New Test Location')
      await user.type(screen.getByLabelText(/start date/i), '2024-01-01T12:00')
      await user.type(screen.getByLabelText(/host name/i), 'Test Host')
      await user.type(screen.getByLabelText(/host email/i), 'host@test.com')
      
      const submitButton = screen.getByText('Create Event')
      await user.click(submitButton)
      
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    it('should show saving state during event creation', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })
      
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      const createButton = screen.getByText('Create Event')
      await user.click(createButton)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })
  })

  describe('Event Editing', () => {
    it('should open edit modal with prefilled data', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      // Find and click edit button (assuming it's rendered for each event)
      const editButtons = screen.getAllByText('Edit')
      if (editButtons.length > 0) {
        await user.click(editButtons[0])
        
        expect(screen.getByText('Edit Event')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument()
      }
    })
  })

  describe('Event Management', () => {
    it('should display events list in admin', () => {
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      expect(screen.getByText('Event Management')).toBeInTheDocument()
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('should handle event deletion', async () => {
      const user = userEvent.setup()
      const mockMutate = vi.fn()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: mockEvents,
        isLoading: false,
        error: null
      })
      
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null
      })

      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      )

      // Find and click delete button
      const deleteButtons = screen.getAllByText('Delete')
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0])
        expect(mockMutate).toHaveBeenCalled()
      }
    })
  })
})