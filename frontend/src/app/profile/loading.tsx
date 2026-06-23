import '../skeleton.css';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ProfileLoading() {
  return (
    <MainLayout>
      <div className="profile-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div className="skeleton skeleton-circle" style={{ width: '120px', height: '120px' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-title" style={{ width: '50%' }} />
            <div className="skeleton skeleton-text" style={{ width: '30%' }} />
          </div>
        </div>
        
        <div className="skeleton skeleton-title" style={{ width: '20%', marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '150px' }} />
          <div className="skeleton skeleton-card" style={{ height: '150px' }} />
          <div className="skeleton skeleton-card" style={{ height: '150px' }} />
          <div className="skeleton skeleton-card" style={{ height: '150px' }} />
        </div>
      </div>
    </MainLayout>
  );
}
