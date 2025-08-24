'use client';

import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DebugConvex() {
  const sendEmail = useAction(api.email.sendEmail);
  const currentUser = useQuery(api.users.getCurrentUser);

  const testConvexConnection = () => {
    console.log('=== CONVEX DEBUG ===');
    console.log('sendEmail action:', sendEmail);
    console.log('sendEmail type:', typeof sendEmail);
    console.log('currentUser:', currentUser);
    console.log('api object:', api);
    console.log('api.email:', api.email);
    
    if (sendEmail) {
      toast.success('✅ Convex email action is available');
    } else {
      toast.error('❌ Convex email action is NOT available');
    }
    
    if (currentUser) {
      toast.success(`✅ User authenticated: ${currentUser.name}`);
    } else {
      toast.error('❌ User not authenticated');
    }
  };

  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h3 className="font-semibold mb-2">Convex Debug Panel</h3>
      <Button onClick={testConvexConnection} variant="outline" size="sm">
        Test Convex Connection
      </Button>
      <div className="text-xs mt-2 space-y-1">
        <p>Email Action: {sendEmail ? '✅ Available' : '❌ Not Available'}</p>
        <p>User: {currentUser ? `✅ ${currentUser.name}` : '❌ Not Logged In'}</p>
      </div>
    </div>
  );
}
