'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Home, CreditCard, LogIn, FileText, Menu, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const sidebarNavItems = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Cards',
    icon: CreditCard,
    items: [
      {
        title: 'All Cards',
        href: '/dashboard/cards/all',
      },
      {
        title: 'Sold Cards',
        href: '/dashboard/cards/sold',
      },
      {
        title: 'Checked Cards',
        href: '/dashboard/cards/checked',
      },
      {
        title: 'Unchecked Cards',
        href: '/dashboard/cards/unchecked',
      }
    ],
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
    <div className={cn('relative bg-background flex flex-col', className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute right-2 top-2 h-6 w-6",
          isCollapsed && "relative right-0 top-0 w-full rounded-none h-12 justify-center"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12 hidden md:block' : 'w-64',
        isCollapsed && 'md:w-16'
      )}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className={cn(
              "mb-2 px-4 text-lg font-semibold tracking-tight transition-all",
              isCollapsed && "hidden md:block md:opacity-0"
            )}>
              Dashboard
            </h2>
            <div className="space-y-1">
              <nav className="grid gap-1 px-2">
                {sidebarNavItems.map((item, index) => (
                  item.items ? (
                    <DropdownMenu key={index}>
                      <DropdownMenuTrigger asChild>
                        <div>
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full justify-start gap-2',
                              item.items.some(subItem => pathname === subItem.href) && 'bg-accent',
                              isCollapsed && 'justify-center'
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {!isCollapsed && (
                              <>
                                <span>{item.title}</span>
                                <ChevronDown className="h-4 w-4 ml-auto" />
                              </>
                            )}
                          </Button>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className={cn(
                          "w-56",
                          isCollapsed && "ml-2"
                        )}
                      >
                        {item.items.map((subItem, subIndex) => (
                          <DropdownMenuItem key={subIndex} asChild>
                            <Link
                              href={subItem.href}
                              className={cn(
                                'w-full',
                                pathname === subItem.href && 'bg-accent'
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
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
                  )
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}