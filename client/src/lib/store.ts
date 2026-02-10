import { useState, useEffect } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

export type BusinessType = 'saree' | 'food' | 'beauty' | 'electronics' | 'handmade' | 'other';

export type StoreData = {
  name: string;
  type: BusinessType;
  whatsapp: string;
  products: Product[];
};

const DEFAULT_STORE: StoreData = {
  name: "My Kolkata Store",
  type: "saree",
  whatsapp: "919876543210",
  products: [
    {
      id: "1",
      name: "Handloom Cotton Saree",
      price: 1250,
      image: "https://images.unsplash.com/photo-1610189012906-4783fdae2c2e?q=80&w=1000&auto=format&fit=crop",
      description: "Authentic handloom cotton saree, perfect for daily wear."
    },
    {
      id: "2",
      name: "Silk Baluchari",
      price: 4500,
      image: "https://images.unsplash.com/photo-1583391725988-54305843a64b?q=80&w=1000&auto=format&fit=crop",
      description: "Traditional Baluchari silk saree with mythological motifs."
    }
  ]
};

export function useStore() {
  const [store, setStore] = useState<StoreData>(() => {
    const saved = localStorage.getItem('amar_dokan_store');
    return saved ? JSON.parse(saved) : DEFAULT_STORE;
  });

  useEffect(() => {
    localStorage.setItem('amar_dokan_store', JSON.stringify(store));
  }, [store]);

  const updateStore = (data: Partial<StoreData>) => {
    setStore(prev => ({ ...prev, ...data }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    setStore(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const removeProduct = (id: string) => {
    setStore(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  return { store, updateStore, addProduct, removeProduct };
}
