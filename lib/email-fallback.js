// Email fallback service for when Convex action fails
export const sendEmailFallback = async (emailData) => {
  try {
    // Use EmailJS as a fallback service
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fallback email service failed:', error);
    throw error;
  }
};

// Simple email template generator
export const generateReminderEmail = (userName, amount, senderName, description) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Reminder - Cash Crush</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💰 Cash Crush</h1>
          <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">Payment Reminder</p>
        </div>
        
        <div style="background: #F9FAFB; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1F2937; margin: 0 0 15px 0;">Hi ${userName || 'there'}! 👋</h2>
          <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
            This is a friendly reminder about your outstanding balance with <strong>${senderName || 'your friend'}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
            <h3 style="color: #10B981; margin: 0 0 10px 0; font-size: 24px;">
              Amount: ₹${amount?.toFixed?.(2) || '0.00'}
            </h3>
            ${description ? `<p style="color: #6B7280; margin: 0;"><strong>For:</strong> ${description}</p>` : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #6B7280; margin: 0 0 20px 0;">
            Thanks for using Cash Crush to manage your expenses! 🚀
          </p>
          <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
            This is an automated reminder. Please contact your friend directly to settle up.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${userName || 'there'}!

This is a friendly reminder about your outstanding balance with ${senderName || 'your friend'}.

Amount: ₹${amount?.toFixed?.(2) || '0.00'}
${description ? `For: ${description}` : ''}

Thanks for using Cash Crush to manage your expenses!

This is an automated reminder. Please contact your friend directly to settle up.
  `.trim();

  return { html, text };
};
