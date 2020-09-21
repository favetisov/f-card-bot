import { appendFileSync, existsSync, readFile, writeFile } from 'fs';
import { Session } from './session';

export class FsSession<SessionData> implements Session<SessionData> {
  data: SessionData;

  constructor(private dbFilename: string, private initialData: SessionData) {
    if (!existsSync(dbFilename)) {
      appendFileSync(dbFilename, '{}');
    }
  }

  async load(key): Promise<SessionData> {
    const users = await this.loadAll();
    if (!users[key]) {
      users[key] = await this.update(key, this.initialData);
    }
    this.data = users[key];
    return this.data;
  }

  async update(key, data): Promise<SessionData> {
    return new Promise(async (resolve, reject) => {
      const users = await this.loadAll();
      if (!users[key]) users[key] = <SessionData>{};
      for (const k in data) {
        users[key][k] = data[k];
      }
      writeFile(this.dbFilename, JSON.stringify(users), (err) => {
        if (err) return reject(err);
        resolve(users[key]);
      });
    });
  }

  private async loadAll(): Promise<Record<string, SessionData>> {
    return new Promise((resolve, reject) => {
      readFile(this.dbFilename, (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(data.toString()));
      });
    });
  }
}
