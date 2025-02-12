export default function VerifyEmailPage() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="mx-auto grid w-[480px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to Writer</h1>
          <p className="text-center text-muted-foreground">
            We have sent you an email to verify your account.
            <br/>
            Please check your inbox.
          </p>
        </div>
      </div>
    </div>
  )
}
