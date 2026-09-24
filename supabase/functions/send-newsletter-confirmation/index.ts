// Supabase Edge Function for sending newsletter confirmation emails
// Deploy this using: supabase functions deploy send-newsletter-confirmation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  email: string;
}

serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email } = await req.json() as RequestBody;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update subscriber as confirmed
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ confirmed: true, confirmed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating subscriber:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to confirm subscription' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      // Return success even without email sending (for testing)
      console.log('RESEND_API_KEY not set - skipping email send');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Subscription confirmed (email service not configured)' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send confirmation email using Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">🎉 Welcome to Maish Boutique!</h1>
            </div>
            
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              Hi there,
            </p>
            
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to our newsletter! You're now on the inside track for:
            </p>
            
            <ul style="color: #4a4a4a; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>✨ Exclusive offers and flash sales</li>
              <li>👗 New arrivals before anyone else</li>
              <li>💡 Style tips and fashion inspiration</li>
              <li>🎁 Special subscriber-only rewards</li>
            </ul>
            
            <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #4a4a4a; font-size: 14px; margin: 0;">
                Use this code on your next purchase:
              </p>
              <p style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin: 10px 0 0;">WELCOME10</p>
              <p style="color: #888; font-size: 12px; margin: 10px 0 0;">Get 10% off your next order!</p>
            </div>
            
            <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6;">
              We're thrilled to have you join the Maish Boutique family. Stay stylish!
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Maish Boutique. All rights reserved.<br>
              Narok, Kenya
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Maish Boutique <newsletter@maishboutique.com>',
        to: email,
        subject: '🎉 Welcome to Maish Boutique! Your 10% Discount Code Inside',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      // Don't fail the request, just log the error
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Confirmation email sent' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
