'use client';

import { useState } from 'react';
import { PaymentReminder } from './payment-reminder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestReminderButton() {
  const [testData, setTestData] = useState({
    userId: 'test-user-123',
    userName: 'Test User',
    userEmail: 'test@example.com',
    amount: 500.50,
    senderName: 'Your Friend',
    description: 'Pizza party last weekend'
  });

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Test Payment Reminder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">User Name:</label>
          <input
            type="text"
            value={testData.userName}
            onChange={(e) => setTestData({...testData, userName: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">User Email:</label>
          <input
            type="email"
            value={testData.userEmail}
            onChange={(e) => setTestData({...testData, userEmail: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount:</label>
          <input
            type="number"
            value={testData.amount}
            onChange={(e) => setTestData({...testData, amount: parseFloat(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description:</label>
          <input
            type="text"
            value={testData.description}
            onChange={(e) => setTestData({...testData, description: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="pt-4 border-t">
          <PaymentReminder 
            userId={testData.userId}
            userName={testData.userName}
            userEmail={testData.userEmail}
            amount={testData.amount}
            senderName={testData.senderName}
            description={testData.description}
          />
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          <p>• Click the button above to test the reminder functionality</p>
          <p>• Check browser console (F12) for detailed logs</p>
          <p>• Toast notifications will show success/error messages</p>
        </div>
      </CardContent>
    </Card>
  );
}
