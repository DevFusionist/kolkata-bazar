import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 w-full flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
              <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This page doesn’t exist or has been moved.
            </p>
            <Link href="/">
              <Button className="mt-6 w-full">Back to home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
