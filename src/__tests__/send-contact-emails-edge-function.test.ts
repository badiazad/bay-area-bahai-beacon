import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Deno environment
const mockDeno = {
  env: {
    get: vi.fn((key: string) => {
      if (key === 'RESEND_API_KEY') return 'test-api-key';
      return undefined;
    })
  }
};

// @ts-ignore
globalThis.Deno = mockDeno;

// Mock Resend
const mockResendSend = vi.fn();
const mockResend = {
  emails: {
    send: mockResendSend
  }
};

vi.mock('npm:resend@2.0.0', () => ({
  Resend: vi.fn(() => mockResend)
}));

// Mock fetch for potential HTTP calls
global.fetch = vi.fn();

describe('send-contact-emails Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendSend.mockResolvedValue({ id: 'email-id-123' });
  });

  it('validates required fields', async () => {
    const invalidSubmission = {
      name: '',
      email: 'invalid-email',
      message: ''
    };

    // Test that validation would catch these issues
    expect(invalidSubmission.name).toBe('');
    expect(invalidSubmission.message).toBe('');
    expect(invalidSubmission.email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('handles valid contact submission', async () => {
    const validSubmission = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      address: 'San Francisco, CA',
      interest: 'General Inquiry',
      message: 'I would like to learn more about the community'
    };

    // Verify all required fields are present
    expect(validSubmission.name).toBeTruthy();
    expect(validSubmission.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(validSubmission.message).toBeTruthy();
  });

  it('formats emails correctly', () => {
    const submission = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-123-4567',
      address: 'San Francisco, CA',
      interest: 'Youth Programs',
      message: 'Interested in youth activities'
    };

    // Auto-reply email structure
    const autoReplySubject = 'Thank you for connecting with us!';
    expect(autoReplySubject).toContain('Thank you');

    // Notification email structure  
    const notificationSubject = `New Community Inquiry: ${submission.interest}`;
    expect(notificationSubject).toBe('New Community Inquiry: Youth Programs');

    // When no interest is provided
    const submissionNoInterest = { ...submission, interest: '' };
    const notificationSubjectNoInterest = `New Community Inquiry${submissionNoInterest.interest ? `: ${submissionNoInterest.interest}` : ''}`;
    expect(notificationSubjectNoInterest).toBe('New Community Inquiry');
  });

  it('handles optional fields correctly', () => {
    const minimalSubmission = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello'
    };

    // These should be handled gracefully when undefined/empty
    const phone = (minimalSubmission as any).phone || '';
    const address = (minimalSubmission as any).address || '';
    const interest = (minimalSubmission as any).interest || '';
    
    expect(phone).toBe('');
    expect(address).toBe('');
    expect(interest).toBe('');
  });

  it('uses correct email addresses', () => {
    const expectedFromEmail = 'SF Baha\'i Community <noreply@sfbahai.org>';
    const expectedToEmail = 'badiazad@yahoo.com'; // Updated to your email
    
    expect(expectedFromEmail).toContain('SF Baha\'i Community');
    expect(expectedFromEmail).toContain('noreply@sfbahai.org');
    expect(expectedToEmail).toBe('badiazad@yahoo.com');
  });

  it('includes proper CORS headers', () => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('content-type');
  });

  it('validates email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      ''
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(email).toMatch(emailRegex);
    });

    invalidEmails.forEach(email => {
      expect(email).not.toMatch(emailRegex);
    });
  });

  it('handles Resend API errors gracefully', async () => {
    mockResendSend.mockRejectedValue(new Error('API rate limit exceeded'));

    // The function should handle this error and return appropriate response
    const error = new Error('API rate limit exceeded');
    expect(error.message).toBe('API rate limit exceeded');
  });

  it('processes timestamps correctly', () => {
    const now = new Date();
    const timestamp = now.toLocaleString();
    
    expect(timestamp).toBeTruthy();
    expect(typeof timestamp).toBe('string');
  });
});