import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/ui';

export default function VerifyEmailPage() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="mx-auto grid w-[480px] gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to Meal Tracker</h1>
          <p className="text-center text-muted-foreground">
            We have sent you an email to verify your account.
            <br/>
            Please check your inbox.
          </p>
          <Link href="/" className="mt-4">
            <Button variant="link">
              <ArrowLeftIcon className="mr-2 w-4 h-4" />
              Go back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
