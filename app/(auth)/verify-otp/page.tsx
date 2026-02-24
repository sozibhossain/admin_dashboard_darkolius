"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { authApi, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [otp, setOtp] = useState("");

  const mutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: () => {
      toast.success("OTP verified.");
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md border-zinc-200 bg-white/95">
      <CardHeader>
        <CardTitle className="text-2xl">Verify OTP</CardTitle>
        <CardDescription>Enter the email and OTP code from your inbox.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({ email, otp });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              required
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="6 digit code"
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
          <Link
            href="/forgot-password"
            className="block text-center text-sm text-zinc-600 hover:text-zinc-900"
          >
            Request new OTP
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

function VerifyOtpFallback() {
  return (
    <Card className="mx-auto w-full max-w-md border-zinc-200 bg-white/95">
      <CardContent className="flex justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpFallback />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
