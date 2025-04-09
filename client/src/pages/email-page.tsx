import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Mail, Inbox, Send, Archive, Trash, Star, 
  RefreshCw, Plus, Reply, ArrowLeft, Eye, ArrowUpRight,
  XCircle, ArchiveIcon, FilePen, StarIcon
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Type definitions matching backend
type Email = {
  id: number;
  userId: number;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  subject: string;
  body: string;
  status: "inbox" | "sent" | "archived" | "trash";
  read: boolean;
  starred: boolean;
  createdAt: string;
};

// Form type for composing new emails
type ComposeEmailForm = {
  toEmail: string;
  subject: string;
  body: string;
};

export default function EmailPage() {
  const { user, isLoading: authLoading, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState<ComposeEmailForm>({
    toEmail: "",
    subject: "",
    body: ""
  });

  // Parse URL to determine active folder
  useEffect(() => {
    const path = location.split('/');
    if (path.length > 2) {
      const folder = path[2];
      const validFolders = ["inbox", "sent", "archived", "trash", "starred"];
      if (validFolders.includes(folder)) {
        setActiveFolder(folder);
      }
    } else {
      // Default to inbox
      setLocation("/email/inbox", { replace: true });
    }
  }, [location]);

  // Fetch emails for the active folder
  const { 
    data: emails, 
    isLoading: emailsLoading, 
    isError: emailsError,
    refetch: refetchEmails,
  } = useQuery<Email[]>({
    queryKey: ['/api/emails', activeFolder],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/emails/${activeFolder}`);
      return await res.json();
    },
    enabled: !!user && !!activeFolder,
  });

  // View a single email by ID
  const viewEmail = async (emailId: number) => {
    try {
      const res = await apiRequest('GET', `/api/emails/view/${emailId}`);
      const email = await res.json();
      setSelectedEmail(email);
    } catch (error) {
      console.error("Error viewing email:", error);
      toast({
        title: "Error",
        description: "Could not load the email. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Star/unstar email mutation
  const starEmailMutation = useMutation({
    mutationFn: async ({ id, starred }: { id: number; starred: boolean }) => {
      const res = await apiRequest('PATCH', `/api/emails/${id}/star`, { starred });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails', activeFolder] });
      if (selectedEmail) {
        setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to update star status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mark email as read/unread mutation
  const markReadMutation = useMutation({
    mutationFn: async ({ id, read }: { id: number; read: boolean }) => {
      const res = await apiRequest('PATCH', `/api/emails/${id}/read`, { read });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails', activeFolder] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to mark email status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update email status mutation (move to another folder)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/emails/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      setSelectedEmail(null);
      toast({
        title: "Email Updated",
        description: "The email has been moved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to update email: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete email mutation
  const deleteEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      setSelectedEmail(null);
      toast({
        title: "Email Deleted",
        description: "The email has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: `Failed to delete email: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: ComposeEmailForm) => {
      const res = await apiRequest('POST', '/api/emails', {
        ...emailData,
        fromEmail: user?.email,
        fromName: user?.username,
      });
      return await res.json();
    },
    onSuccess: () => {
      setComposeOpen(false);
      setComposeForm({
        toEmail: "",
        subject: "",
        body: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails', 'sent'] });
      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendEmail = () => {
    // Validate form
    if (!composeForm.toEmail) {
      toast({
        title: "Validation Error",
        description: "Recipient email is required",
        variant: "destructive",
      });
      return;
    }

    if (!composeForm.subject) {
      toast({
        title: "Validation Error",
        description: "Subject is required",
        variant: "destructive",
      });
      return;
    }

    if (!composeForm.body) {
      toast({
        title: "Validation Error",
        description: "Message body is required",
        variant: "destructive",
      });
      return;
    }

    // Send the email
    sendEmailMutation.mutate(composeForm);
  };

  // Handle archive action
  const handleArchiveEmail = (emailId: number) => {
    updateStatusMutation.mutate({ id: emailId, status: "archived" });
  };

  // Handle trash action
  const handleTrashEmail = (emailId: number) => {
    updateStatusMutation.mutate({ id: emailId, status: "trash" });
  };

  // Handle permanent delete
  const handleDeleteEmail = (emailId: number) => {
    if (confirm("Are you sure you want to permanently delete this email?")) {
      deleteEmailMutation.mutate(emailId);
    }
  };

  // Return email to inbox
  const handleReturnToInbox = (emailId: number) => {
    updateStatusMutation.mutate({ id: emailId, status: "inbox" });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Loading state
  if (authLoading) {
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

  // Count unread emails
  const countUnread = (emails || []).filter(email => !email.read).length;

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
                <Link href="/email/inbox" className="px-3 py-2 text-sm font-medium text-primary border-b-2 border-primary">
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
                
                {/* Compose button */}
                <div className="p-2">
                  <Button 
                    onClick={() => setComposeOpen(true)} 
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Compose
                  </Button>
                </div>
                
                <nav className="p-2">
                  <div className="space-y-1">
                    <Button 
                      variant={activeFolder === "inbox" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setLocation("/email/inbox")}
                    >
                      <Inbox className="mr-2 h-4 w-4" />
                      Inbox
                      {countUnread > 0 && (
                        <span className="ml-auto bg-blue-100 text-primary text-xs py-0.5 px-2 rounded-full">
                          {countUnread}
                        </span>
                      )}
                    </Button>
                    
                    <Button 
                      variant={activeFolder === "starred" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setLocation("/email/starred")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Starred
                    </Button>
                    
                    <Button 
                      variant={activeFolder === "sent" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setLocation("/email/sent")}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Sent
                    </Button>
                    
                    <Button 
                      variant={activeFolder === "archived" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setLocation("/email/archived")}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                    
                    <Button 
                      variant={activeFolder === "trash" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setLocation("/email/trash")}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Trash
                    </Button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Email Content Area */}
            <div className="md:ml-6 flex-1">
              <div className="bg-white shadow rounded-lg overflow-hidden h-full">
                {/* Header for folder view */}
                {!selectedEmail && (
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800 capitalize">
                      {activeFolder}
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => refetchEmails()}
                      disabled={emailsLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${emailsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                )}

                {/* Email list view */}
                {!selectedEmail && (
                  <div className="divide-y divide-gray-200">
                    {emailsLoading ? (
                      <div className="py-12">
                        <div className="text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading emails</h3>
                        </div>
                      </div>
                    ) : emailsError ? (
                      <div className="py-12">
                        <div className="text-center">
                          <XCircle className="mx-auto h-12 w-12 text-red-500" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load emails</h3>
                          <p className="mt-1 text-sm text-gray-500">Please try refreshing the page.</p>
                        </div>
                      </div>
                    ) : emails && emails.length > 0 ? (
                      emails.map((email) => (
                        <div 
                          key={email.id} 
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${!email.read ? 'bg-blue-50' : ''}`}
                          onClick={() => viewEmail(email.id)}
                        >
                          <div className="flex items-start">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center">
                                <p className={`text-sm font-medium ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {activeFolder === 'sent' ? email.toEmail : email.fromEmail}
                                </p>
                                <p className="ml-2 text-xs text-gray-500">
                                  {formatDate(email.createdAt)}
                                </p>
                                {email.starred && (
                                  <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className={`mt-1 text-sm ${!email.read ? 'font-semibold' : 'font-normal'}`}>
                                {email.subject}
                              </p>
                              <p className="mt-1 text-sm text-gray-600 truncate">
                                {email.body}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12">
                        <div className="text-center">
                          <Mail className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No emails</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {activeFolder === 'inbox' 
                              ? 'Your inbox is empty.' 
                              : `You don't have any ${activeFolder} emails.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Email detail view */}
                {selectedEmail && (
                  <div className="h-full flex flex-col">
                    {/* Email detail header */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center border-b border-gray-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedEmail(null)}
                        className="mr-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="ml-1">Back</span>
                      </Button>
                      
                      <div className="flex-1"></div>
                      
                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => starEmailMutation.mutate({ 
                            id: selectedEmail.id, 
                            starred: !selectedEmail.starred 
                          })}
                          disabled={starEmailMutation.isPending}
                        >
                          <Star 
                            className={`h-4 w-4 ${selectedEmail.starred ? 'text-yellow-500 fill-yellow-500' : ''}`} 
                          />
                        </Button>
                        
                        {selectedEmail.status !== 'archived' && selectedEmail.status !== 'trash' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveEmail(selectedEmail.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <ArchiveIcon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {selectedEmail.status !== 'trash' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTrashEmail(selectedEmail.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {selectedEmail.status === 'trash' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReturnToInbox(selectedEmail.id)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                              <span className="ml-1">Restore</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteEmail(selectedEmail.id)}
                              disabled={deleteEmailMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="ml-1">Delete Forever</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Email subject */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h1 className="text-xl font-bold">{selectedEmail.subject}</h1>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <div>
                          <span className="font-semibold">
                            {activeFolder === 'sent' ? 'To: ' : 'From: '}
                          </span>
                          <span>
                            {activeFolder === 'sent' 
                              ? selectedEmail.toEmail 
                              : `${selectedEmail.fromName} <${selectedEmail.fromEmail}>`}
                          </span>
                        </div>
                        <span className="mx-2">•</span>
                        <div>{formatDate(selectedEmail.createdAt)}</div>
                      </div>
                    </div>
                    
                    {/* Email body */}
                    <div className="px-6 py-4 flex-1 overflow-auto">
                      <div className="prose max-w-none">
                        {selectedEmail.body.split('\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                    
                    {/* Email actions footer */}
                    <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setComposeForm({
                              toEmail: selectedEmail.fromEmail,
                              subject: `Re: ${selectedEmail.subject}`,
                              body: `\n\n-------- Original Message --------\nFrom: ${selectedEmail.fromName} <${selectedEmail.fromEmail}>\nDate: ${formatDate(selectedEmail.createdAt)}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`
                            });
                            setComposeOpen(true);
                          }}
                        >
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 Auth System Demo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Compose Email Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Compose New Email</DialogTitle>
            <DialogDescription>
              Write your email and click send when you're ready.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 flex-1 overflow-auto">
            <div className="flex flex-col gap-2">
              <label htmlFor="toEmail" className="text-sm font-medium">
                To:
              </label>
              <Input
                id="toEmail"
                value={composeForm.toEmail}
                onChange={(e) => setComposeForm(prev => ({ ...prev, toEmail: e.target.value }))}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject:
              </label>
              <Input
                id="subject"
                value={composeForm.subject}
                onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter a subject"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="body" className="text-sm font-medium">
                Message:
              </label>
              <Textarea
                id="body"
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write your message here..."
                className="flex-1 min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setComposeOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}