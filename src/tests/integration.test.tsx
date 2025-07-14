import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import Events from '@/pages/Events'
import Admin from '@/pages/Admin'

// Integration tests that test the full flow
describe('Events Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  describe('RSVP Flow Integration', () => {
    it('should complete full RSVP flow without errors', async () => {
      const user = userEvent.setup()
      
      // Mock successful API responses
      const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: 'rsvp-1' }], error: null })
      const mockInvoke = vi.fn().mockResolvedValue({ data: { success: true }, error: null })
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      } as any)
      
      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: [{
          id: 'test-event',
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
          _count: { rsvps: 0 }
        }],
        isLoading: false,
        error: null
      })

      let mockMutate = vi.fn()
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null
      })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      // Click RSVP button
      const rsvpButton = screen.getByText('RSVP')
      await user.click(rsvpButton)

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('RSVP for Test Event')).toBeInTheDocument()
      })

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '555-1234')
      await user.type(screen.getByLabelText(/guests/i), '2')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /rsvp/i })
      await user.click(submitButton)

      // Verify mutation was called
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        guest_count: 2,
        notes: '',
        reminder_email: true,
        reminder_sms: false
      })
    })
  })

  describe('Event Creation Flow Integration', () => {
    it('should complete full event creation flow', async () => {
      const user = userEvent.setup()
      
      // Mock successful API responses
      const mockInsert = vi.fn().mockResolvedValue({ 
        data: [{ id: 'new-event', title: 'New Event' }], 
        error: null 
      })
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      } as any)

      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      })

      let mockMutateAsync = vi.fn().mockResolvedValue({})
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

      // Click create event button
      const createButton = screen.getByText('Create Event')
      await user.click(createButton)

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText('Create New Event')).toBeInTheDocument()
      })

      // Fill out required fields
      await user.type(screen.getByLabelText(/event title/i), 'Integration Test Event')
      await user.type(screen.getByLabelText(/location/i), 'Test Location')
      await user.type(screen.getByLabelText(/start date/i), '2024-12-01T10:00')
      await user.type(screen.getByLabelText(/host name/i), 'Test Host')
      await user.type(screen.getByLabelText(/host email/i), 'host@test.com')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create event/i })
      await user.click(submitButton)

      // Verify mutation was called
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Integration Test Event',
          location: 'Test Location',
          host_name: 'Test Host',
          host_email: 'host@test.com'
        })
      )
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error')
      })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      // Should still render the page structure
      expect(screen.getByText('Community Events')).toBeInTheDocument()
    })

    it('should handle RSVP submission errors', async () => {
      const user = userEvent.setup()
      
      vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValue({
        data: [{
          id: 'test-event',
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
          _count: { rsvps: 0 }
        }],
        isLoading: false,
        error: null
      })

      const mockMutate = vi.fn()
      vi.mocked(require('@tanstack/react-query').useMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: new Error('RSVP failed')
      })

      render(
        <TestWrapper>
          <Events />
        </TestWrapper>
      )

      const rsvpButton = screen.getByText('RSVP')
      await user.click(rsvpButton)

      await waitFor(() => {
        expect(screen.getByText('RSVP for Test Event')).toBeInTheDocument()
      })

      // Form should still be functional even with error state
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })
  })
})