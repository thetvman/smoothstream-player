
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProfile } from "@/context/ProfileContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound, LogIn } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const { createUserProfile, profile, isLoading } = useProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  // Redirect to profile if already signed in
  React.useEffect(() => {
    if (!isLoading && profile) {
      navigate("/profile");
    }
  }, [profile, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim()) {
      setFormError("Username is required");
      return;
    }

    createUserProfile(username.trim(), email.trim() || undefined);
    navigate("/profile");
  };

  if (isLoading) {
    return (
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Create your profile to start tracking your favorites and history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Create Profile
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-muted-foreground w-full">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default SignIn;
