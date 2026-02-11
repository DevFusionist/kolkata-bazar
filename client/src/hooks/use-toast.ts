import { useIonToast } from "@ionic/react";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function useToast() {
  const [present] = useIonToast();

  const toast = (options: ToastOptions) => {
    const { title, description, variant = "default" } = options;
    const message = [title, description].filter(Boolean).join(" – ");
    present({
      message: message || "Done",
      duration: 3000,
      color: variant === "destructive" ? "danger" : "success",
      position: "bottom",
    });
  };

  return { toast };
}

export { useToast };
