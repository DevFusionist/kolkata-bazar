import { useState } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Share2, ExternalLink, Trash2, Camera, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { store, addProduct, removeProduct } = useStore();
  const { toast } = useToast();
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    
    // Use a placeholder if no image provided
    const image = newProduct.image || `https://source.unsplash.com/random/400x400/?${store.type},product`;
    
    addProduct({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      image: image,
      description: "Quality product from our store."
    });
    
    setNewProduct({ name: "", price: "", image: "" });
    toast({ title: "Product Added", description: `${newProduct.name} is now live!` });
  };

  const copyStoreLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/store/" + store.whatsapp);
    toast({ title: "Link Copied!", description: "Share this link on WhatsApp." });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-secondary text-white p-6 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <div>
            <h1 className="font-bold text-xl">{store.name}</h1>
            <p className="text-white/80 text-sm flex items-center gap-1">
              Admin Panel <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1"></span>
            </p>
          </div>
          <Link href={`/store/${store.whatsapp}`}>
            <Button size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30 rounded-full">
              <ExternalLink className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-auto py-4 flex flex-col gap-2 bg-white text-foreground border shadow-sm hover:bg-gray-50"
            onClick={copyStoreLink}
          >
            <Share2 className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-medium">Share Store</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-auto py-4 flex flex-col gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <Plus className="w-6 h-6" />
                <span className="text-xs font-medium">Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    placeholder="e.g. Silk Saree" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 1500" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL (Optional)</Label>
                  <Input 
                    placeholder="https://..." 
                    value={newProduct.image}
                    onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Tip: You can use WhatsApp image links later.</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={handleAddProduct} type="submit" className="w-full">Add Product</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
          <CardContent className="p-4 flex justify-between items-center">
             <div>
               <p className="text-gray-400 text-xs uppercase tracking-wider">Total Products</p>
               <h3 className="text-2xl font-bold">{store.products.length}</h3>
             </div>
             <div>
               <p className="text-gray-400 text-xs uppercase tracking-wider">Store Views</p>
               <h3 className="text-2xl font-bold">124</h3>
             </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Your Inventory</h2>
          {store.products.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
              <p>No products yet.</p>
              <p className="text-sm">Add your first item to start selling!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {store.products.map(product => (
                <div key={product.id} className="bg-card p-3 rounded-lg border shadow-sm flex gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium line-clamp-1">{product.name}</h3>
                      <p className="text-primary font-bold flex items-center text-sm">
                        <IndianRupee className="w-3 h-3" /> {product.price}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Button variant="outline" size="xs" className="h-7 text-xs" onClick={() => {
                         navigator.clipboard.writeText(`${window.location.origin}/store/${store.whatsapp}?product=${product.id}`);
                         toast({ title: "Product Link Copied!" });
                      }}>
                        <Share2 className="w-3 h-3 mr-1" /> Link
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
