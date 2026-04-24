import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function Home() {
  return (
    <MainLayout>
      <div className="py-10">
        <section className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, Sebastian!</h1>
          <p className="text-muted-foreground text-lg">You&apos;ve learned 15 new words this week. Keep it up!</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card variant="premium">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold mb-0">Daily Goal</h3>
                <Badge variant="success">On Track</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Complete 2 more lessons to hit your daily target.</p>
              <ProgressBar value={60} showLabel variant="primary" />
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">View Details</Button>
            </CardFooter>
          </Card>

          <Card variant="default" className="card-interactive">
            <CardHeader>
              <h3 className="text-xl font-bold mb-0">Current Level</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold">
                  JP
                </div>
                <div>
                  <p className="font-bold">Japanese N5</p>
                  <p className="text-xs text-muted-foreground">Beginner Level</p>
                </div>
              </div>
              <ProgressBar value={35} showLabel variant="secondary" size="sm" />
            </CardContent>
          </Card>

          <Card variant="glass" className="card-interactive">
            <CardHeader>
              <h3 className="text-xl font-bold mb-0">SRS Review</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                <span className="text-4xl font-bold text-primary">24</span>
                <span className="text-sm text-muted-foreground">Cards due for review</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary" className="w-full">Start Review</Button>
            </CardFooter>
          </Card>
        </div>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold mb-0">Continue Learning</h2>
            <Button variant="outline" size="sm">Browse All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default" className="card-interactive">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-1/3 bg-indigo-500 h-32 flex items-center justify-center text-2xl font-bold text-white">
                    VOCAB
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="primary">Vocabulary</Badge>
                      <Badge variant="outline">10 min</Badge>
                    </div>
                    <h4 className="font-bold mb-1">Common Food Items</h4>
                    <p className="text-xs text-muted-foreground">Learn how to order at a Japanese restaurant.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" className="card-interactive">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-1/3 bg-teal-500 h-32 flex items-center justify-center text-2xl font-bold text-white">
                    GRAMMAR
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">Grammar</Badge>
                      <Badge variant="outline">15 min</Badge>
                    </div>
                    <h4 className="font-bold mb-1">Particles: Ni and De</h4>
                    <p className="text-xs text-muted-foreground">Understanding location and direction markers.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
