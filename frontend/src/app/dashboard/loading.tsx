import '../skeleton.css';
import { MainLayout } from '@/components/layout/MainLayout';

export default function DashboardLoading() {
  return (
    <MainLayout>
      <div className="dashboard" style={{ padding: '2rem' }}>
        <div className="skeleton skeleton-title" style={{ width: '40%', height: '3rem', marginBottom: '1rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '2rem' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    </MainLayout>
  );
}
