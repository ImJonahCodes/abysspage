'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/lib/cart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function CartSheet() {
  const { state, dispatch } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {state.items.length > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {state.items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {state.items.length === 0 ? (
            <p className="text-center text-muted-foreground">Your cart is empty</p>
          ) : (
            <>
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">BIN: {item.bin}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.state}, {item.city}
                        </p>
                        <p className="text-sm">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            item.type === 'Visa' ? 'bg-blue-100 text-blue-700' :
                            item.type === 'Mastercard' ? 'bg-red-100 text-red-700' :
                            item.type === 'Amex' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {item.type}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">${item.price}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Total</p>
                  <p className="font-bold">${state.total.toFixed(2)}</p>
                </div>
                <Button className="w-full" size="lg">
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}