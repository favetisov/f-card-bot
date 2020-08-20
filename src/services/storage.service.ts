import { Category } from '../models/category';

const db = {}; // simply writing db to memory. we should update this to work with firebase storage

interface Value {
  state: string;
  categories: Category[];
}

export const load = (chatId: number): Value => {
  return db[chatId];
};

export const save = (chatId: number, value: Value) => {
  db[chatId] = value;
};
