/**
 * Login Page
 *
 * Authentication page for signing in or creating an account
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { authClient } from "@helpdesk/auth/client";
import { toast } from "sonner";

import { z } from "zod";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(search.mode === "signup");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        if (error) {
          toast.error(error.message || "Sign up failed");
          return;
        }
        toast.success("Account created! Please sign in.");
        setIsSignUp(false);
      } else {
        const { error } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          toast.error(error.message || "Sign in failed");
          return;
        }
        // Clear demo mode flags on successful login
        if (typeof window !== "undefined") {
          localStorage.removeItem("demo_mode");
          localStorage.removeItem("isDemo");
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("companyId");
        }
        toast.success("Welcome back!");
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Try to sign in with demo credentials
      const { error } = await authClient.signIn.email({
        email: "demo@helpdesk.example",
        password: "demo123456",
      });

      if (error) {
        // If demo user doesn't exist, create it first
        const signUpResult = await authClient.signUp.email({
          email: "demo@helpdesk.example",
          password: "demo123456",
          name: "Demo User",
        });

        if (signUpResult.error) {
          toast.error("Demo login failed. Please try regular login.");
          return;
        }

        // Sign in after creating demo account
        await authClient.signIn.email({
          email: "demo@helpdesk.example",
          password: "demo123456",
        });
      }

      toast.success("Welcome to the demo!");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="inline-block mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">HD</span>
              </div>
              <span className="text-xl font-semibold">Helpdesk</span>
            </div>
          </Link>
          <CardTitle>{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to create your account"
              : "Enter your credentials to sign in"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={isSignUp}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Try Demo
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
