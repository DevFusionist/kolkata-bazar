import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import heroImage from "@/assets/hero-kolkata.png";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col">
        {/* Hero Section */}
        <div className="w-full bg-primary/10 p-6 sm:p-8 md:p-10 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              আপনার দোকান এখন অনলাইনে <br/>
              <span className="text-primary text-2xl sm:text-3xl mt-2 block font-medium">Your Shop, Now Online.</span>
            </h2>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">
              Zero coding. Zero setup fees. Just WhatsApp and you.
            </p>
            <Link href="/how-it-works" className="text-sm text-primary hover:underline">
              How it works →
            </Link>
          </motion.div>

          <Link href="/onboarding">
            <Button size="lg" className="w-full max-w-sm mx-auto text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20">
              Start Selling Today
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[4/3] sm:aspect-[21/9] max-h-[50vh] relative overflow-hidden">
          <img 
            src={heroImage} 
            alt="Kolkata Market Scene" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-20"></div>
        </div>

        {/* Features Grid */}
        <div className="w-full p-6 grid grid-cols-1 gap-4 max-w-5xl mx-auto">
          <FeatureCard 
            icon="🛍️" 
            title="Saree to Street Food" 
            desc="Made for every Kolkata business." 
          />
          <FeatureCard 
            icon="💬" 
            title="WhatsApp Orders" 
            desc="Get orders directly on your number." 
          />
          <FeatureCard 
            icon="⚡" 
            title="Instant Setup" 
            desc="Live in 30 seconds." 
          />
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-card p-4 rounded-xl shadow-sm border flex items-center gap-4">
      <span className="text-2xl bg-accent p-2 rounded-lg">{icon}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
