import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredStoreId, getStoredOwnerToken, api, type PageConfig } from "@/lib/api";
import { SectionEditor } from "@/components/store-builder/SectionEditor";
import { useToast } from "@/hooks/use-toast";
import { defaultPageConfig, type PageConfig as SchemaPageConfig } from "@shared/schema";

export default function DashboardDesign() {
  const history = useHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const storeId = getStoredStoreId();
  const ownerToken = getStoredOwnerToken();

  const { data: store, isLoading } = useQuery({
    queryKey: ["stores", storeId ?? ""],
    queryFn: () => api.getStoreById(storeId!),
    enabled: !!storeId,
  });

  const [pageConfig, setPageConfig] = useState<SchemaPageConfig>(defaultPageConfig);

  useEffect(() => {
    if (store?.pageConfig?.sections?.length) {
      setPageConfig(store.pageConfig as SchemaPageConfig);
    } else if (store && !store.pageConfig?.sections?.length) {
      setPageConfig(defaultPageConfig);
    }
  }, [store]);

  const updateStoreMutation = useMutation({
    mutationFn: (config: SchemaPageConfig) =>
      api.updateStore(storeId!, { pageConfig: config as PageConfig }, ownerToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores", storeId!] });
      toast({ title: "Store design saved", description: "Your store page has been updated." });
      history.push("/dashboard");
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!storeId || !ownerToken) {
      toast({
        title: "Sign in to save",
        description: "Complete signup to save your store design.",
        variant: "destructive",
      });
      return;
    }
    updateStoreMutation.mutate(pageConfig);
  };

  if (storeId && isLoading && !store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
        <header className="bg-secondary text-white p-6 shadow-md">
          <div className="max-w-md mx-auto">
            <h1 className="font-bold text-xl">Customize store</h1>
            <p className="text-white/80 text-sm mt-1">
              Arrange sections and edit content. Changes apply to your public store page.
            </p>
          </div>
        </header>
        <main className="max-w-md mx-auto p-6">
          <SectionEditor
            pageConfig={pageConfig}
            onChange={setPageConfig}
            onBack={() => history.push("/dashboard")}
            onNext={handleSave}
            nextLabel={updateStoreMutation.isPending ? "Saving…" : "Save design"}
            nextDisabled={updateStoreMutation.isPending}
          />
        </main>
      </div>
  );
}
