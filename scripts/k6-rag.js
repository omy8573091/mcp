import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:8000';
  const token = __ENV.AUTH_TOKEN;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = http.post(`${base}/rag/query`, JSON.stringify({ question: 'What is in the docs?' }), { headers });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has answer': (r) => !!r.json('answer'),
  });
  sleep(1);
}

