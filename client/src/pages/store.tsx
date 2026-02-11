import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { api, type Product as ApiProduct } from "@/lib/api";
import { IonButton, IonBadge, IonCard, IonCardContent, IonInput } from "@ionic/react";
import { Layout } from "@/components/Layout";
import { StorePageRenderer } from "@/components/StorePageRenderer";
import { IndianRupee, ShoppingBag, Phone, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function Store() {
  const { id: whatsappId = "" } = useParams<{ id: string }>();
  const localStore = useStore();

  const { data: apiStore, isLoading, isError } = useQuery({
    queryKey: ["stores", "by-whatsapp", whatsappId],
    queryFn: () => api.getStoreByWhatsapp(whatsappId),
    enabled: !!whatsappId,
  });

  const store = apiStore ?? {
    name: localStore.store.name,
    type: localStore.store.type,
    whatsapp: localStore.store.whatsapp,
    products: localStore.store.products as ApiProduct[],
    pageConfig: null as import("@/lib/api").PageConfig | null,
  };
  const products = store.products ?? [];

  const handleOrder = (product: ApiProduct) => {
    const message = `Hi ${store.name}, I want to order: ${product.name} - ₹${product.price}. Please confirm availability.`;
    const num = store.whatsapp.replace(/\D/g, "").replace(/^0/, "");
    const wa = num.startsWith("91") ? num : `91${num}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (whatsappId && isLoading && !apiStore) {
    return (
      <Layout variant="minimal">
        <div className="min-h-screen flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading store…</p>
        </div>
      </Layout>
    );
  }

  if (whatsappId && isError && !apiStore) {
    return (
      <Layout variant="minimal">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Store not found.</p>
            <p className="text-sm text-muted-foreground">The link may be wrong or the store was removed.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (store.pageConfig?.sections?.length) {
    return (
      <Layout variant="minimal">
        <StorePageRenderer
          storeName={store.name}
          whatsapp={store.whatsapp}
          products={products}
          pageConfig={store.pageConfig}
        />
      </Layout>
    );
  }

  return (
    <Layout variant="minimal">
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-secondary leading-tight">{store.name}</h1>
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Open Now • {store.type}
              </p>
            </div>
            <div className="flex gap-2">
              <IonButton fill="clear" size="small" className="rounded-full">
                <Search className="w-5 h-5 text-gray-500" />
              </IonButton>
            </div>
          </div>
          <div className="max-w-md mx-auto px-4 pb-3 flex gap-2">
            <IonInput placeholder="Search items..." className="h-9 bg-gray-100 border-none rounded" />
            <IonButton fill="outline" size="small" className="h-9 w-9 shrink-0">
              <Filter className="w-4 h-4" />
            </IonButton>
          </div>
        </div>

        <main className="max-w-md mx-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <IonCard className="overflow-hidden">
                  <div className="aspect-[3/4] relative bg-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <IonBadge className="absolute top-2 left-2 bg-white/90 text-black">
                      <IndianRupee className="w-3 h-3 mr-0.5 inline" /> {product.price}
                    </IonBadge>
                  </div>
                  <IonCardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 leading-snug min-h-[2.5em] text-gray-800">
                      {product.name}
                    </h3>
                    <IonButton
                      expand="block"
                      size="small"
                      className="mt-3 bg-[#25D366] text-white text-xs font-bold"
                      onClick={() => handleOrder(product)}
                    >
                      <Phone className="w-3 h-3 mr-1.5" /> Order
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </motion.div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No products available right now.</p>
            </div>
          )}
        </main>

        <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 flex justify-center pointer-events-none">
          <IonButton
            className="rounded-full shadow-lg pointer-events-auto px-6 font-medium"
            color="secondary"
            onClick={() => {
              const num = store.whatsapp.replace(/\D/g, "").replace(/^0/, "");
              const wa = num.startsWith("91") ? num : `91${num}`;
              window.open(`https://wa.me/${wa}`, "_blank");
            }}
          >
            Chat with Seller
          </IonButton>
        </div>
      </div>
    </Layout>
  );
}
