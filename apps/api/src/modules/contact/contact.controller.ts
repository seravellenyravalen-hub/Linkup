import type { ContactService } from './contact.service';

export class ContactController {
  constructor(private readonly service: Pick<ContactService, 'submit'>) {}

  async submit(request: Request): Promise<Response> {
    const body = await request.json() as Record<string, unknown>;
    if (
      (body.name !== undefined && typeof body.name !== 'string') ||
      typeof body.email !== 'string' ||
      typeof body.category !== 'string' ||
      typeof body.subject !== 'string' ||
      typeof body.message !== 'string'
    ) {
      return Response.json({ error: { code: 'INVALID_REQUEST', message: 'Invalid contact report' } }, { status: 400 });
    }
    try {
      const report = await this.service.submit({
        userId: typeof body.userId === 'string' ? body.userId : undefined,
        name: body.name as string | undefined,
        email: body.email,
        category: body.category,
        subject: body.subject,
        message: body.message,
      });
      return Response.json({ report }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid contact report') {
        return Response.json({ error: { code: 'INVALID_REQUEST', message: error.message } }, { status: 400 });
      }
      throw error;
    }
  }
}
