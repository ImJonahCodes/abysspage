'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { createCoinbaseCharge } from '@/lib/coinbase';
import { useToast } from '@/components/ui/use-toast';

interface BalanceDialogProps {
  onAddBalance: (amount: number) => Promise<void>;
}

export function BalanceDialog({ onAddBalance }: BalanceDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let paymentWindow: Window | null = null;

    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const payment = await createCoinbaseCharge(numAmount);
      
      if (!payment?.url) {
        throw new Error('No payment URL received');
      }

      // Open payment URL in new window
      paymentWindow = window.open(payment.url, '_blank');
      if (!paymentWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups and try again.');
      }
      
      setOpen(false);
      setAmount('');
      
      toast({
        title: 'Payment Initiated',
        description: 'Please complete your payment. Your balance will be updated automatically once the payment is confirmed.',
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      const errorMessage = error.message || 'Unable to process payment. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      if (!paymentWindow?.closed) {
        const checkWindow = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkWindow);
          }
        }, 1000);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Funds to Your Account</DialogTitle>
            <DialogDescription>
              Enter the amount you want to add. Payment will be processed securely via Coinbase Commerce.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">$</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="text-2xl"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}