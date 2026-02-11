import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import {
  getStoredStoreId,
  getStoredOwnerToken,
  api,
  type StoreWithProducts,
  type Product as ApiProduct,
} from "@/lib/api";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/react";
import { Plus, Share2, ExternalLink, Trash2, IndianRupee, Palette, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const storeId = getStoredStoreId();
  const ownerToken = getStoredOwnerToken();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });
  const [addProductOpen, setAddProductOpen] = useState(false);

  const { data: apiStore, isLoading } = useQuery({
    queryKey: ["stores", storeId ?? ""],
    queryFn: () => api.getStoreById(storeId!),
    enabled: !!storeId,
  });

  const addProductMutation = useMutation({
    mutationFn: (body: { name: string; price: number; image?: string; description?: string }) =>
      api.addProduct(storeId!, body, ownerToken),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stores", storeId!] });
      toast({ title: "Product Added", description: `${variables.name} is now live!` });
      setAddProductOpen(false);
      setNewProduct({ name: "", price: "", image: "" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) =>
      api.deleteProduct(storeId!, productId, ownerToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores", storeId!] });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const localStore = useStore();
  const store: StoreWithProducts | null = apiStore ?? null;
  const fallbackStore = localStore.store;
  const displayStore = store ?? {
    id: "",
    name: fallbackStore.name,
    type: fallbackStore.type,
    whatsapp: fallbackStore.whatsapp,
    products: fallbackStore.products as ApiProduct[],
  } as StoreWithProducts;
  const products = displayStore.products ?? [];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const price = parseFloat(newProduct.price);
    if (Number.isNaN(price)) return;

    if (storeId && ownerToken) {
      addProductMutation.mutate({
        name: newProduct.name,
        price,
        image: newProduct.image || undefined,
        description: "Quality product from our store.",
      });
      return;
    }

    localStore.addProduct({
      name: newProduct.name,
      price,
      image:
        newProduct.image ||
        `https://source.unsplash.com/random/400x400/?${fallbackStore.type},product`,
      description: "Quality product from our store.",
    });
    setNewProduct({ name: "", price: "", image: "" });
    setAddProductOpen(false);
    toast({ title: "Product Added", description: `${newProduct.name} is now live!` });
  };

  const copyStoreLink = () => {
    navigator.clipboard.writeText(
      window.location.origin + "/store/" + displayStore.whatsapp
    );
    toast({ title: "Link Copied!", description: "Share this link on WhatsApp." });
  };

  const removeProduct = (productId: string) => {
    if (storeId && ownerToken) {
      deleteProductMutation.mutate(productId);
      return;
    }
    localStore.removeProduct(productId);
  };

  if (!storeId && !fallbackStore.name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Set up your shop first.</p>
          <IonButton onClick={() => history.push("/onboarding")}>Create your shop</IonButton>
        </div>
      </div>
    );
  }

  if (storeId && isLoading && !apiStore) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
        <header className="bg-secondary text-white p-4 sm:p-6 shadow-md">
          <div className="flex items-center gap-3 w-full">
            <Link to="/">
              <IonButton fill="clear" className="shrink-0 text-white" aria-label="Back to home">
                <ArrowLeft className="w-5 h-5" />
              </IonButton>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xl truncate">{displayStore.name}</h1>
              <p className="text-white/80 text-sm flex items-center gap-1">
                Admin Panel{" "}
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1"></span>
              </p>
            </div>
            <Link to={`/store/${displayStore.whatsapp}`} className="shrink-0">
              <IonButton fill="outline" className="bg-white/20 text-white">
                <ExternalLink className="w-5 h-5" />
              </IonButton>
            </Link>
          </div>
        </header>

        <main className="w-full p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <IonButton
              expand="block"
              fill="outline"
              className="h-auto py-4"
              onClick={() => history.push("/dashboard/design")}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <Palette className="w-5 h-5 text-purple-600 shrink-0" />
                <span className="text-sm font-medium">Customize store</span>
              </div>
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              className="h-auto py-4"
              onClick={copyStoreLink}
            >
              <div className="flex items-center justify-center gap-3 w-full">
                <Share2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm font-medium">Share Store</span>
              </div>
            </IonButton>
            <div className="col-span-2">
              <IonButton expand="block" className="h-auto py-4" onClick={() => setAddProductOpen(true)}>
                <div className="flex items-center justify-center gap-3 w-full">
                  <Plus className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">Add Product</span>
                </div>
              </IonButton>
            </div>
          </div>

          <IonModal isOpen={addProductOpen} onDidDismiss={() => setAddProductOpen(false)}>
            <IonHeader>
              <IonToolbar className="ion-padding-start ion-padding-end">
                <IonTitle>Add New Product</IonTitle>
                <IonButton slot="end" fill="clear" onClick={() => setAddProductOpen(false)}>
                  Close
                </IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <div className="space-y-4 py-4 px-4">
                <IonItem lines="none">
                  <IonLabel position="stacked">Product Name</IonLabel>
                  <IonInput
                    placeholder="e.g. Silk Saree"
                    value={newProduct.name}
                    onIonInput={(e) => setNewProduct({ ...newProduct, name: e.detail.value ?? "" })}
                  />
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Price (₹)</IonLabel>
                  <IonInput
                    type="number"
                    placeholder="e.g. 1500"
                    value={newProduct.price}
                    onIonInput={(e) => setNewProduct({ ...newProduct, price: e.detail.value ?? "" })}
                  />
                </IonItem>
                <IonItem lines="none">
                  <IonLabel position="stacked">Image URL (Optional)</IonLabel>
                  <IonInput
                    placeholder="https://..."
                    value={newProduct.image}
                    onIonInput={(e) => setNewProduct({ ...newProduct, image: e.detail.value ?? "" })}
                  />
                </IonItem>
                <p className="text-xs text-muted-foreground ion-padding-start">
                  Tip: You can use WhatsApp image links later.
                </p>
              </div>
              <div className="px-4 pb-4">
                <IonButton
                  expand="block"
                  onClick={handleAddProduct}
                  disabled={
                    !newProduct.name ||
                    !newProduct.price ||
                    addProductMutation.isPending
                  }
                >
                  Add Product
                </IonButton>
              </div>
            </IonContent>
          </IonModal>

          <IonCard className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <IonCardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Total Products</p>
                <h3 className="text-2xl font-bold">{products.length}</h3>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Store Views</p>
                <h3 className="text-2xl font-bold">—</h3>
              </div>
            </IonCardContent>
          </IonCard>

          <div>
            <h2 className="font-semibold text-lg mb-4">Your Inventory</h2>
            {products.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground bg-muted/20">
                <p className="font-medium">No products yet.</p>
                <p className="text-sm mt-1">Add your first item to start selling!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 ring-1 ring-border/50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-base line-clamp-2 text-foreground">
                            {product.name}
                          </h3>
                          <p className="text-primary font-bold text-lg mt-1 flex items-center gap-0.5">
                            <IndianRupee className="w-4 h-4" /> {product.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/store/${displayStore.whatsapp}?product=${product.id}`
                              );
                              toast({ title: "Product Link Copied!" });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 active:bg-primary/35 text-sm font-medium transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Link
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/30 disabled:opacity-50 transition-colors"
                            aria-label="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
