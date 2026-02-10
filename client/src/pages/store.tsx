import { useRoute } from "wouter";
import { useStore, Product } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, ShoppingBag, Phone, Share2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Store() {
  const [, params] = useRoute("/store/:id");
  const { store } = useStore();
  
  // In a real app, we'd fetch store data by ID. 
  // Here we just use the local mock store but pretend it matches the ID
  
  const handleOrder = (product: Product) => {
    const message = `Hi ${store.name}, I want to order: ${product.name} - ₹${product.price}. Please confirm availability.`;
    const url = `https://wa.me/91${store.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Store Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-secondary leading-tight">{store.name}</h1>
            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Open Now • {store.type}
            </p>
          </div>
          <div className="flex gap-2">
             <Button size="icon" variant="ghost" className="rounded-full">
               <Search className="w-5 h-5 text-gray-500" />
             </Button>
          </div>
        </div>
        
        {/* Search/Filter Bar */}
        <div className="max-w-md mx-auto px-4 pb-3 flex gap-2">
          <Input placeholder="Search items..." className="h-9 bg-gray-100 border-none" />
          <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {store.products.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] relative bg-gray-200">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <Badge className="absolute top-2 left-2 bg-white/90 text-black hover:bg-white shadow-sm backdrop-blur-sm">
                     <IndianRupee className="w-3 h-3 mr-0.5" /> {product.price}
                  </Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 leading-snug min-h-[2.5em] text-gray-800">
                    {product.name}
                  </h3>
                  <Button 
                    className="w-full mt-3 bg-[#25D366] hover:bg-[#128C7E] text-white h-8 text-xs font-bold shadow-sm"
                    onClick={() => handleOrder(product)}
                  >
                    <Phone className="w-3 h-3 mr-1.5" /> Order
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {store.products.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No products available right now.</p>
          </div>
        )}
      </main>

      {/* Footer Contact */}
      <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 flex justify-center pointer-events-none">
        <Button className="rounded-full shadow-lg bg-secondary text-white pointer-events-auto px-6 font-medium animate-in slide-in-from-bottom-5">
           Chat with Seller
        </Button>
      </div>
    </div>
  );
}
