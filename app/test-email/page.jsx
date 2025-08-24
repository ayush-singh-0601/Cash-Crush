'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { TestReminderButton } from '@/components/test-reminder-button';
import { DebugConvex } from '@/components/debug-convex';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const sendEmail = useAction(api.email.sendEmail);

  const handleSendTestEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsSending(true);
    setStatus('Sending test email...');
    setError('');

    try {
      const result = await sendEmail({
        to: email,
        subject: 'Test Email from Cash Crush',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from Cash Crush app.</p>
          <p>If you received this, the email service is working correctly!</p>
        `,
        text: 'This is a test email from Cash Crush app.\n\nIf you received this, the email service is working correctly!'
      });

      setStatus('Test email sent successfully! Check your inbox.');
      console.log('Email sent successfully:', result);
    } catch (err) {
      console.error('Error sending test email:', err);
      setError(`Failed to send test email: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test Email Service</h1>
      
      {/* Debug Panel */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Debug Convex Connection</h2>
        <DebugConvex />
      </div>

      {/* Test Payment Reminder Component */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Payment Reminder Button</h2>
        <TestReminderButton />
      </div>
      
      {/* Original Email Test */}
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Direct Email Test</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="your@email.com"
          />
        </div>

        <Button 
          onClick={handleSendTestEmail}
          disabled={isSending}
          className="w-full"
        >
          {isSending ? 'Sending...' : 'Send Test Email'}
        </Button>

        {status && (
          <div className="p-3 bg-green-100 text-green-800 rounded">
            {status}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Troubleshooting:</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Make sure you're logged in</li>
            <li>Check your browser's developer console for detailed error messages</li>
            <li>Verify your .env.local file has the correct Gmail credentials</li>
            <li>Ensure the Convex backend is properly deployed</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}
