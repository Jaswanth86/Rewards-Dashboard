export const fetchUsersAPI = async () => {
  const response = await fetch('http://localhost:3001/users');
  return response.json();
};

export const adjustPointsAPI = async (userId, points, reason) => {
  const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
  const user = await userResponse.json();
  const updatedPoints = user.points + points;
  const response = await fetch(`http://localhost:3001/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: updatedPoints }),
  });
  return { userId, points: updatedPoints };
};