"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import nodemailer from "nodemailer";

export const sendEmail = action({
  args: {
    to: v.string(),
    recipientName: v.string(),
    senderName: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    isGroup: v.optional(v.boolean()),
    groupName: v.optional(v.string()),
    reminderType: v.optional(v.string()),
    customMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("sendEmail function called with args:", {
      to: args.to,
      recipientName: args.recipientName,
      senderName: args.senderName,
      amount: args.amount,
      reminderType: args.reminderType,
      hasCustomMessage: !!args.customMessage
    });
    
    // Check if required environment variables are set
    if (!process.env.GMAIL_USER) {
      console.error("GMAIL_USER environment variable is not set");
      throw new Error("GMAIL_USER environment variable is not configured. Please add GMAIL_USER=your-email@gmail.com to your .env.local file.");
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      console.error("GMAIL_APP_PASSWORD environment variable is not set");
      throw new Error("GMAIL_APP_PASSWORD environment variable is not configured. Please add GMAIL_APP_PASSWORD=your-16-character-app-password to your .env.local file.");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.to)) {
      throw new Error("Invalid email address format");
    }

    // Import the email template
    const { createCashCrushReminderTemplate } = await import("../lib/email-templates/cash-crush-reminder.js");
    
    // Generate email content with reminder type and custom message
    const html = createCashCrushReminderTemplate({
      recipientName: args.recipientName,
      senderName: args.senderName,
      amount: args.amount,
      description: args.customMessage || args.description || 'Outstanding balance',
      isGroup: args.isGroup || false,
      groupName: args.groupName || '',
      reminderType: args.reminderType || 'normal'
    });

    // Create plain text version
    const text = `Hi ${args.recipientName},

${args.senderName} is sending you a ${args.reminderType || 'friendly'} reminder about your outstanding balance${args.isGroup ? ` in the ${args.groupName} group` : ''}.

Amount: ₹${args.amount.toFixed(2)}
${args.customMessage ? `Message: ${args.customMessage}` : ''}
${args.description ? `For: ${args.description}` : ''}

Please settle up when convenient.

Thanks,
The Cash Crush Team`;

    const subject = `${args.reminderType === 'urgent' ? 'URGENT: ' : ''}Payment Reminder from ${args.senderName} - Cash Crush`;

    try {
      // Create Gmail transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: args.to,
        subject: subject,
        html: html,
        text: text,
      };

      console.log("Attempting to send email...");
      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result);
      return result.messageId;
    } catch (error) {
      console.error("Failed to send email:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      
      if (error.code === 'EAUTH') {
        errorMessage = "Gmail authentication failed. Please check your GMAIL_USER and GMAIL_APP_PASSWORD. Make sure 2FA is enabled and you're using an App Password, not your regular password.";
      } else if (error.code === 'ECONNECTION') {
        errorMessage = "Connection to Gmail failed. Please check your internet connection and try again.";
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = "Connection to Gmail timed out. Please try again.";
      } else if (error.message.includes('Invalid login')) {
        errorMessage = "Invalid Gmail credentials. Please check your GMAIL_USER and GMAIL_APP_PASSWORD.";
      }
      
      throw new Error(errorMessage);
    }
  },
});
