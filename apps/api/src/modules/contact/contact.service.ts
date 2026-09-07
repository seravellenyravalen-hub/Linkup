import type { ContactReportInput, ContactReportRepository } from './contact.repository';

export interface ContactNotifier {
  send(report: ContactReportInput & { id: string }): Promise<void>;
}

export class ResendContactNotifier implements ContactNotifier {
  constructor(
    private readonly apiKey = process.env.RESEND_API_KEY,
    private readonly from = process.env.LINKUP_EMAIL_FROM,
    private readonly to = process.env.CONTACT_ADMIN_EMAIL,
  ) {}

  async send(report: ContactReportInput & { id: string }) {
    if (!this.apiKey || !this.from || !this.to) {
      throw new Error('Contact email provider is not configured');
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: this.from,
        to: [this.to],
        reply_to: report.email,
        subject: `[LinkUp ${report.category}] ${report.subject}`,
        text: `New LinkUp report\n\nFrom: ${report.name || 'Anonymous'} <${report.email}>\nCategory: ${report.category}\nReport ID: ${report.id}\n\n${report.message}`,
      }),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ContactService {
  constructor(private readonly repository: ContactReportRepository, private readonly notifier: ContactNotifier) {}

  async submit(input: ContactReportInput) {
    const email = input.email.trim().toLowerCase();
    const subject = input.subject.trim();
    const message = input.message.trim();
    const category = input.category.trim() || 'Other';
    const name = input.name?.trim();
    if (!emailPattern.test(email) || subject.length < 2 || subject.length > 160 || message.length < 5 || message.length > 5000) {
      throw new Error('Invalid contact report');
    }
    const report = await this.repository.create({ ...input, email, subject, message, category, name });
    await this.notifier.send({ ...input, email, subject, message, category, name, id: report.id });
    return report;
  }
}
