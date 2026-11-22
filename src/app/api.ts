import { AnswerResult } from '@/types/poll';

const API_URL = import.meta.env.VITE_API_URL || '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const pollApi = {
  fetchPoll: async (pollId: number): Promise<Response> => {
    if (USE_MOCKS) {
      await delay(1000);

      return fetch(`${import.meta.env.BASE_URL}mockData.json`);
    }

    return fetch(`${API_URL}/api/polls/${pollId}/`);
  },

  submitPoll: async (data: AnswerResult[]): Promise<Response> => {
    if (USE_MOCKS) {
      console.info('[Mock API] Отправка данных на сервер:', data);
      await delay(1000);

      return new Response(null, { status: 200, statusText: 'OK' });
    }

    return fetch(`${API_URL}/api/polls-results/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
