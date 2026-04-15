// ─── ChoreEffects — Global Celebration Layer ─────────────────────────────────
// Rendered once inside AppShell; watches store triggers and shows celebrations.
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import HeartCelebration from './HeartCelebration';
import StarCelebration  from './StarCelebration';
import GiftMilestoneModal from './GiftMilestoneModal';

const ChoreEffects: React.FC = () => {
  const {
    newHeartChildId, newStarChildId, pendingGiftChildId,
    children, checkPendingGift,
  } = useAppStore();

  // On mount: restore gift popup if snooze has expired
  useEffect(() => {
    checkPendingGift();
    // Re-check every 5 minutes while app is open
    const interval = setInterval(checkPendingGift, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const heartChild = newHeartChildId ? children.find((c) => c.id === newHeartChildId) : null;
  const starChild  = newStarChildId  ? children.find((c) => c.id === newStarChildId)  : null;

  // Priority: Gift > Star > Heart (show only one at a time)
  if (pendingGiftChildId) {
    return <GiftMilestoneModal childId={pendingGiftChildId}/>;
  }
  if (starChild) {
    return <StarCelebration childName={starChild.name}/>;
  }
  if (heartChild) {
    return <HeartCelebration childName={heartChild.name}/>;
  }

  return null;
};

export default ChoreEffects;
