import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg ring-1 ring-gray-900/5">
        <div className="text-center flex flex-col items-center">
          <div className="w-24 h-24 relative mb-4">
            <img src="/logo.png" alt="Logo" className="object-contain w-full h-full drop-shadow-lg " />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Job Ninjas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            A spatial recruiting operating system
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required 
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required 
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                placeholder="Password" />
            </div>
          </div>

          <div>
            <button type="button" disabled
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 opacity-50 cursor-not-allowed">
              Sign in (Coming Soon)
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-gray-500">Prototype Demo</span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/api/auth/skip" 
              className="flex w-full justify-center rounded-md bg-card px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Skip for now (Enter Demo Workspace)
            </Link>
          </div>
          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/terms" className="hover:text-gray-900 underline underline-offset-2 mx-2">
              Terms & Conditions
            </Link>
            |
            <Link href="/privacy" className="hover:text-gray-900 underline underline-offset-2 mx-2">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


