import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Inbox, Send, Archive, Trash, Star } from "lucide-react";

// Mock email data (in a real app, this would come from an API)
const mockEmails = [
  {
    id: 1,
    from: "support@company.com",
    subject: "Welcome to Your Account",
    preview: "Thank you for signing up! We're excited to have you on board...",
    date: "2023-12-01",
    read: true,
    starred: true,
  },
  {
    id: 2,
    from: "newsletter@tech.com",
    subject: "This Week in Technology",
    preview: "The latest tech news, updates, and insights for the week of...",
    date: "2023-12-02",
    read: false,
    starred: false,
  },
  {
    id: 3,
    from: "notifications@social.com",
    subject: "New Connection Request",
    preview: "You have a new connection request from John Doe. Accept or decline...",
    date: "2023-12-03",
    read: false,
    starred: false,
  },
];

export default function EmailPage() {
  const { user, isLoading, logoutMutation } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Protected route will handle redirect if user is not logged in
  if (!user) {
    return <div>Redirecting to login...</div>;
  }

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
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/profile" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Profile
                </Link>
                <Link href="/email" className="px-3 py-2 text-sm font-medium text-primary border-b-2 border-primary">
                  Email
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 mb-6 md:mb-0">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 bg-primary text-white">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span className="text-lg font-medium">Mailbox</span>
                  </div>
                  <div className="mt-1 text-sm text-white/80">{user.email}</div>
                </div>
                <nav className="p-2">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start">
                      <Inbox className="mr-2 h-4 w-4" />
                      Inbox
                      <span className="ml-auto bg-blue-100 text-primary text-xs py-0.5 px-2 rounded-full">2</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Starred
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Send className="mr-2 h-4 w-4" />
                      Sent
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Trash className="mr-2 h-4 w-4" />
                      Trash
                    </Button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Email List */}
            <div className="md:ml-6 flex-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">Inbox</h2>
                  <Button variant="outline" size="sm">
                    Refresh
                  </Button>
                </div>
                <div className="divide-y divide-gray-200">
                  {mockEmails.map((email) => (
                    <div 
                      key={email.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${!email.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            <p className={`text-sm font-medium ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {email.from}
                            </p>
                            <p className="ml-2 text-xs text-gray-500">{email.date}</p>
                            {email.starred && (
                              <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className={`mt-1 text-sm ${!email.read ? 'font-semibold' : 'font-normal'}`}>
                            {email.subject}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {email.preview}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {mockEmails.length === 0 && (
                    <div className="py-12">
                      <div className="text-center">
                        <Mail className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No emails</h3>
                        <p className="mt-1 text-sm text-gray-500">Your inbox is empty.</p>
                      </div>
                    </div>
                  )}
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