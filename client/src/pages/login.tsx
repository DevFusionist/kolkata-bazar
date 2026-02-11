import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { setStoredStore, getSession, loginWithMpin } from "@/lib/api";

function normalizeMobile(v: string): string {
  const digits = v.replace(/\D/g, "").replace(/^0+/, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"phone" | "mpin">("phone");
  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getSession()
      .then((data) => {
        if (data.store?.id && data.ownerToken) {
          setStoredStore(data.store.id, data.ownerToken);
          setLocation("/dashboard");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [setLocation]);

  const handleSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    setStep("mpin");
    setMpin("");
  };

  const handleLoginWithMpin = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = mpin.replace(/\D/g, "");
    if (digits.length !== 6) return;
    setLoading(true);
    try {
      const data = await loginWithMpin(normalizeMobile(phone), digits);
      if (data.store?.id && data.ownerToken) {
        setStoredStore(data.store.id, data.ownerToken);
        toast({ title: "Logged in", description: `Welcome back, ${data.store.name}` });
        setLocation("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid number or MPIN.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <Layout showSellerNav>
        <div className="w-full max-w-md mx-auto px-4 py-10 flex justify-center items-center min-h-[200px]">
          <p className="text-muted-foreground">Checking…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSellerNav>
      <div className="w-full max-w-md mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-serif text-secondary">Log in</CardTitle>
              <CardDescription>
                {step === "phone"
                  ? "Enter your WhatsApp number linked to your shop."
                  : "Enter your 6-digit MPIN to access your shop."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {step === "phone" ? (
                  <motion.form
                    key="phone"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    onSubmit={handleSubmitPhone}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp number</Label>
                      <div className="flex">
                        <span className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                          +91
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-secondary hover:bg-secondary/90"
                      disabled={phone.replace(/\D/g, "").length < 10}
                    >
                      Next
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="mpin"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    onSubmit={handleLoginWithMpin}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Logging in as +91 {phone.replace(/\D/g, "").slice(-10)}
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="mpin">MPIN (6 digits)</Label>
                      <Input
                        id="mpin"
                        type="password"
                        inputMode="numeric"
                        placeholder="••••••"
                        value={mpin}
                        onChange={(e) =>
                          setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="text-center text-lg tracking-[0.5em]"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-secondary hover:bg-secondary/90"
                      disabled={loading || mpin.length !== 6}
                    >
                      {loading ? "Logging in…" : "Log in"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setStep("phone")}
                      disabled={loading}
                    >
                      Change number
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
              <p className="text-xs text-center text-muted-foreground mt-4">
                New here?{" "}
                <Link href="/onboarding" className="text-primary font-medium hover:underline">
                  Set up your shop
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
