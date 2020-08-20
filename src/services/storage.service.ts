import { Category } from '../models/category';
import { Firestore } from '@google-cloud/firestore';

const db = new Firestore({
  projectId: 'f-cards-bot',
});

interface Value {
  state: string;
  categories: Category[];
}

export const load = async (chatId: number): Promise<Value> => {
  const collection = await db.collection('f-cards-bot').get();
  return db[chatId];
};

export const save = async (chatId: number, value: Value) => {
  db[chatId] = value;
};
