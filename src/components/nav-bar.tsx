'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { HeadsetIcon, LogOutIcon, PalmtreeIcon, SettingsIcon, UserIcon, UsersIcon } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  InputWithLabel,
  Label, Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextareaWithLabel,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  WhiteLogo,
  toast,
} from '@hr-hub/ui';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@hr-hub/user-portal/src/trpc/react';
import { useState } from 'react';

interface Props {
  session: Session;
}

export default function NavBar(props: Props) {
  const { session } = props;
  const [showSupportModal, setShowSupportModal] = useState(false);

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-neutral-200 bg-white sm:flex dark:bg-gray-950">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Link
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-600 text-lg font-semibold text-gray-50 md:h-8 md:w-8 md:text-base dark:bg-gray-50 dark:text-gray-900"
            href="/"
          >
            <WhiteLogo />
            <span className="sr-only">Acme Inc</span>
          </Link>
          <NavItem href="/team" icon={<UsersIcon className="h-5 w-5"/>} name="Team"/>
          <NavItem href="/time-off" icon={<PalmtreeIcon className="h-5 w-5"/>} name="Time Off"/>
          <NavItem href="/settings" icon={<SettingsIcon className="h-5 w-5"/>} name="Settings"/>
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
      {showSupportModal && (
        <SupportModal onClose={() => setShowSupportModal(false)} />
      )}
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

interface SupportModalProps {
  onClose: () => void;
}

const supportTicketSchema = z.object({
  title: z.string().min(1, 'Please add a short title to your ticket'),
  level: z.enum(['low', 'medium', 'high']),
  description: z.string().min(20, 'Please add a short description'),
});

function SupportModal(props: SupportModalProps) {
  const { onClose } = props;

  const form = useForm({
    defaultValues: {
      title: '',
      level: 'low',
      description: '',
    },
    resolver: zodResolver(supportTicketSchema),
  });

  const { mutate: sendSupportTicket, isPending, error } = api.users.sendSupportTicket.useMutation({
    onSuccess: () => {
      toast('Thanks for your feedback', {
        description: 'We received your ticket and will work on it as soon as possible.'
      });
      onClose();
    },
  });

  const handleSubmit = form.handleSubmit((data) => sendSupportTicket({ ...data, level: data.level as any }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Create a support ticket
          </DialogTitle>
          <DialogDescription>
            We will do our best to address any issues as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <Controller
              name="title"
              control={form.control}
              render={({ field }) => (
                <InputWithLabel
                  required
                  label="Title"
                  {...field}
                  value={field.value ?? ''}
                  error={form.formState.errors.title?.message}
                />
              )}
            />
            <Controller
              name="level"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <Label>Level</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Small issue</SelectItem>
                      <SelectItem value="medium">Makes completing a task difficult</SelectItem>
                      <SelectItem value="high">Stops me from completing a task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <TextareaWithLabel
                  required
                  rows={10}
                  label="Description"
                  {...field}
                  value={field.value ?? ''}
                  error={form.formState.errors.description?.message}
                />
              )}
            />
          </div>
          <div className="mt-8 flex flex-col gap-2">
            {error?.message ? <span className="text-red-500 text-sm">{error.message}</span> : null}
            <DialogFooter>
              <Button disabled={isPending}>
                {isPending ? <Loader size="icon" color="white" className="mr-1"/> : null}
                Submit
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
