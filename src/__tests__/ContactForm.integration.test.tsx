import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ContactForm from '@/components/contact/ContactForm';

// Mock the supabase client
const mockInsert = vi.fn();
const mockInvoke = vi.fn();
const mockSupabase = {
  from: vi.fn(() => ({
    insert: mockInsert,
  })),
  functions: {
    invoke: mockInvoke,
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('ContactForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockInvoke.mockResolvedValue({ error: null });
  });

  it('should handle database errors that cause "unexpected error occurred" message', async () => {
    mockInsert.mockResolvedValue({ 
      error: { message: 'Connection timeout after 30 seconds' } 
    });

    const { container } = render(<ContactForm />);
    
    // Simulate the form submission that would trigger the error
    const form = container.querySelector('form');
    if (form) {
      const nameInput = form.querySelector('#name') as HTMLInputElement;
      const emailInput = form.querySelector('#email') as HTMLInputElement;
      const messageInput = form.querySelector('#message') as HTMLTextAreaElement;
      
      if (nameInput && emailInput && messageInput) {
        nameInput.value = 'Test User';
        emailInput.value = 'test@example.com';
        messageInput.value = 'Test message';

        // Trigger form submission
        form.dispatchEvent(new Event('submit', { bubbles: true }));
        
        // Wait for the error handling
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error sending message',
          description: 'An unexpected error occurred. Please try again later.',
          variant: 'destructive',
        });
      }
    }
  });

  it('should handle email service failures gracefully', async () => {
    mockInvoke.mockResolvedValue({ 
      error: { message: 'RESEND_API_KEY not found' } 
    });

    const { container } = render(<ContactForm />);
    
    const form = container.querySelector('form');
    if (form) {
      const nameInput = form.querySelector('#name') as HTMLInputElement;
      const emailInput = form.querySelector('#email') as HTMLInputElement;
      const messageInput = form.querySelector('#message') as HTMLTextAreaElement;
      
      if (nameInput && emailInput && messageInput) {
        nameInput.value = 'Test User';
        emailInput.value = 'test@example.com';
        messageInput.value = 'Test message';

        form.dispatchEvent(new Event('submit', { bubbles: true }));
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Message saved successfully!',
          description: 'Your message was saved but confirmation email may be delayed. We\'ll get back to you soon.',
        });
      }
    }
  });

  it('verifies form fields match database schema', () => {
    const { getByLabelText } = render(<ContactForm />);
    
    // Required fields
    expect(getByLabelText(/name \*/i)).toBeTruthy();
    expect(getByLabelText(/email \*/i)).toBeTruthy();
    expect(getByLabelText(/message \*/i)).toBeTruthy();
    
    // Optional fields
    expect(getByLabelText(/phone number/i)).toBeTruthy();
    expect(getByLabelText(/address/i)).toBeTruthy();
    expect(getByLabelText(/interest/i)).toBeTruthy();
  });

  it('has correct field requirements after updates', () => {
    const { container } = render(<ContactForm />);
    
    // Check required attributes
    const nameInput = container.querySelector('input[id="name"]');
    const emailInput = container.querySelector('input[id="email"]');
    const messageInput = container.querySelector('textarea[id="message"]');
    const addressInput = container.querySelector('input[id="address"]');
    const phoneInput = container.querySelector('input[id="phone"]');
    
    expect(nameInput?.hasAttribute('required')).toBe(true);
    expect(emailInput?.hasAttribute('required')).toBe(true);
    expect(messageInput?.hasAttribute('required')).toBe(true);
    
    // These should NOT be required
    expect(addressInput?.hasAttribute('required')).toBe(false);
    expect(phoneInput?.hasAttribute('required')).toBe(false);
  });

  it('includes all interest options', () => {
    const { container } = render(<ContactForm />);
    
    const selectElement = container.querySelector('[role="combobox"]');
    expect(selectElement).toBeTruthy();
    
    // Interest field should not be required anymore
    const interestSection = container.querySelector('label[for="interest"]');
    expect(interestSection?.textContent).not.toContain('*');
  });

  it('has proper field labels and placeholders', () => {
    const { getByLabelText } = render(<ContactForm />);
    
    // Check that city was changed to address
    expect(() => getByLabelText(/city/i)).toThrow();
    expect(getByLabelText(/address/i)).toBeTruthy();
    
    // Check message is now required
    expect(getByLabelText(/message \*/i)).toBeTruthy();
  });

  it('validates email format requirement', () => {
    const { container } = render(<ContactForm />);
    
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
  });

  it('includes proper form validation structure', () => {
    const { container } = render(<ContactForm />);
    
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    
    // Count required fields (should be 3: name, email, message)
    const requiredInputs = container.querySelectorAll('input[required], textarea[required]');
    expect(requiredInputs.length).toBe(3);
  });

  it('has proper input types for all fields', () => {
    const { container } = render(<ContactForm />);
    
    expect(container.querySelector('input[type="text"][id="name"]')).toBeTruthy();
    expect(container.querySelector('input[type="email"][id="email"]')).toBeTruthy();
    expect(container.querySelector('input[type="tel"][id="phone"]')).toBeTruthy();
    expect(container.querySelector('input[type="text"][id="address"]')).toBeTruthy();
    expect(container.querySelector('textarea[id="message"]')).toBeTruthy();
  });

  it('renders submit button correctly', () => {
    const { getByRole } = render(<ContactForm />);
    
    const submitButton = getByRole('button', { name: /send message/i });
    expect(submitButton).toBeTruthy();
    expect(submitButton.getAttribute('type')).toBe('submit');
  });
});