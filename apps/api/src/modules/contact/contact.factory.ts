import { databasePool } from '../../database/database.pool';
import { ContactController } from './contact.controller';
import { ContactReportRepository } from './contact.repository';
import { ContactService, ResendContactNotifier } from './contact.service';

export function createContactController() {
  const repository = new ContactReportRepository(databasePool);
  const notifier = new ResendContactNotifier();
  return new ContactController(new ContactService(repository, notifier));
}
