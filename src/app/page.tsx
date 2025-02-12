import { redirect } from 'next/navigation';

import SignInForm from '@/app/sign-in-form';
import { getServerAuthSession } from '@/server/auth';

export default async function Home() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect('/folders');
  }

  return (
    <section className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="mx-auto grid w-[480px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to Writer</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <SignInForm/>
      </div>
    </section>
  )
}
