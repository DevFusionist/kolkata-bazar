import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useStore, BusinessType } from "@/lib/store";
import { IonButton, IonInput, IonCard, IonCardContent, IonItem, IonLabel } from "@ionic/react";
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
  const history = useHistory();
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
  const [designView, setDesignView] = useState<"picker" | "editor">("picker");
  const [numberTakenError, setNumberTakenError] = useState<string | null>(null);
  const [designState, setDesignState] = useState<{ templateId: string | null; pageConfig: PageConfig }>({
    templateId: null,
    pageConfig: { sections: [] },
  });

  useEffect(() => {
    if (getStoredStoreId()) {
      history.push("/dashboard");
    }
  }, [history]);

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
    setNumberTakenError(null);
    setLoading(true);
    try {
      await sendOtp(normalizeWhatsapp(formData.whatsapp));
      setStep(2);
      setOtp("");
      toast({ title: "OTP sent", description: "Check your SMS for the code." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      const isNumberTaken = message.toLowerCase().includes("already linked");
      if (isNumberTaken) {
        setNumberTakenError(message);
      } else {
        toast({
          title: "Could not send OTP",
          description: message,
          variant: "destructive",
        });
      }
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
      history.push("/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not create store.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
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
                <IonItem lines="none" className="ion-margin-bottom">
                  <IonLabel position="stacked">Shop Name</IonLabel>
                  <IonInput
                    placeholder="e.g. Joy Guru Textiles"
                    value={formData.name}
                    onIonInput={(e) => setFormData({ ...formData, name: e.detail.value ?? "" })}
                    className="text-lg"
                  />
                </IonItem>
                <IonItem lines="none" className="ion-margin-bottom">
                  <IonLabel position="stacked">WhatsApp Number</IonLabel>
                  <div className="flex w-full">
                    <span className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">+91</span>
                    <IonInput
                      placeholder="9876543210"
                      type="tel"
                      value={formData.whatsapp}
                      onIonInput={(e) => {
                        setNumberTakenError(null);
                        setFormData({ ...formData, whatsapp: (e.detail.value ?? "").replace(/\D/g, "").slice(0, 10) });
                      }}
                      className="flex-1"
                    />
                  </div>
                </IonItem>
                <p className="text-xs text-muted-foreground ion-margin-bottom">We'll send an OTP to verify this number.</p>
                {numberTakenError && (
                  <div className="ion-margin-bottom p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
                    <p className="font-medium">{numberTakenError}</p>
                    <Link to="/login" className="mt-2 inline-block font-medium underline">
                      Log in to your shop →
                    </Link>
                  </div>
                )}
                <IonButton
                  type="submit"
                  expand="block"
                  size="large"
                  color="secondary"
                  disabled={loading || !formData.name.trim() || formData.whatsapp.replace(/\D/g, "").length < 10}
                >
                  {loading ? "Sending…" : "Send OTP"}
                </IonButton>
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
                <p className="text-sm text-muted-foreground ion-margin-bottom">
                  Code sent to +91 {formData.whatsapp.replace(/\D/g, "").slice(-10)}
                </p>
                <IonItem lines="none" className="ion-margin-bottom">
                  <IonLabel position="stacked">Verification code</IonLabel>
                  <IonInput
                    type="text"
                    inputmode="numeric"
                    placeholder="000000"
                    value={otp}
                    onIonInput={(e) => setOtp((e.detail.value ?? "").replace(/\D/g, "").slice(0, 6))}
                    maxlength={6}
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </IonItem>
                <IonButton
                  type="submit"
                  expand="block"
                  size="large"
                  color="secondary"
                  disabled={loading || otp.replace(/\D/g, "").length < 4}
                >
                  {loading ? "Verifying…" : "Verify"}
                </IonButton>
                <IonButton fill="clear" expand="block" onClick={() => setStep(1)} disabled={loading}>
                  Change number
                </IonButton>
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
                <IonLabel className="ion-margin-bottom block">Choose Business Type</IonLabel>
                <div className="grid grid-cols-2 gap-3 ion-margin-bottom">
                  {businessTypes.map((type) => (
                    <IonCard
                      key={type.id}
                      button
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`p-4 cursor-pointer flex flex-col items-center gap-2 text-center ${formData.type === type.id ? "border-2 border-primary" : ""}`}
                    >
                      <IonCardContent className="flex flex-col items-center gap-2">
                        <div className={`p-3 rounded-full ${type.color}`}>
                          <type.icon className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">{type.label}</span>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
                <IonItem lines="none" className="ion-margin-bottom">
                  <IonLabel position="stacked">Set your 6-digit MPIN (for login)</IonLabel>
                  <IonInput
                    type="password"
                    inputmode="numeric"
                    placeholder="••••••"
                    value={formData.mpin}
                    onIonInput={(e) =>
                      setFormData({ ...formData, mpin: (e.detail.value ?? "").replace(/\D/g, "").slice(0, 6) })
                    }
                    maxlength={6}
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </IonItem>
                <p className="text-xs text-muted-foreground ion-margin-bottom">
                  You'll use this MPIN to log in next time. Don't share it.
                </p>
                <IonButton
                  expand="block"
                  size="large"
                  className="ion-margin-bottom"
                  onClick={() => setStep(4)}
                  disabled={formData.mpin.replace(/\D/g, "").length !== 6}
                >
                  Next: Design your store
                </IonButton>
                <IonButton fill="clear" expand="block" onClick={() => setStep(2)}>
                  Back
                </IonButton>
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
                  <IonButton fill="clear" expand="block" onClick={() => setStep(3)}>
                    Back
                  </IonButton>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
}
