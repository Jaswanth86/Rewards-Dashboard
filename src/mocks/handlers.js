// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

let users = [
  { id: 1, name: 'John Doe', points: 100 },
  { id: 2, name: 'Jane Smith', points: 150 },
];

let rewards = [
  { id: 1, name: 'Gift Card', description: '$10 Gift Card', cost: 100, image: 'https://example.com/giftcard.jpg' },
  { id: 2, name: 'T-Shirt', description: 'Branded T-Shirt', cost: 200, image: 'https://example.com/tshirt.jpg' },
];

export const handlers = [
  // GET /api/users
  http.get('/api/users', () => {
    return HttpResponse.json(users);
  }),

  // PATCH /api/users/:userId/points
  http.patch('/api/users/:userId/points', async ({ params, request }) => {
    const { userId } = params;
    const { points, reason } = await request.json();
    const user = users.find(u => u.id === Number(userId));
    user.points += points;
    console.log(`Points adjusted for ${user.name}: ${points} - Reason: ${reason}`);
    return HttpResponse.json({ userId, points: user.points });
  }),

  // GET /api/rewards
  http.get('/api/rewards', () => {
    return HttpResponse.json(rewards);
  }),

  // POST /api/rewards
  http.post('/api/rewards', async ({ request }) => {
    const reward = await request.json();
    const newReward = { ...reward, id: rewards.length + 1 };
    rewards.push(newReward);
    return HttpResponse.json(newReward);
  }),

  // POST /api/rewards/:rewardId/redeem
  http.post('/api/rewards/:rewardId/redeem', async ({ params, request }) => {
    const { rewardId } = params;
    const { userId } = await request.json();
    const reward = rewards.find(r => r.id === Number(rewardId));
    reward.redeemedBy = userId;
    reward.status = 'redeemed';
    return HttpResponse.json({ rewardId, userId });
  }),
];