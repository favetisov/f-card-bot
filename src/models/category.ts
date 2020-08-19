import { Card } from './card';

export interface Category {
  name: string;
  description?: string;
  cards: Card[];
}
