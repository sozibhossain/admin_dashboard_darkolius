"use client";

import { Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const callbackUrl = "/dashboard";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", { ...form, redirect: false, callbackUrl });
    setLoading(false);

    if (!result || result.error) {
      toast.error("Login failed. Please check your credentials.");
      return;
    }
    toast.success("Welcome back!");
    router.push(callbackUrl);
  };

  return (
    <div className="w-full rounded-xl bg-white p-8 shadow-2xl sm:p-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Log In</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Access your account to Continue your learning journey.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            className="h-12 border-zinc-300 focus-visible:ring-[#f8b400]"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" text-sm font-semibold>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="********"
              className="h-12 border-zinc-300 focus-visible:ring-[#f8b400]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Eye className="absolute right-3 top-3 h-5 w-5 text-zinc-400 cursor-pointer" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-sm font-medium text-zinc-700">Remember me</label>
          </div>
          <Link href="#" className="text-sm font-semibold text-[#f8b400] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="h-12 w-full bg-[#f8b400] text-lg font-bold text-white hover:bg-[#e0a200]"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>
      </form>
    </div>
  );
}