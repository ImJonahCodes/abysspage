'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceDialog } from '@/components/balance-dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface UserInfo {
  current_balance: number;
  orders: any[];
  balance_logs: {
    type: string;
    amount: number;
    payment_id: string;
    timestamp: string;
  }[];
}

interface PaymentStatus {
  'charge:created': number;
  'charge:pending': number;
  'charge:confirmed': number;
  'charge:delayed': number;
  'charge:failed': number;
}

export default function ShopHome() {
  const { toast } = useToast();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [lastOrder, setLastOrder] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    'charge:created': 0,
    'charge:pending': 0,
    'charge:confirmed': 0,
    'charge:delayed': 0,
    'charge:failed': 0
  });

  useEffect(() => {
    fetchData();
    const timeInterval = setInterval(() => setNow(new Date()), 1000);
    const dataInterval = setInterval(fetchData, 10000); // Refresh data every 10 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // Fetch user information
      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_information')
        .select('*')
        .eq('id', session.user.id);

      if (userInfoError) {
        console.error('Error fetching user info:', userInfoError);
        return;
      }
      
      if (userInfoData && userInfoData.length > 0) {
        const userData = userInfoData[0] as UserInfo;
        setUserInfo(userData);
      }

      // Calculate payment statuses from balance logs
      if (userInfoData?.[0]?.balance_logs) {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const status = {
          'charge:created': 0,
          'charge:pending': 0,
          'charge:confirmed': 0,
          'charge:delayed': 0,
          'charge:failed': 0
        };

        userInfoData[0].balance_logs.forEach((log: any) => {
          const logTime = new Date(log.timestamp);
          if (logTime > last24Hours) {
            if (status.hasOwnProperty(log.type)) {
              status[log.type as keyof PaymentStatus]++;
            }
          }
        });

        setPaymentStatus(status);
      }

      // Fetch orders count and last order
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      setTotalOrders(orders?.length || 0);
      setLastOrder(orders?.[0]?.created_at || null);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      // Create initial balance log entry
      const { error: logError } = await supabase
        .from('user_information')
        .update({
          balance_logs: supabase.sql`array_append(balance_logs, ${JSON.stringify({
            type: 'charge:created',
            amount,
            payment_id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          })})`
        })
        .eq('id', session.user.id);

      if (logError) throw logError;

      toast({
        title: 'Payment Processing',
        description: 'Your balance will be updated once the payment is confirmed.',
      });
    } catch (error) {
      console.error('Error adding balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate payment',
        variant: 'destructive',
      });
    }
  };

  const formatLastOrder = (timestamp: string | null) => {
    if (!timestamp) return 'No orders yet';
    const date = new Date(timestamp);
    
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes === 0) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'charge:created':
        return 'bg-blue-500 text-white';
      case 'charge:pending':
        return 'bg-yellow-500 text-white';
      case 'charge:confirmed':
        return 'bg-green-500 text-white';
      case 'charge:delayed':
        return 'bg-orange-500 text-white';
      case 'charge:failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'charge:created':
        return 'Created';
      case 'charge:pending':
        return 'Pending';
      case 'charge:confirmed':
        return 'Confirmed';
      case 'charge:delayed':
        return 'Delayed';
      case 'charge:failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Welcome to Your Shop Dashboard</h1>
          <p className="text-muted-foreground">View your orders and account information</p>
        </div>
        <BalanceDialog onAddBalance={handleAddBalance} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? '...' : `$${userInfo?.current_balance.toFixed(2) || '0.00'}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Last Order</CardTitle>
            <CardDescription>Your most recent purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium">
              {loading ? '...' : formatLastOrder(lastOrder)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All time purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? '...' : totalOrders}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status (Last 24 Hours)</CardTitle>
          <CardDescription>Overview of your recent payment activities</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(paymentStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <Badge variant="secondary" className={getStatusColor(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <p className="mt-2 text-2xl font-bold">{count}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
          <CardDescription>Recent balance changes and payment status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userInfo?.balance_logs.slice().reverse().map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{formatStatus(log.type)}</TableCell>
                  <TableCell>${log.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(log.type)}>
                      {formatStatus(log.type)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}