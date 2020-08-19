import { writeFileSync, readFileSync, existsSync } from 'fs';
import { Category } from '../models/category';

interface Value {
  state: string;
  categories: Category[];
}

const filepath = __dirname + '/../../db.json';

const readFile = () => {
  if (!existsSync(filepath)) {
    writeFileSync(filepath, '{}');
    return {};
  } else {
    return JSON.parse(readFileSync(filepath).toString());
  }
};

export const load = (chatId: number): Value => {
  return readFile()[chatId];
};

export const save = (chatId: number, value: Value) => {
  const file = readFile();
  file[chatId] = value;
  writeFileSync(filepath, JSON.stringify(file));
};
