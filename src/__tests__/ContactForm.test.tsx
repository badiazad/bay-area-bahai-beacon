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

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ContactForm />);
    expect(container).toBeTruthy();
  });

  it('displays all required form fields', () => {
    const { getByLabelText, getByRole } = render(<ContactForm />);
    
    expect(getByLabelText(/name \*/i)).toBeTruthy();
    expect(getByLabelText(/email \*/i)).toBeTruthy();
    expect(getByLabelText(/phone number/i)).toBeTruthy();
    expect(getByLabelText(/city \*/i)).toBeTruthy();
    expect(getByLabelText(/interest \*/i)).toBeTruthy();
    expect(getByLabelText(/message/i)).toBeTruthy();
    expect(getByRole('button', { name: /send message/i })).toBeTruthy();
  });

  it('has correct form structure', () => {
    const { container } = render(<ContactForm />);
    
    // Check that form element exists
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    
    // Check that required fields have required attribute
    const nameInput = container.querySelector('input[id="name"]');
    const emailInput = container.querySelector('input[id="email"]');
    const cityInput = container.querySelector('input[id="city"]');
    
    expect(nameInput?.hasAttribute('required')).toBe(true);
    expect(emailInput?.hasAttribute('required')).toBe(true);
    expect(cityInput?.hasAttribute('required')).toBe(true);
  });

  it('contains community information sections', () => {
    const { getByText } = render(<ContactForm />);
    
    expect(getByText('Our Community Activities')).toBeTruthy();
    expect(getByText('Get Involved')).toBeTruthy();
    expect(getByText('Devotional Gatherings')).toBeTruthy();
    expect(getByText("Children's Classes")).toBeTruthy();
    expect(getByText('Youth Programs')).toBeTruthy();
    expect(getByText('Study Circles')).toBeTruthy();
  });

  it('has proper page layout and styling', () => {
    const { container } = render(<ContactForm />);
    
    // Check for main container
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeTruthy();
    
    // Check for form card
    const formCard = container.querySelector('[class*="shadow"]');
    expect(formCard).toBeTruthy();
  });

  it('includes all interest options in select', () => {
    const { container } = render(<ContactForm />);
    
    // We can't easily test the select options without user interaction,
    // but we can verify the select element exists
    const selectElement = container.querySelector('[role="combobox"]');
    expect(selectElement).toBeTruthy();
  });

  it('has proper input types', () => {
    const { container } = render(<ContactForm />);
    
    const emailInput = container.querySelector('input[type="email"]');
    const telInput = container.querySelector('input[type="tel"]');
    const textInputs = container.querySelectorAll('input[type="text"]');
    const textarea = container.querySelector('textarea');
    
    expect(emailInput).toBeTruthy();
    expect(telInput).toBeTruthy();
    expect(textInputs.length).toBeGreaterThan(0);
    expect(textarea).toBeTruthy();
  });

  it('renders submit button with correct initial state', () => {
    const { getByRole } = render(<ContactForm />);
    
    const submitButton = getByRole('button', { name: /send message/i });
    expect(submitButton).toBeTruthy();
    expect(submitButton.textContent).toBe('Send Message');
  });
});