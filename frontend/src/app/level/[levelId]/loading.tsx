import '../../skeleton.css';
import { MainLayout } from '@/components/layout/MainLayout';

export default function LevelLoading() {
  return (
    <MainLayout>
      <div className="level-container" style={{ padding: '2rem' }}>
        <div className="skeleton skeleton-title" style={{ width: '40%', height: '3rem', marginBottom: '1rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '3rem' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '120px' }} />
          <div className="skeleton skeleton-card" style={{ height: '120px' }} />
          <div className="skeleton skeleton-card" style={{ height: '120px' }} />
        </div>
      </div>
    </MainLayout>
  );
}
