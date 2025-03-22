export const fetchRewardsAPI = async () => {
    const response = await fetch('http://localhost:3001/rewards');
    return response.json();
  };
  
  export const createRewardAPI = async (reward) => {
    const response = await fetch('http://localhost:3001/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reward),
    });
    return response.json();
  };
  
  export const redeemRewardAPI = async (rewardId, userId) => {
    const response = await fetch(`http://localhost:3001/rewards/${rewardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redeemedBy: userId, status: 'redeemed' }),
    });
    return response.json();
  };