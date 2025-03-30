import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  KeyRound, 
  Calendar 
} from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-primary">Auth System</Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                    Profile
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                    Login
                  </Link>
                  <Link href="/auth" className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-blue-600">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">Secure Authentication System</h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg">
              A robust authentication system with JWT token-based security and role-based authorization.
            </p>
            {!user && (
              <div className="mt-8 flex justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth">Login</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-800">Secure Authentication</h3>
                      <p className="mt-2 text-sm text-gray-600">JWT tokens with proper expiration and refresh mechanisms.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-800">Role-Based Access</h3>
                      <p className="mt-2 text-sm text-gray-600">Control user permissions with a flexible role system.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-800">Persistent Sessions</h3>
                      <p className="mt-2 text-sm text-gray-600">Stay logged in with localStorage token management.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2023 Auth System Demo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
