import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Phone } from "lucide-react";
import type { Product } from "@/lib/api";
import type { ProductsGridProps } from "@shared/schema";

type Props = {
  products: Product[];
  storeName: string;
  whatsapp: string;
  data?: ProductsGridProps | Record<string, unknown>;
};

export function SectionProductsGrid({ products, storeName, whatsapp, data }: Props) {
  const p = (data || {}) as ProductsGridProps;
  const columns = p.columns ?? 2;
  const showPrices = p.showPrices !== false;

  const handleOrder = (product: Product) => {
    const message = `Hi ${storeName}, I want to order: ${product.name} - ₹${product.price}. Please confirm availability.`;
    const num = whatsapp.replace(/\D/g, "").replace(/^0/, "");
    const wa = num.startsWith("91") ? num : `91${num}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const gridClass = columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-secondary mb-4">Products</h2>
      <div className={`grid ${gridClass} gap-4`}>
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] relative bg-gray-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {showPrices && (
                <Badge className="absolute top-2 left-2 bg-white/90 text-black hover:bg-white shadow-sm backdrop-blur-sm">
                  <IndianRupee className="w-3 h-3 mr-0.5" /> {product.price}
                </Badge>
              )}
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
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No products yet. Check back soon!
        </div>
      )}
    </section>
  );
}
