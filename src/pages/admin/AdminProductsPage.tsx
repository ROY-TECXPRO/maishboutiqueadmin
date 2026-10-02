import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminProducts,
  fetchCategories,
  updateProductPriceStock,
  setProductActive,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/adminProducts';
import {
  ProductFormDialog,
  emptyProductForm,
  type ProductFormState,
} from './ProductFormDialog';
import { RoleBadge } from '@/components/auth/RoleBadge';
import {
  AdminTermsDialog,
  hasAcceptedAdminTerms,
} from '@/components/admin/AdminTermsDialog';
import { useInvalidateCatalog } from '@/lib/catalog';
import { logAdminActivity } from '@/lib/adminActivity';
import { AdminActivityLog } from '@/components/admin/AdminActivityLog';
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
import {
  Loader2, Save, LogOut, Search, Plus, Pencil, Trash2, RefreshCw, PackageX, ImageOff,
  LayoutGrid, ListTree, Check, Home, ScrollText, History,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EditableRowState {
  price: string;
  original_price: string;
  stock: string;
}

export default function AdminProductsPage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const invalidateCatalog = useInvalidateCatalog();
  /** The terms must be accepted before any admin tooling is usable. */
  const [termsAccepted, setTermsAccepted] = useState(() => hasAcceptedAdminTerms());
  /** Lets the admin re-read the terms at any time. */
  const [termsOpen, setTermsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  /** 'categories' shows every category on the website; 'products' shows items. */
  const [section, setSection] = useState<'categories' | 'products' | 'activity'>('categories');
  const [edits, setEdits] = useState<Record<string, EditableRowState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // ---- Add / Edit / Delete dialog state ----
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitial, setFormInitial] = useState<ProductFormState | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  /** How many products sit in each category, for the category cards. */
  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of productsQuery.data ?? []) {
      if (!p.category_id) continue;
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
    }
    return counts;
  }, [productsQuery.data]);

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
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateCatalog();
      const product = (productsQuery.data ?? []).find((p) => p.id === variables.id);
      void logAdminActivity({
        action: variables.isActive ? 'product.activate' : 'product.deactivate',
        entityType: 'product',
        entityId: variables.id,
        entityLabel: product?.name,
        details: {
          name: product?.name,
          sku: product?.sku,
          is_active: variables.isActive,
        },
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function toFormState(p: ProductRecord): ProductFormState {
    return {
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      price: String(p.price),
      original_price: p.original_price != null ? String(p.original_price) : '',
      stock: String(p.stock),
      category_id: p.category_id ?? '',
      gender: p.gender ?? '',
      description: p.description ?? '',
      is_active: p.is_active,
      is_new: p.is_new,
      is_sale: p.is_sale,
      images: p.images ?? [],
    };
  }

  function openCreate() {
    setFormMode('create');
    setFormInitial(undefined);
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(p: ProductRecord) {
    setFormMode('edit');
    setFormInitial(toFormState(p));
    setEditingId(p.id);
    setFormOpen(true);
  }

  function submitForm(form: ProductFormState) {
    setFormSaving(true);
    saveProductMutation.mutate({ id: editingId, form });
  }

  const saveProductMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string | null; form: ProductFormState }) => {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        slug: form.slug.trim(),
        price: Number(form.price),
        original_price: form.original_price.trim() === '' ? null : Number(form.original_price),
        stock: Number(form.stock),
        category_id: form.category_id || null,
        gender: form.gender || null,
        description: form.description.trim() || null,
        is_active: form.is_active,
        is_new: form.is_new,
        is_sale: form.is_sale,
        images: form.images,
      };

      if (id) {
        await updateProduct(id, payload);
        return { action: 'product.update' as const, id, label: payload.name, payload };
      }

      const created = await createProduct(payload);
      return { action: 'product.create' as const, id: created.id, label: payload.name, payload };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateCatalog();
      void logAdminActivity({
        action: result.action,
        entityType: 'product',
        entityId: result.id,
        entityLabel: result.label,
        details: {
          name: result.payload.name,
          sku: result.payload.sku,
          price: result.payload.price,
          stock: result.payload.stock,
          is_active: result.payload.is_active,
        },
      });
      toast.success(result.action === 'product.create' ? 'Product added' : 'Product updated');
      setFormOpen(false);
      setEditingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
    onSettled: () => setFormSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (product: ProductRecord) => deleteProduct(product.id).then(() => product),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateCatalog();
      void logAdminActivity({
        action: 'product.delete',
        entityType: 'product',
        entityId: product.id,
        entityLabel: product.name,
        details: { name: product.name, sku: product.sku, price: product.price },
      });
      toast.success('Product deleted');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
    onSettled: () => setDeleting(false),
  });

  /** Quick "out of stock" — sets stock to 0 (stock stays editable inline). */
  const outOfStockMutation = useMutation({
    mutationFn: (product: ProductRecord) =>
      updateProductPriceStock({ id: product.id, stock: 0 }).then(() => product),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateCatalog();
      void logAdminActivity({
        action: 'product.out_of_stock',
        entityType: 'product',
        entityId: product.id,
        entityLabel: product.name,
        details: { name: product.name, sku: product.sku, old_stock: product.stock, new_stock: 0 },
      });
      toast.success('Marked as out of stock');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [refreshing, setRefreshing] = useState(false);

  /**
   * Re-reads the admin table AND the storefront catalogue cache, so the
   * changes are visible on the website without a full page reload.
   */
  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
        queryClient.invalidateQueries({ queryKey: ['catalog'] }),
      ]);
      await productsQuery.refetch();
      toast.success('Refreshed — showing the latest data');
    } finally {
      setRefreshing(false);
    }
  }

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
      void logAdminActivity({
        action: 'product.price_stock_update',
        entityType: 'product',
        entityId: p.id,
        entityLabel: p.name,
        details: {
          name: p.name,
          sku: p.sku,
          old_price: p.price,
          new_price: price,
          old_stock: p.stock,
          new_stock: stock,
        },
      });
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

  /** Records the sign-out before the session disappears. */
  async function handleSignOut() {
    await logAdminActivity({
      action: 'session.sign_out',
      entityType: 'session',
      entityLabel: user?.email ?? null,
    });
    await signOut();
  }

  return (
    <>
      <AdminTermsDialog open={!termsAccepted} onAccepted={() => setTermsAccepted(true)} />
      {/* Re-reading the terms: already accepted, so the gate stays closed. */}
      <AdminTermsDialog open={termsOpen} onAccepted={() => setTermsOpen(false)} />

      {!termsAccepted ? (
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="text-sm text-muted-foreground text-center">
            Please accept the Admin Terms &amp; Conditions to continue.
          </p>
        </div>
      ) : (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="text-2xl font-semibold">
            {section === 'categories'
              ? 'Category Management'
              : section === 'activity'
                ? 'Admin Activity'
                : 'Product Management'}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge verbose />
            <span className="text-sm text-muted-foreground break-all">{user?.email}</span>
          </div>
        </div>
        {/* flex-wrap + w-full on mobile so no button is ever pushed off-screen */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={refreshing ? 'h-4 w-4 mr-2 animate-spin' : 'h-4 w-4 mr-2'} />
            Refresh
          </Button>
          {/* Returns to the storefront to see live changes. Navigation only —
              the session stays active, so the admin remains signed in. */}
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTermsOpen(true)}>
            <ScrollText className="h-4 w-4 mr-2" />
            Terms
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* ---- Section switcher: Categories -> Products ---- */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setSection('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            section === 'categories'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Categories
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {categoriesQuery.data?.length ?? 0}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSection('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            section === 'products'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListTree className="h-4 w-4" />
          Products
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {productsQuery.data?.length ?? 0}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSection('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            section === 'activity'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" />
          Activity Log
        </button>
      </div>

      {/* ---- Audit trail of admin actions ---- */}
      {section === 'activity' && <AdminActivityLog />}

      {/* ---- All website categories; click one to see its items ---- */}
      {section === 'categories' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Every category on your website. Select one to view and manage its products.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(categoriesQuery.data ?? []).map((c) => {
              const count = productCountByCategory.get(c.id) ?? 0;
              const selected = categoryFilter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(c.id);
                    setSection('products');
                  }}
                  className={`group overflow-hidden rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  <div className="h-24 w-full overflow-hidden bg-muted/40">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageOff className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{c.name}</span>
                      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {(categoriesQuery.data ?? []).length === 0 && !categoriesQuery.isLoading && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No categories found.
            </div>
          )}
        </div>
      )}

      {section === 'products' && (
      <>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 text-sm"
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
        {categoryFilter !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryFilter('all');
              setSection('categories');
            }}
          >
            Back to all categories
          </Button>
        )}
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
          {/* min-w forces a horizontal scrollbar on narrow screens so every
              column (and its buttons) can be reached instead of being cut off. */}
          <Table className="min-w-[900px]">
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
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => {
                const e = getEditState(p);
                const dirty = isDirty(p);
                return (
                  <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : undefined}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-9 w-9 shrink-0 overflow-hidden rounded border border-border bg-muted/50 flex items-center justify-center">
                          {p.images?.[0]?.src ? (
                            <img
                              src={p.images[0].src}
                              alt={p.images[0].alt}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="truncate">
                          {p.name}
                          {p.stock === 0 && (
                            <span className="ml-1.5 text-xs font-normal text-destructive">out of stock</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={p.stock === 0 || outOfStockMutation.isPending}
                          onClick={() => outOfStockMutation.mutate(p)}
                          title="Mark out of stock"
                          aria-label={`Mark ${p.name} out of stock`}
                        >
                          <PackageX className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTarget(p)}
                          aria-label={`Delete ${p.name}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No products yet. Use <strong>Add Product</strong> to create your first one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      </>
      )}

      {/* ---- Add / Edit product dialog ---- */}
      <ProductFormDialog
        open={formOpen}
        mode={formMode}
        title={formMode === 'create' ? 'Add Product' : 'Edit Product'}
        initial={formInitial}
        categories={categoriesQuery.data ?? []}
        saving={formSaving}
        onClose={() => {
          setFormOpen(false);
          setEditingId(null);
        }}
        onSubmit={submitForm}
      />

      {/* ---- Delete confirmation ---- */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(next) => (!next ? setDeleteTarget(null) : undefined)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{deleteTarget?.name}</span> will be
            permanently removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                if (!deleteTarget) return;
                setDeleting(true);
                deleteMutation.mutate(deleteTarget);
              }}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
      )}
    </>
  );
}