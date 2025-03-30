import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="flex h-full">
          {/* Left side - Auth forms */}
          <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
            <div className="w-full max-w-md">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Login to your account</CardTitle>
                      <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Remember me</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {loginMutation.error && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {loginMutation.error.message}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </span>
                            ) : (
                              "Sign in"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 w-full" 
                        onClick={() => setActiveTab("register")}
                      >
                        Create new account
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Registration Form */}
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an account</CardTitle>
                      <CardDescription>Enter your details to create a new account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Choose a password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {registerMutation.error && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {registerMutation.error.message}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <span className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </span>
                            ) : (
                              "Register"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 w-full" 
                        onClick={() => setActiveTab("login")}
                      >
                        Sign in instead
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right side - Hero section */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 p-12 flex-col justify-center text-white">
            <div>
              <h1 className="text-4xl font-bold mb-4">Secure Authentication System</h1>
              <p className="text-xl mb-8">
                Access our platform with a secure and reliable authentication system.
              </p>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Secure Authentication</h3>
                    <p className="text-white/80">JWT tokens with proper expiration.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-4">
                    <KeyIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Role-Based Access</h3>
                    <p className="text-white/80">Control access with flexible roles.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-4">
                    <LockIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Password Protection</h3>
                    <p className="text-white/80">Secure password hashing with bcrypt.</p>
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

// Icons for the hero section
function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7-7 7s-7-2-7-7V6a13.94 13.94 0 0 0 7-2 13.94 13.94 0 0 0 7 2v7Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
