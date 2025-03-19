'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Home, CreditCard, LogIn, FileText, Menu } from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Cards',
    href: '/dashboard/cards',
    icon: CreditCard,
  },
  {
    title: 'Logins',
    href: '/dashboard/logins',
    icon: LogIn,
  },
  {
    title: 'Logs',
    href: '/dashboard/logs',
    icon: FileText,
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn('relative bg-background', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className={cn(
        'pb-12 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className={cn(
              "mb-2 px-4 text-lg font-semibold tracking-tight transition-all",
              isCollapsed && "opacity-0"
            )}>
              Dashboard
            </h2>
            <div className="space-y-1">
              <nav className="grid gap-1 px-2">
                {sidebarNavItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                      pathname === item.href ? 'bg-accent' : 'transparent',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className={cn(
                      'transition-all',
                      isCollapsed && 'hidden'
                    )}>
                      {item.title}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}