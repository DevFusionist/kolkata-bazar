import { useState } from "react";
import { useLocation } from "wouter";
import { useStore, BusinessType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Store, Utensils, Scissors, Laptop, Hammer, Package } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { store, updateStore } = useStore();
  const [formData, setFormData] = useState({
    name: store.name || "",
    whatsapp: store.whatsapp || "",
    type: store.type || "saree"
  });

  const businessTypes: { id: BusinessType; label: string; icon: any; color: string }[] = [
    { id: 'saree', label: 'Boutique / Saree', icon: Store, color: 'bg-pink-100 text-pink-600' },
    { id: 'food', label: 'Home Food / Cafe', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    { id: 'beauty', label: 'Beauty / Salon', icon: Scissors, color: 'bg-purple-100 text-purple-600' },
    { id: 'electronics', label: 'Electronics / Repair', icon: Laptop, color: 'bg-blue-100 text-blue-600' },
    { id: 'handmade', label: 'Handmade / Art', icon: Hammer, color: 'bg-green-100 text-green-600' },
    { id: 'other', label: 'Other Business', icon: Package, color: 'bg-gray-100 text-gray-600' },
  ];

  const handleNext = () => {
    if (step === 1 && formData.name && formData.whatsapp) {
      setStep(2);
    } else if (step === 2) {
      updateStore(formData);
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold font-serif text-secondary">Let's set up your shop</h1>
          <p className="text-muted-foreground">Step {step} of 2</p>
        </div>

        {step === 1 ? (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Joy Guru Textiles" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="rounded-l-none py-6"
                />
              </div>
              <p className="text-xs text-muted-foreground">Orders will be sent to this number.</p>
            </div>

            <Button 
              className="w-full py-6 text-lg mt-4 bg-secondary hover:bg-secondary/90" 
              onClick={handleNext}
              disabled={!formData.name || !formData.whatsapp}
            >
              Next Step
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
             <Label>Choose Business Type</Label>
             <div className="grid grid-cols-2 gap-3">
               {businessTypes.map((type) => (
                 <Card 
                   key={type.id}
                   onClick={() => setFormData({...formData, type: type.id})}
                   className={`p-4 cursor-pointer transition-all border-2 flex flex-col items-center gap-2 text-center hover:shadow-md ${formData.type === type.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                 >
                   <div className={`p-3 rounded-full ${type.color}`}>
                     <type.icon className="w-6 h-6" />
                   </div>
                   <span className="font-medium text-sm">{type.label}</span>
                 </Card>
               ))}
             </div>

             <Button 
              className="w-full py-6 text-lg mt-6 bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={handleNext}
            >
              Launch My Shop 🚀
            </Button>
             <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Back</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
