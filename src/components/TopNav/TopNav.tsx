import clsx from 'clsx';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { CgProfile } from 'react-icons/cg';
import { MdHome, MdLogin } from 'react-icons/md';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

import { ModeToggle } from '../ModeToggle/ModeToggle';
import { NavigationMenu, NavigationMenuItem } from '../ui';

export const TopNav = (): ReactNode => {
  const classNames = clsx(
    'sticky top-0 p-2 flex justify-center',
    'md:p-3',
    'xl:p-4',
    'bg-card border-b'
  );

  return (
    <div className={classNames}>
      <NavigationMenu className='flex-1 max-w-screen-xl flex justify-between'>
        <NavigationMenuItem className='list-none'>
          <Link
            href='/'
            className='flex items-center gap-2'
          >
            <MdHome size={32} />
            Home
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className='list-none'>
          <SignedIn>
            <Link
              href='/profile'
              className='flex items-center gap-2'
            >
              <CgProfile size={32} />
              Profile
            </Link>
          </SignedIn>
        </NavigationMenuItem>
        <NavigationMenuItem className='list-none'>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className='flex items-center gap-2'>
              <MdLogin size={32} />
              <SignInButton mode='modal' />
            </div>
          </SignedOut>
        </NavigationMenuItem>
        <NavigationMenuItem className='list-none'>
          <ModeToggle />
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  );
};
