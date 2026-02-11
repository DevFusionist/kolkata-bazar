import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageCircle, Store, Smartphone, Zap, Shield } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Create your shop",
    desc: "Enter your shop name and WhatsApp number. No signup forms or emails.",
    icon: Store,
  },
  {
    step: 2,
    title: "Add your products",
    desc: "Upload photos and prices. Your catalog goes live in seconds.",
    icon: Smartphone,
  },
  {
    step: 3,
    title: "Share your link",
    desc: "Send your store link on WhatsApp, social media, or put it on your card.",
    icon: MessageCircle,
  },
  {
    step: 4,
    title: "Get orders on WhatsApp",
    desc: "Customers tap Order and chat with you directly. You confirm and deliver.",
    icon: Zap,
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-serif">
            How it works
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Your Kolkata shop online in four simple steps. No coding, no monthly fees.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map(({ step, title, desc, icon: Icon }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <Card className="overflow-hidden border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Step {step}
                    </span>
                    <h2 className="text-lg font-semibold text-foreground mt-0.5">{title}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-xl bg-muted/50 border text-center">
          <Shield className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            We don’t store your payments or take a cut. You get orders on your WhatsApp; you handle delivery and payment the way you always do.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/onboarding">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Start your shop
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
