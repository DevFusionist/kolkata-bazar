import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore, BusinessType } from "@/lib/store";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Utensils, Scissors, Laptop, Hammer, Package } from "lucide-react";
import { api, setStoredStore, getStoredStoreId, sendOtp, verifyOnboardingOtp } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { PageConfig } from "@shared/schema";
import { TemplatePicker } from "@/components/store-builder/TemplatePicker";
import { SectionEditor } from "@/components/store-builder/SectionEditor";

function normalizeWhatsapp(v: string): string {
  const digits = v.replace(/\D/g, "").replace(/^0+/, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { store, updateStore } = useStore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: store.name || "",
    whatsapp: store.whatsapp?.replace(/^91/, "")?.slice(-10) || "",
    type: store.type || "saree",
    mpin: "",
  });
  // Step 4: store design (template + editor or from scratch)
  const [designView, setDesignView] = useState<"picker" | "editor">("picker");
  const [designState, setDesignState] = useState<{ templateId: string | null; pageConfig: PageConfig }>({
    templateId: null,
    pageConfig: { sections: [] },
  });

  useEffect(() => {
    if (getStoredStoreId()) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const businessTypes: { id: BusinessType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: "saree", label: "Boutique / Saree", icon: Store, color: "bg-pink-100 text-pink-600" },
    { id: "food", label: "Home Food / Cafe", icon: Utensils, color: "bg-orange-100 text-orange-600" },
    { id: "beauty", label: "Beauty / Salon", icon: Scissors, color: "bg-purple-100 text-purple-600" },
    { id: "electronics", label: "Electronics / Repair", icon: Laptop, color: "bg-blue-100 text-blue-600" },
    { id: "handmade", label: "Handmade / Art", icon: Hammer, color: "bg-green-100 text-green-600" },
    { id: "other", label: "Other Business", icon: Package, color: "bg-gray-100 text-gray-600" },
  ];

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.whatsapp.replace(/\D/g, "").length < 10) return;
    setLoading(true);
    try {
      await sendOtp(normalizeWhatsapp(formData.whatsapp));
      setStep(2);
      setOtp("");
      toast({ title: "OTP sent", description: "Check your SMS for the code." });
    } catch (err) {
      toast({
        title: "Could not send OTP",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length < 4) return;
    setLoading(true);
    try {
      await verifyOnboardingOtp(normalizeWhatsapp(formData.whatsapp), otp.replace(/\D/g, ""));
      setStep(3);
      toast({ title: "Number verified", description: "Now set your shop details and MPIN." });
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err instanceof Error ? err.message : "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (templateId: string | null, pageConfig: PageConfig) => {
    const mpinDigits = formData.mpin.replace(/\D/g, "");
    if (mpinDigits.length !== 6) {
      toast({ title: "Invalid MPIN", description: "Enter a 6-digit MPIN.", variant: "destructive" });
      return;
    }
    updateStore({
      name: formData.name,
      whatsapp: normalizeWhatsapp(formData.whatsapp),
      type: formData.type,
    });
    setLoading(true);
    try {
      const created = await api.createStore({
        name: formData.name,
        type: formData.type,
        whatsapp: normalizeWhatsapp(formData.whatsapp),
        mpin: mpinDigits,
        ...(templateId && { templateId }),
        ...(pageConfig.sections?.length > 0 && { pageConfig }),
      });
      setStoredStore(created.id, created.ownerToken);
      toast({ title: "Shop created", description: `Welcome, ${formData.name}!` });
      setLocation("/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not create store.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <Layout variant="none">
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold font-serif text-secondary">Let's set up your shop</h1>
            <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Joy Guru Textiles"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-lg py-6"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <div className="flex">
                    <span className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">+91</span>
                    <Input
                      id="whatsapp"
                      placeholder="9876543210"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })
                      }
                      className="rounded-l-none py-6"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">We'll send an OTP to verify this number.</p>
                </div>
                <Button
                  type="submit"
                  className="w-full py-6 text-lg mt-4 bg-secondary hover:bg-secondary/90"
                  disabled={loading || !formData.name.trim() || formData.whatsapp.replace(/\D/g, "").length < 10}
                >
                  {loading ? "Sending…" : "Send OTP"}
                </Button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Code sent to +91 {formData.whatsapp.replace(/\D/g, "").slice(-10)}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-lg tracking-[0.5em]"
                    maxLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-secondary hover:bg-secondary/90"
                  disabled={loading || otp.replace(/\D/g, "").length < 4}
                >
                  {loading ? "Verifying…" : "Verify"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Change number
                </Button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <Label>Choose Business Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {businessTypes.map((type) => (
                    <Card
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`p-4 cursor-pointer transition-all border-2 flex flex-col items-center gap-2 text-center hover:shadow-md ${
                        formData.type === type.id ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    >
                      <div className={`p-3 rounded-full ${type.color}`}>
                        <type.icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-sm">{type.label}</span>
                    </Card>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpin">Set your 6-digit MPIN (for login)</Label>
                  <Input
                    id="mpin"
                    type="password"
                    inputMode="numeric"
                    placeholder="••••••"
                    value={formData.mpin}
                    onChange={(e) =>
                      setFormData({ ...formData, mpin: e.target.value.replace(/\D/g, "").slice(0, 6) })
                    }
                    className="text-center text-lg tracking-[0.5em]"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll use this MPIN to log in next time. Don't share it.
                  </p>
                </div>
                <Button
                  className="w-full py-6 text-lg mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setStep(4)}
                  disabled={formData.mpin.replace(/\D/g, "").length !== 6}
                >
                  Next: Design your store
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                  Back
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                {designView === "picker" && (
                  <TemplatePicker
                    onSelectTemplate={(templateId, pageConfig) => {
                      setDesignState({ templateId, pageConfig });
                      setDesignView("editor");
                    }}
                    onBuildFromScratch={(pageConfig) => {
                      setDesignState({ templateId: null, pageConfig });
                      setDesignView("editor");
                    }}
                  />
                )}
                {designView === "editor" && (
                  <SectionEditor
                    pageConfig={designState.pageConfig}
                    onChange={(config) => setDesignState((s) => ({ ...s, pageConfig: config }))}
                    onBack={() => setDesignView("picker")}
                    onNext={() => handleCreateStore(designState.templateId, designState.pageConfig)}
                    nextLabel={loading ? "Creating…" : "Launch My Shop 🚀"}
                    nextDisabled={loading}
                  />
                )}
                {designView === "picker" && (
                  <Button variant="ghost" className="w-full" onClick={() => setStep(3)}>
                    Back
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
