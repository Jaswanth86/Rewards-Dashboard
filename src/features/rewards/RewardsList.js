import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchRewards, redeemReward, selectAllRewards } from './rewardsSlice';
import { fetchUsers, adjustPoints, selectUserById } from '../users/usersSlice';
import { fetchCampaigns, selectAllCampaigns } from '../campaigns/campaignsSlice';
import { useAuth } from '../../context/AuthContext';

function RewardsList() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const rewards = useAppSelector(selectAllRewards);
  const campaigns = useAppSelector(selectAllCampaigns);
  const userData = useAppSelector((state) => selectUserById(state, user?.id));
  const { loading: rewardsLoading, error: rewardsError } = useAppSelector((state) => state.rewards);
  const { loading: usersLoading, error: usersError } = useAppSelector((state) => state.users);
  const { loading: campaignsLoading, error: campaignsError } = useAppSelector((state) => state.campaigns);
  const [cart, setCart] = useState([]);
  const [costFilter, setCostFilter] = useState('all');
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchRewards());
    dispatch(fetchUsers());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // Preload images
  useEffect(() => {
    const imageUrls = rewards.map(reward => reward.image);
    const preloadImages = async () => {
      const promises = imageUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = resolve; // Resolve even if the image fails to load
        });
      });
      await Promise.all(promises);
      setImagesLoaded(true);
    };
    preloadImages();
  }, [rewards]);

  const handleAddToCart = (reward) => {
    setCart([...cart, reward]);
  };

  const handleRemoveFromCart = (rewardId) => {
    setCart(cart.filter(item => item.id !== rewardId));
  };

  const handleRedeem = async () => {
    if (!userData) {
      alert('User not found!');
      return;
    }
    const totalCost = cart.reduce((sum, item) => sum + item.cost, 0);
    if (userData.points >= totalCost) {
      try {
        for (const reward of cart) {
          await dispatch(redeemReward({ rewardId: reward.id, userId: user.id })).unwrap();
          await dispatch(adjustPoints({ userId: user.id, points: -reward.cost, reason: 'Reward redemption' })).unwrap();
        }
        setCart([]);
        alert('Rewards redeemed successfully!');
      } catch (error) {
        alert('Failed to redeem rewards: ' + error.message);
      }
    } else {
      alert('Not enough points!');
    }
  };

  const currentDate = new Date('2025-03-21');
  const activeCampaigns = campaigns.filter(campaign => {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    return startDate <= currentDate && currentDate <= endDate;
  });

  const activeCampaignIds = activeCampaigns.map(campaign => campaign.id);
  const activeRewards = rewards.filter(reward => activeCampaignIds.includes(reward.campaignId));

  const filteredRewards = useMemo(() => {
    return activeRewards.filter(reward => {
      if (costFilter === 'all') return true;
      if (costFilter === 'under100') return reward.cost < 100;
      if (costFilter === '100to200') return reward.cost >= 100 && reward.cost <= 200;
      if (costFilter === 'above200') return reward.cost > 200;
      return true;
    });
  }, [activeRewards, costFilter]);

  if (rewardsLoading || usersLoading || campaignsLoading || !imagesLoaded) return <div className="loading">Loading...</div>;
  if (rewardsError) return <div className="error">{rewardsError}</div>;
  if (usersError) return <div className="error">{usersError}</div>;
  if (campaignsError) return <div className="error">{campaignsError}</div>;

  return (
    <div className="rewards-list">
      <h2>Rewards Marketplace</h2>
      {userData && (
        <div className="user-points">
          <p>Points Available: {userData.points}</p>
        </div>
      )}
      <div className="filter-controls">
        <label>Filter by Cost: </label>
        <select
          value={costFilter}
          onChange={(e) => setCostFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="under100">Under 100 Points</option>
          <option value="100to200">100 - 200 Points</option>
          <option value="above200">Above 200 Points</option>
        </select>
      </div>
      {activeCampaigns.length > 0 && (
        <div className="active-campaigns">
          <h3>Active Campaigns</h3>
          {activeCampaigns.map(campaign => (
            <div key={campaign.id} className="campaign-info">
              <p>
                {campaign.name}: {campaign.description} (Ends{' '}
                {new Date(campaign.endDate).toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC'
                })})
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="rewards-grid">
        {filteredRewards.length > 0 ? (
          filteredRewards.map(reward => (
            <div key={reward.id} className="reward-card">
              <img src={reward.image} alt={reward.name} onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found'} />
              <h3>{reward.name}</h3>
              <p>{reward.description}</p>
              <p>{reward.cost} points</p>
              <button
                onClick={() => handleAddToCart(reward)}
                disabled={reward.redeemedBy}
              >
                {reward.redeemedBy ? `Redeemed by User ${reward.redeemedBy}` : 'Add to Cart'}
              </button>
            </div>
          ))
        ) : (
          <div>No rewards available in active campaigns.</div>
        )}
      </div>
      <div className="cart">
        <h3>Cart ({cart.length} items)</h3>
        {cart.length > 0 ? (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name} - {item.cost} points</span>
              <button
                className="remove-button"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <div>Your cart is empty.</div>
        )}
        <button onClick={handleRedeem} disabled={!cart.length}>
          Redeem ({cart.reduce((sum, item) => sum + item.cost, 0)} points)
        </button>
      </div>
      <div className="redemption-history">
        <h3>Redemption History</h3>
        {userData && rewards
          .filter(r => r.redeemedBy === user.id)
          .map(r => (
            <div key={r.id} className="redemption-item">
              {r.name} - Redeemed on {new Date().toLocaleString()}
            </div>
          ))}
        {userData && rewards.filter(r => r.redeemedBy === user.id).length === 0 && (
          <div>No rewards redeemed yet.</div>
        )}
      </div>
    </div>
  );
}

export default RewardsList;