import { Link } from "react-router-dom";
import { IonCard, IonCardContent, IonButton } from "@ionic/react";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-12">
        <IonCard className="w-full max-w-md">
          <IonCardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
              <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This page doesn't exist or has been moved.
            </p>
            <Link to="/">
              <IonButton expand="block" className="mt-6">
                Back to home
              </IonButton>
            </Link>
          </IonCardContent>
        </IonCard>
      </div>
  );
}
