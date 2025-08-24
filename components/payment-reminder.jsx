'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';
import { Mail, AlertTriangle, Laugh, AlertCircle, Heart, Zap } from 'lucide-react';
import { generateReminderEmail } from '@/lib/email-fallback';

export function PaymentReminder({ userId, userName, userEmail, amount, isGroup = false, groupName = '', description = '', senderName = 'Your friend' }) {
  const [open, setOpen] = useState(false);
  const [reminderType, setReminderType] = useState('normal');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Get the email action function directly
  const sendEmail = useAction(api.email.sendEmail);

  const handleSendReminder = async (e) => {
    if (e) e.preventDefault();
    
    // Show immediate feedback
    toast.loading('Preparing to send reminder...', { id: 'sending-reminder' });

    setIsSending(true);

    try {
      // Validate required fields
      if (!userEmail) {
        throw new Error('Recipient email is required');
      }
      if (!userName) {
        throw new Error('Recipient name is required');
      }
      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required');
      }
      if (!senderName) {
        throw new Error('Sender name is required');
      }
      // Call the email sending action with reminder type and custom message
      await sendEmail({
        to: userEmail,
        recipientName: userName,
        senderName: senderName,
        amount: amount,
        description: description || 'Outstanding balance',
        isGroup: isGroup || false,
        groupName: groupName || '',
        reminderType: reminderType,
        customMessage: customMessage.trim() || undefined,
      });

      const typeLabels = {
        normal: 'friendly',
        polite: 'polite',
        urgent: 'urgent',
        funny: 'funny'
      };

      toast.success(`${typeLabels[reminderType] || 'Friendly'} reminder sent to ${userName}! 📧`, { id: 'sending-reminder' });
      setOpen(false);
      
      // Reset form
      setReminderType('normal');
      setCustomMessage('');
      
      // Reset form
      setCustomMessage('');
      setReminderType('normal');
      
    } catch (error) {
      console.error('Error sending reminder:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response?.data || 'No response data'
      });
      
      let errorMessage = 'Failed to send reminder';
      let errorDescription = 'Please try again';
      
      if (error.message) {
        if (error.message.includes('GMAIL_USER') || error.message.includes('GMAIL_APP_PASSWORD')) {
          errorMessage = 'Email service not configured';
          errorDescription = 'Please contact support to set up email functionality';
        } else if (error.message.includes('Invalid login') || error.message.includes('EAUTH')) {
          errorMessage = 'Email authentication failed';
          errorDescription = 'Gmail credentials need to be updated';
        } else if (error.message.includes('network') || error.message.includes('ECONNECTION')) {
          errorMessage = 'Network connection failed';
          errorDescription = 'Please check your internet connection';
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          errorMessage = 'Request timed out';
          errorDescription = 'Please try again in a moment';
        } else {
          errorMessage = 'Email sending failed';
          errorDescription = error.message.substring(0, 100);
        }
      }
      
      toast.error(`❌ ${errorMessage}`, {
        id: 'sending-reminder',
        duration: 6000,
        description: errorDescription,
        action: {
          label: 'Retry',
          onClick: () => handleSendReminder()
        }
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
        type="button"
      >
        <Mail className="h-4 w-4" />
        Send Reminder
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                💰
              </div>
              <div>
                <div>Send Cash Crush Reminder</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Beautiful, professional email reminders
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={reminderType} onValueChange={setReminderType} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="normal" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Friendly
              </TabsTrigger>
              <TabsTrigger value="polite" className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Polite
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Urgent
              </TabsTrigger>
              <TabsTrigger value="funny" className="flex items-center gap-1">
                <Laugh className="h-4 w-4" />
                Funny
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="normal" className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Send a friendly reminder to {userName} about the pending payment of ₹{amount.toFixed(2)}.
              </p>
              <Textarea 
                placeholder="Add a custom message (optional)" 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </TabsContent>
            
            <TabsContent value="urgent" className="mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                <p className="text-sm text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  This will send a more strongly worded reminder. Use with caution!
                </p>
              </div>
              <Textarea 
                placeholder="Add your urgent message here (optional)" 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </TabsContent>
            
            <TabsContent value="polite" className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                <p className="text-sm text-green-800 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  This will send a very polite and gentle reminder. Perfect for maintaining good relationships!
                </p>
              </div>
              <Textarea 
                placeholder="Add your polite message here (optional)" 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </TabsContent>
            
            <TabsContent value="urgent" className="mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                <p className="text-sm text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  This will send a more strongly worded reminder. Use with caution!
                </p>
              </div>
              <Textarea 
                placeholder="Add your urgent message here (optional)" 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </TabsContent>
            
            <TabsContent value="funny" className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                <p className="text-sm text-blue-800 flex items-center gap-1">
                  <Laugh className="h-4 w-4" />
                  This will send a humorous reminder. Perfect for friends who need a laugh while being reminded!
                </p>
              </div>
              <Textarea 
                placeholder="Add your funny message here (optional)" 
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button 
              onClick={handleSendReminder} 
              disabled={isSending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
              type="button"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}