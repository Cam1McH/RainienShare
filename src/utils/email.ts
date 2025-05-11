// utils/email.ts
import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";

export async function sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string) {
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY || '',
    });

    const sender = new Sender(
      process.env.MAILERSEND_FROM_EMAIL || '',
      process.env.MAILERSEND_FROM_NAME || 'Rainien'
    );

    const recipients = [
      new Recipient(email, email)
    ];

    // Build reset URL
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // Company information
    const companyName = 'Rainien';
    
    // Logo Options:
    // 1. Use a CDN-hosted image: Upload your logo to a service like Cloudinary, AWS S3, or ImgBB
    // const logoUrl = 'https://imgur.com/a/8UHdsGT'; // Replace with your actual Imgur link
    
    // 2. Alternative: Base64 encode your logo directly into the email
    // This is a fallback approach - replace with an actual base64-encoded version of your logo
    const logoBase64 = 'data:image/png;base64,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'; // Replace with your actual base64 logo
    
    // 3. You can also use an image hosted on your public website if you have one:
    const logoUrl = 'https://localhost:3000/Logo.png';
    
    // Choose which approach to use (CDN option is better for most cases)
    const logoSource = logoUrl; // or logoBase64 if using the inline approach
    
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.MAILERSEND_FROM_EMAIL;
    
    // Rainien brand colors from your homepage
    const primaryColor = '#7c3aed'; // Purple from your gradient
    const secondaryColor = '#ec4899'; // Pink from your gradient
    const darkBgColor = '#09090b'; // Darker background color (zinc-950)
    const cardBgColor = '#18181b'; // Card background (zinc-900)
    const borderColor = '#27272a'; // Border color (zinc-800)
    const textColor = '#ffffff'; // White text
    const mutedTextColor = '#a1a1aa'; // Muted text color (zinc-400)
    
    // Current year for copyright
    const currentYear = new Date().getFullYear();

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(recipients)
      .setSubject('Reset Your Rainien Password')
      .setHtml(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Rainien Password</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: ${textColor}; background-color: ${darkBgColor};">
          <!-- Preheader text (hidden) -->
          <div style="display: none; max-height: 0px; overflow: hidden;">
            Reset your Rainien password to regain access to your account
          </div>
          
          <!-- Main container -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${darkBgColor}; padding: 30px 20px;">
            <tr>
              <td align="center">
                <!-- Content container -->
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: ${cardBgColor}; border-radius: 16px; border: 1px solid ${borderColor}; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                  <!-- Header with Logo and Gradient Bar -->
                  <tr>
                    <td style="height: 6px; background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor});">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 40px 0 30px 0;">
                      <!-- Logo Approach 1: Use the CDN-hosted image -->
                      <img src="${logoSource}" alt="Rainien" style="max-width: 180px; height: auto;" />
                      
                      <!-- Logo Approach 2: If you don't have a hosted image, use a text fallback -->
                      <div style="display: none; margin: 0 auto;">
                        <div style="display: inline-block; padding: 10px 15px; background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor}); border-radius: 10px;">
                          <span style="font-size: 28px; font-weight: 800; color: #ffffff;">RAINIEN</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;">
                      <!-- Icon -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                        <tr>
                          <td align="center">
                            <div style="width: 80px; height: 80px; background-image: linear-gradient(45deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2)); border-radius: 50%; display: inline-block; text-align: center; line-height: 80px;">
                              <img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/key-round.svg" alt="Reset" style="width: 40px; height: 40px; filter: invert(64%) sepia(42%) saturate(6656%) hue-rotate(239deg) brightness(96%) contrast(102%); margin-top: 20px;" />
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <h2 style="color: ${textColor}; font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: 700; text-align: center;">Reset Your Password</h2>
                      
                      <p style="color: ${mutedTextColor}; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hello,</p>
                      
                      <p style="color: ${mutedTextColor}; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We received a request to reset the password for your Rainien account. Don't worry, we've got you covered! Click the button below to set a new password.</p>
                      
                      <!-- Button -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor}); color: ${textColor}; text-decoration: none; padding: 16px 40px; border-radius: 9999px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3); transition: all 0.2s ease-in-out;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: ${mutedTextColor}; font-size: 14px; line-height: 1.6; margin-bottom: 25px; text-align: center; font-style: italic;">This link will expire in 1 hour for security purposes.</p>
                      
                      <p style="color: ${mutedTextColor}; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">If the button doesn't work, copy and paste this URL into your browser:</p>
                      
                      <p style="background-color: #09090b; padding: 14px; border-radius: 6px; font-size: 14px; word-break: break-all; margin-bottom: 25px; color: ${mutedTextColor}; border: 1px solid #27272a;">${resetUrl}</p>
                      
                      <p style="color: ${mutedTextColor}; font-size: 16px; line-height: 1.6; margin-bottom: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
                      
                      <p style="color: ${mutedTextColor}; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Have questions? Feel free to <a href="mailto:${supportEmail}" style="color: #a78bfa; text-decoration: none; border-bottom: 1px dotted #a78bfa;">contact our support team</a>.</p>
                      
                      <!-- Signature -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px;">
                        <tr>
                          <td>
                            <p style="color: ${mutedTextColor}; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">Best regards,</p>
                            <p style="color: ${textColor}; font-size: 16px; line-height: 1.6; font-weight: 600;">The Rainien Team</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #09090b; padding: 30px; border-top: 1px solid #27272a;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding-bottom: 20px;">
                            <a href="${baseUrl}" style="display: inline-block; margin: 0 8px;">
                              <img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/globe.svg" alt="Website" style="width: 20px; height: 20px; filter: invert(70%) sepia(12%) saturate(210%) hue-rotate(215deg) brightness(93%) contrast(88%);" />
                            </a>
                            <a href="https://twitter.com/rainien" style="display: inline-block; margin: 0 8px;">
                              <img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/twitter.svg" alt="Twitter" style="width: 20px; height: 20px; filter: invert(70%) sepia(12%) saturate(210%) hue-rotate(215deg) brightness(93%) contrast(88%);" />
                            </a>
                            <a href="https://linkedin.com/company/rainien" style="display: inline-block; margin: 0 8px;">
                              <img src="https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/linkedin.svg" alt="LinkedIn" style="width: 20px; height: 20px; filter: invert(70%) sepia(12%) saturate(210%) hue-rotate(215deg) brightness(93%) contrast(88%);" />
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">
                            <p style="color: #71717a; font-size: 14px; margin: 0 0 5px 0;">© ${currentYear} Rainien. All rights reserved.</p>
                            <p style="color: #52525b; font-size: 12px; margin: 10px 0 0 0;">
                              This is an automated message. Please do not reply to this email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Extra legal footer -->
                <table cellpadding="0" cellspacing="0" border="0" width="600">
                  <tr>
                    <td style="padding: 20px 0; color: #52525b; font-size: 12px; text-align: center; line-height: 1.5;">
                      <p style="margin: 0 0 8px 0;">Rainien Inc., 123 AI Street, Innovation Park, CA 94103</p>
                      <p style="margin: 0;">
                        <a href="${baseUrl}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a> • 
                        <a href="${baseUrl}/terms" style="color: #6b7280; text-decoration: underline;">Terms of Service</a> • 
                        <a href="${baseUrl}/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `)
      .setText(`Reset Your Rainien Password

Hello,

We received a request to reset the password for your Rainien account. To set a new password, please visit:

${resetUrl}

This link will expire in 1 hour for security purposes.

If you didn't request a password reset, you can safely ignore this email.

Have questions? Feel free to contact our support team at ${supportEmail}.

Best regards,
The Rainien Team

© ${currentYear} Rainien. All rights reserved.

Rainien Inc., 123 AI Street, Innovation Park, CA 94103
This is an automated message. Please do not reply to this email.`);

    // Send the email
    const response = await mailerSend.email.send(emailParams);
    console.log('Password reset email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}