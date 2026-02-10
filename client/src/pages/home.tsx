import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-kolkata.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex justify-between items-center border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-secondary font-serif">Amar Dokan</h1>
        <Button variant="ghost" size="sm" className="text-muted-foreground">Log In</Button>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full max-w-md bg-primary/10 p-6 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              আপনার দোকান এখন অনলাইনে <br/>
              <span className="text-primary text-2xl mt-2 block font-medium">Your Shop, Now Online.</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Zero coding. Zero setup fees. Just WhatsApp and you.
            </p>
          </motion.div>

          <Link href="/onboarding">
            <Button size="lg" className="w-full text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-4 shadow-lg shadow-primary/20">
              Start Selling Today
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-md aspect-[4/3] relative overflow-hidden">
          <img 
            src={heroImage} 
            alt="Kolkata Market Scene" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-20"></div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-md p-6 grid gap-4">
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
      </main>

      <footer className="p-6 text-center text-sm text-muted-foreground bg-muted/30 mt-auto">
        <p>Made with ❤️ in Kolkata</p>
      </footer>
    </div>
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
