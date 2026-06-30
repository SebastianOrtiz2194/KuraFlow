import '../skeleton.css';
import { MainLayout } from '@/components/layout/MainLayout';

export default function LeaderboardLoading() {
  return (
    <MainLayout>
      <div className="leaderboard-container" style={{ padding: '2rem' }}>
        <div className="skeleton skeleton-title" style={{ width: '30%', height: '3rem', marginBottom: '2rem' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton skeleton-text" style={{ height: '4rem', borderRadius: '0.5rem' }} />
          <div className="skeleton skeleton-text" style={{ height: '4rem', borderRadius: '0.5rem' }} />
          <div className="skeleton skeleton-text" style={{ height: '4rem', borderRadius: '0.5rem' }} />
          <div className="skeleton skeleton-text" style={{ height: '4rem', borderRadius: '0.5rem' }} />
          <div className="skeleton skeleton-text" style={{ height: '4rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </MainLayout>
  );
}
