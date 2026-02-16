"use client";

import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { type LoginResponse, login, setupOtp, verifyOtp } from "@/lib/auth/api";

type Step = "credentials" | "otp" | "otp-setup";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res: LoginResponse = await login(email, password);
      if (res.status === "success") {
        router.replace("/");
      } else if (res.status === "2fa_required") {
        setStep("otp");
      } else if (res.status === "2fa_setup_required") {
        setProvisioningUri(res.provisioning_uri);
        setStep("otp-setup");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (step === "otp-setup") {
        await setupOtp(otpCode);
      } else {
        await verifyOtp(otpCode);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{step === "credentials" ? "Sign in" : "Two-factor authentication"}</CardTitle>
        <CardDescription>
          {step === "credentials" && "Sign in to Giki Admin"}
          {step === "otp" && "Enter the code from your authenticator app"}
          {step === "otp-setup" && "Scan the QR code with your authenticator app, then enter the code"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "credentials" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtp} className="flex flex-col gap-4">
            {step === "otp-setup" && provisioningUri && (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-lg bg-white p-3">
                  <QRCodeSVG value={provisioningUri} size={180} />
                </div>
                <p className="text-muted-foreground text-xs text-center break-all">{provisioningUri}</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-2">
              <Label>Verification code</Label>
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Verifying..." : "Verify"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
