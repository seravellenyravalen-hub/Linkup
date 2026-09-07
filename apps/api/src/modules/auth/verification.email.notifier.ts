import type { VerificationEmailNotifier } from './auth.service';

export class ResendVerificationEmailNotifier implements VerificationEmailNotifier {
  constructor(
    private readonly apiKey = process.env.RESEND_API_KEY,
    private readonly from = process.env.LINKUP_EMAIL_FROM,
    private readonly webOrigin = process.env.LINKUP_WEB_ORIGIN,
  ) {}

  async send(input: { email: string; token: string }) {
    if (!this.apiKey || !this.from || !this.webOrigin) {
      throw new Error('Verification email provider is not configured');
    }

    const origin = this.webOrigin.replace(/\/$/, '');
    const verifyUrl = `${origin}/verify-email?token=${encodeURIComponent(input.token)}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [input.email],
        subject: 'Verify your LinkUp email',
        text: `Welcome to LinkUp. Verify your email address by opening this link:\n\n${verifyUrl}\n\nThis link expires in 30 minutes. If you did not create a LinkUp account, you can ignore this email.`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email provider returned ${response.status}`);
    }
  }
}
