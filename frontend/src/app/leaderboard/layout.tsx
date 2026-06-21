import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | KuraFlow',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
