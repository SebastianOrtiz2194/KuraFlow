import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | KuraFlow',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
