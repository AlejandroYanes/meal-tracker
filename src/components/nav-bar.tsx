'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import {
  CalendarDaysIcon,
  CookingPotIcon,
  HeadsetIcon,
  LogOutIcon,
  ShoppingCartIcon,
  SoupIcon,
  UserIcon,
} from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui';

interface Props {
  session: Session;
}

export default function NavBar(props: Props) {
  const { session } = props;

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-neutral-200 bg-white sm:flex dark:bg-gray-950">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Link
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-purple-600 text-lg font-semibold text-gray-50 md:h-8 md:w-8 md:text-base dark:bg-gray-50 dark:text-gray-900"
            href="/landing"
          >
            <SoupIcon />
            <span className="sr-only">Meal Tracker</span>
          </Link>
          <NavItem href="/intake" icon={<CalendarDaysIcon className="h-5 w-5"/>} name="Intake records"/>
          <NavItem href="/meals" icon={<CookingPotIcon className="h-5 w-5"/>} name="Meals"/>
          <NavItem href="/groceries" icon={<ShoppingCartIcon className="h-5 w-5"/>} name="Groceries"/>
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="overflow-hidden rounded-full" size="icon" variant="outline">
              <UserIcon className="h-5 w-5"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ml-4 min-w-40">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem>
              <HeadsetIcon className="h-4 w-4 mr-2"/>
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/', redirect: true })}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </aside>
  );
}

function NavItem({ href, icon, name }: { href: string; icon: React.ReactNode; name: string }) {
  const pathname = usePathname();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          data-active={pathname.startsWith(href)}
          className="flex h-9 w-9 items-center justify-center text-gray-500 data-[active=true]:rounded-lg data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 transition-colors hover:text-gray-950 md:h-8 md:w-8 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50"
          href={href}
        >
          {icon}
          <span className="sr-only">{name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{name}</TooltipContent>
    </Tooltip>
  );
}
