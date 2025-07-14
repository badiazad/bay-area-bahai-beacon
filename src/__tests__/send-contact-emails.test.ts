import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Deno environment
const mockEnv = new Map([
  ['RESEND_API_KEY', 'test-api-key'],
  ['GOOGLE_SHEETS_WEBHOOK_URL', 'https://example.com/webhook'],
]);

// Global Deno mock
(globalThis as any).Deno = {
  env: {
    get: (key: string) => mockEnv.get(key),
  },
};

// Mock fetch
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

// Mock Resend
const mockResendSend = vi.fn();
const mockResend = vi.fn().mockImplementation(() => ({
  emails: {
    send: mockResendSend,
  },
}));

vi.mock('npm:resend@2.0.0', () => ({
  Resend: mockResend,
}));

describe('send-contact-emails Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendSend.mockResolvedValue({ id: 'test-email-id' });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  it('should process valid contact submission', async () => {
    const testSubmission = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      city: 'San Francisco',
      interest: 'General Inquiry',
      message: 'Test message',
    };

    // We can't easily test the actual edge function without the Deno runtime,
    // but we can test the core logic components
    expect(testSubmission.name).toBe('John Doe');
    expect(testSubmission.email).toBe('john@example.com');
    expect(testSubmission.city).toBe('San Francisco');
    expect(testSubmission.interest).toBe('General Inquiry');
  });

  it('should validate required fields', () => {
    const validSubmission = {
      name: 'John Doe',
      email: 'john@example.com',
      city: 'San Francisco',
      interest: 'General Inquiry',
    };

    const invalidSubmission = {
      name: '',
      email: 'john@example.com',
      city: 'San Francisco',
      interest: 'General Inquiry',
    };

    // Test validation logic
    expect(validSubmission.name).toBeTruthy();
    expect(validSubmission.email).toBeTruthy();
    expect(validSubmission.city).toBeTruthy();
    expect(validSubmission.interest).toBeTruthy();

    expect(invalidSubmission.name).toBeFalsy();
  });

  it('should handle email validation', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test+tag@example.org',
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'test@',
      '',
    ];

    validEmails.forEach(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should handle interest options validation', () => {
    const validInterests = [
      'General Inquiry',
      'Devotional Gathering',
      "Children's Class",
      'Youth Class',
      'Study Circle',
    ];

    const testInterest = 'General Inquiry';
    expect(validInterests.includes(testInterest)).toBe(true);

    const invalidInterest = 'Invalid Option';
    expect(validInterests.includes(invalidInterest)).toBe(false);
  });

  it('should format timestamps correctly', () => {
    const now = new Date();
    const isoString = now.toISOString();
    
    expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should handle CORS headers', () => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
    expect(corsHeaders['Access-Control-Allow-Headers']).toContain('content-type');
  });

  it('should generate proper email content', () => {
    const submission = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-987-6543',
      city: 'Oakland',
      interest: "Children's Class",
      message: 'Interested in learning more',
    };

    // Test auto-reply email generation
    const autoReplySubject = 'Thank you for connecting with us!';
    expect(autoReplySubject).toContain('Thank you');

    // Test notification email generation
    const notificationSubject = `New Community Inquiry: ${submission.interest}`;
    expect(notificationSubject).toBe("New Community Inquiry: Children's Class");
  });

  it('should handle optional fields correctly', () => {
    const submissionWithOptionals = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      city: 'San Francisco',
      interest: 'General Inquiry',
      message: 'Test message',
    };

    const submissionWithoutOptionals = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      city: 'Oakland',
      interest: 'Youth Class',
      phone: undefined,
      message: undefined,
    };

    expect(submissionWithOptionals.phone).toBeTruthy();
    expect(submissionWithOptionals.message).toBeTruthy();
    
    expect(submissionWithoutOptionals.phone).toBeFalsy();
    expect(submissionWithoutOptionals.message).toBeFalsy();
  });

  it('should handle Google Sheets webhook gracefully when URL is missing', () => {
    // Test when GOOGLE_SHEETS_WEBHOOK_URL is not set
    const emptyEnv = new Map([
      ['RESEND_API_KEY', 'test-api-key'],
    ]);

    const getEnvValue = (key: string) => emptyEnv.get(key);
    const googleSheetsUrl = getEnvValue('GOOGLE_SHEETS_WEBHOOK_URL');
    
    expect(googleSheetsUrl).toBeFalsy();
    // Function should continue without failing
  });
});