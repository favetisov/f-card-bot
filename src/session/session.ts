export interface Session<SessionData> {
  data: SessionData;
  load: (key: string) => Promise<SessionData>;
  update: (key: string, data: Partial<SessionData>) => Promise<SessionData>;
}
