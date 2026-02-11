import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { IonButton, IonInput, IonItem, IonLabel } from "@ionic/react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { setStoredStore, getSession, loginWithMpin } from "@/lib/api";

function normalizeMobile(v: string): string {
  const digits = v.replace(/\D/g, "").replace(/^0+/, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

const totalSteps = 2;

export default function Login() {
  const { toast } = useToast();
  const history = useHistory();
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
          history.push("/dashboard");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [history]);

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
        history.push("/dashboard");
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

  const currentStep = step === "phone" ? 1 : 2;

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center max-w-md mx-auto">
        <p className="text-muted-foreground">Checking…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold font-serif text-secondary">Log in</h1>
          <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form
              key="phone"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleSubmitPhone}
              className="space-y-4"
            >
              <IonItem lines="none" className="ion-margin-bottom">
                <IonLabel position="stacked">WhatsApp number</IonLabel>
                <div className="flex w-full">
                  <span className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                    +91
                  </span>
                  <IonInput
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onIonInput={(e) =>
                      setPhone((e.detail.value ?? "").replace(/\D/g, "").slice(0, 10))
                    }
                    className="rounded-r-md flex-1"
                  />
                </div>
              </IonItem>
              <p className="text-xs text-muted-foreground ion-margin-bottom">
                Enter the number linked to your shop.
              </p>
              <IonButton
                type="submit"
                expand="block"
                size="large"
                color="secondary"
                disabled={phone.replace(/\D/g, "").length < 10}
              >
                Next
              </IonButton>
            </motion.form>
          ) : (
            <motion.form
              key="mpin"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleLoginWithMpin}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground ion-margin-bottom">
                Logging in as +91 {phone.replace(/\D/g, "").slice(-10)}
              </p>
              <IonItem lines="none" className="ion-margin-bottom">
                <IonLabel position="stacked">MPIN (6 digits)</IonLabel>
                <IonInput
                  type="password"
                  inputMode="numeric"
                  placeholder="••••••"
                  value={mpin}
                  onIonInput={(e) =>
                    setMpin((e.detail.value ?? "").replace(/\D/g, "").slice(0, 6))
                  }
                  maxlength={6}
                  className="text-center text-lg tracking-[0.5em]"
                />
              </IonItem>
              <IonButton
                type="submit"
                expand="block"
                size="large"
                color="secondary"
                disabled={loading || mpin.length !== 6}
              >
                {loading ? "Logging in…" : "Log in"}
              </IonButton>
              <IonButton
                type="button"
                fill="clear"
                expand="block"
                onClick={() => setStep("phone")}
                disabled={loading}
              >
                Change number
              </IonButton>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-xs text-center text-muted-foreground">
          New here?{" "}
          <Link to="/onboarding" className="text-primary font-medium hover:underline">
            Set up your shop
          </Link>
        </p>
      </div>
    </div>
  );
}
