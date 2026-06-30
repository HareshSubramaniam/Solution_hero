import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useSignup } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Shield, Zap } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=80";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["citizen", "admin"]),
});

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "citizen" },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        window.location.href = "/feed";
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Login failed", description: error?.error || "Invalid credentials" });
      },
    },
  });

  const signupMutation = useSignup({
    mutation: {
      onSuccess: () => {
        window.location.href = "/feed";
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Signup failed", description: error?.error || "Could not create account" });
      },
    },
  });

  const loginAsDemo = (email: string) => {
    loginMutation.mutate({ data: { email, password: "demo123" } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left — photo panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={HERO_IMG} alt="City" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl">
              Community<span className="text-primary">Hero</span>
            </span>
          </div>
          <h2 className="text-4xl font-heading font-bold mb-4 leading-snug">
            Your city needs<br />your voice.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
            Report civic issues, verify community reports, and track every fix until your neighbourhood is better.
          </p>
          <div className="flex gap-6 mt-10">
            {[["25+", "Issues reported"], ["8", "Active citizens"], ["5", "Resolved"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-heading font-bold text-primary">{n}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-foreground">
              Community<span className="text-primary">Hero</span>
            </span>
          </div>

          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account or create a new one.</p>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted border border-border rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {/* Demo quick-access */}
              <div className="p-4 rounded-xl bg-card border border-border mb-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  One-click demo access
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-border bg-card text-foreground hover:bg-muted rounded-xl text-xs font-semibold"
                    onClick={() => loginAsDemo("demo-citizen@communityhero.app")}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Demo Citizen"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-border bg-card text-foreground hover:bg-muted rounded-xl text-xs font-semibold"
                    onClick={() => loginAsDemo("demo-admin@communityhero.app")}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Demo Admin"}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider font-bold">or sign in manually</span>
                </div>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate({ data: d }))} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            className="bg-card border-border text-foreground rounded-xl focus:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-card border-border text-foreground rounded-xl focus:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 text-base"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in…</> : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit((d) => signupMutation.mutate({ data: d }))} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            className="bg-card border-border text-foreground rounded-xl focus:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            className="bg-card border-border text-foreground rounded-xl focus:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="bg-card border-border text-foreground rounded-xl focus:border-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">I am a…</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                            {["citizen", "admin"].map((r) => (
                              <FormItem key={r} className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={r} className="border-border text-primary" />
                                </FormControl>
                                <FormLabel className="font-medium text-muted-foreground capitalize cursor-pointer">{r}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 text-base"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account…</> : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
