import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminProducts,
  fetchCategories,
  updateProductPriceStock,
  setProductActive,
} from '@/lib/adminProducts';
import type { ProductRecord } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Save, LogOut, Search } from 'lucide-react';
import { toast } from 'sonner';

interface EditableRowState {
  price: string;
  original_price: string;
  stock: string;
}

export default function AdminProductsPage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [edits, setEdits] = useState<Record<string, EditableRowState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchAdminProducts,
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categoriesQuery.data ?? []) map.set(c.id, c.name);
    return map;
  }, [categoriesQuery.data]);

  const filteredProducts = useMemo(() => {
    const all = productsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    return all.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [productsQuery.data, search, categoryFilter]);

  const activeToggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setProductActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function getEditState(p: ProductRecord): EditableRowState {
    return (
      edits[p.id] ?? {
        price: String(p.price),
        original_price: p.original_price != null ? String(p.original_price) : '',
        stock: String(p.stock),
      }
    );
  }

  function updateEdit(id: string, field: keyof EditableRowState, value: string) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEditStateFor(prev, id), [field]: value },
    }));
  }

  function getEditStateFor(prev: Record<string, EditableRowState>, id: string): EditableRowState {
    const product = (productsQuery.data ?? []).find((p) => p.id === id);
    return (
      prev[id] ?? {
        price: product ? String(product.price) : '0',
        original_price: product?.original_price != null ? String(product.original_price) : '',
        stock: product ? String(product.stock) : '0',
      }
    );
  }

  function isDirty(p: ProductRecord): boolean {
    const e = edits[p.id];
    if (!e) return false;
    const currentOriginal = p.original_price != null ? String(p.original_price) : '';
    return (
      e.price !== String(p.price) ||
      e.original_price !== currentOriginal ||
      e.stock !== String(p.stock)
    );
  }

  async function handleSave(p: ProductRecord) {
    const e = edits[p.id];
    if (!e) return;

    const price = Number(e.price);
    const stock = Number(e.stock);
    const originalPrice = e.original_price.trim() === '' ? null : Number(e.original_price);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Price must be a valid non-negative number');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      toast.error('Stock must be a valid non-negative whole number');
      return;
    }
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
      toast.error('Original price must be a valid non-negative number, or left blank');
      return;
    }

    setSavingId(p.id);
    try {
      await updateProductPriceStock({
        id: p.id,
        price,
        original_price: originalPrice,
        stock,
      });
      toast.success(`${p.name} updated`);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  }

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user?.email} ({user?.role})
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {(categoriesQuery.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {!isLoading && !isError && (
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} of {productsQuery.data?.length ?? 0} products
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load products. If this is your first time here, make sure
          supabase-product-system.sql has been executed and products have
          been migrated (npm run migrate:products).
        </div>
      )}

      {!isLoading && !isError && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-28">Price (KSh)</TableHead>
                <TableHead className="w-28">Was (KSh)</TableHead>
                <TableHead className="w-24">Stock</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-24 text-right">Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => {
                const e = getEditState(p);
                const dirty = isDirty(p);
                return (
                  <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : undefined}>
                    <TableCell className="font-medium max-w-xs truncate">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {p.category_id ? categoryNameById.get(p.category_id) ?? '—' : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={e.price}
                        onChange={(ev) => updateEdit(p.id, 'price', ev.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={e.original_price}
                        onChange={(ev) => updateEdit(p.id, 'original_price', ev.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={e.stock}
                        onChange={(ev) => updateEdit(p.id, 'stock', ev.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(checked) =>
                          activeToggleMutation.mutate({ id: p.id, isActive: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={!dirty || savingId === p.id}
                        onClick={() => handleSave(p)}
                      >
                        {savingId === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No products match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
