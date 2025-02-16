import { redirect } from 'next/navigation';

import { getServerAuthSession } from '@/server/auth';
import { NavLink, SubNavBar } from '@/components/sub-nav-bar';

export default async function IntakeLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect('/');
  }

  if (!session.user.isSetup) {
    redirect('/onboarding');
  }

  return (
    <>
      <SubNavBar>
        <NavLink to="/intake/daily" label="Daily"/>
        <NavLink to="/intake/weekly" label="Weekly"/>
      </SubNavBar>
      {children}
    </>
  );
}
