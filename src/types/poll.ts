export interface Answer {
  id: number;
  text: string | null;
  media: string | null;
  votes: number;
}

export interface AnswerResult {
  answer: number;
  answer_value: string | null;
}

export interface Question {
  id: number;
  text: string;
  max_answer: number;
  skippable: boolean;
  related_answer_id: number | null;
  answers: Answer[];
  answers_result?: AnswerResult[];
}

export interface PollReport {
  file: string;
}

export interface PollResult {
  answers: AnswerResult[];
}

export interface PollData {
  id: number;
  name: string;
  description: string | null;
  created_at: string | null;
  completed_at: string | null;
  report: PollReport | null;
  poll_result: PollResult | null;
  questions: Question[];
}
