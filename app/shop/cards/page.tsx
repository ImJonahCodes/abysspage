'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, CreditCard } from 'lucide-react';
import { CartSheet } from '@/components/cart-sheet';
import { useCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

interface Card {
  id: string;
  cardholder_name: string;
  billing_address: {
    city: string;
    state: string;
    country: string;
  };
  card_bin: string;
  card_type: string;
  created_at: string;
}

type SortField = 'bin' | 'state' | 'city' | 'type';
type SortDirection = 'asc' | 'desc';

const CARD_PRICE = 15; // Fixed card price

export default function CardsPage() {
  const { dispatch } = useCart();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('bin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState({
    bin: '',
    state: '',
    city: '',
    type: 'all',
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedCards = data.map(card => ({
        ...card,
        card_type: getCardType(card.card_bin),
      }));

      setCards(processedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardType = (bin: string): string => {
    const firstDigit = bin.charAt(0);
    switch (firstDigit) {
      case '3':
        return 'Amex';
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '6':
        return 'Discover';
      default:
        return 'Unknown';
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const addToCart = (card: Card) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: card.id,
        bin: card.card_bin,
        state: card.billing_address.state,
        city: card.billing_address.city,
        type: card.card_type,
        price: CARD_PRICE,
      },
    });
  };

  const filteredAndSortedCards = cards
    .filter(card => {
      return (
        card.card_bin.toLowerCase().includes(filters.bin.toLowerCase()) &&
        card.billing_address.state.toLowerCase().includes(filters.state.toLowerCase()) &&
        card.billing_address.city.toLowerCase().includes(filters.city.toLowerCase()) &&
        (filters.type === 'all' || card.card_type === filters.type)
      );
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'bin':
          return a.card_bin.localeCompare(b.card_bin) * direction;
        case 'state':
          return a.billing_address.state.localeCompare(b.billing_address.state) * direction;
        case 'city':
          return a.billing_address.city.localeCompare(b.billing_address.city) * direction;
        case 'type':
          return a.card_type.localeCompare(b.card_type) * direction;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Available Cards</h1>
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-muted-foreground">
            Price per card: <span className="text-primary">${CARD_PRICE}</span>
          </div>
          <CartSheet />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Filter by BIN"
            value={filters.bin}
            onChange={(e) => setFilters({ ...filters, bin: e.target.value })}
          />
        </div>
        <div>
          <Input
            placeholder="Filter by State"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          />
        </div>
        <div>
          <Input
            placeholder="Filter by City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        </div>
        <div>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Card Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Visa">Visa</SelectItem>
              <SelectItem value="Mastercard">Mastercard</SelectItem>
              <SelectItem value="Amex">Amex</SelectItem>
              <SelectItem value="Discover">Discover</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('bin')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  BIN
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('state')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  State
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('city')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  City
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('type')}
                  className="h-8 px-2 hover:bg-transparent"
                >
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No cards found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono">{card.card_bin}</TableCell>
                  <TableCell>{card.billing_address.state}</TableCell>
                  <TableCell>{card.billing_address.city}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      card.card_type === 'Visa' ? 'bg-blue-100 text-blue-700' :
                      card.card_type === 'Mastercard' ? 'bg-red-100 text-red-700' :
                      card.card_type === 'Amex' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {card.card_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">${CARD_PRICE}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => addToCart(card)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}