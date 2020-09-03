export interface Card {
  id: number;
  question: { text?: string; caption?: string; photoId?: string; videoId?: string };
  published: boolean;
  answer: { text?: string; caption?: string; photoId?: string; videoId?: string } | null;
  attempts: Array<{ timestamp: number; mark: number }>;
}
