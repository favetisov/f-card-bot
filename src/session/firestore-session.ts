import { CollectionReference, DocumentReference, Firestore } from '@google-cloud/firestore';
import { Session } from './session';

export class FirestoreSession<SessionData> implements Session<SessionData> {
  data: SessionData;
  private docRef: DocumentReference;
  private collection: CollectionReference;

  // projectId = collectionPath = 'f-cards-bot'
  constructor(projectId: string, collectionPath: string, private initialData: SessionData) {
    this.collection = new Firestore({ projectId }).collection(collectionPath);
  }

  async load(key): Promise<SessionData> {
    this.docRef = await this.collection.doc(key);
    this.data = Object.assign(this.initialData, (await this.docRef.get()).data());
    await this.update(null, this.data);
    return this.data;
  }

  async update(_, data): Promise<SessionData> {
    await this.docRef.update(data);
    for (const key in data) {
      this.data[key] = data[key];
    }
    return this.data;
  }
}
