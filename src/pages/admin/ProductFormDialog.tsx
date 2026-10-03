import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { CategoryRecord } from '@/types';
import { slugify, uploadProductImage } from '@/lib/adminProducts';
import { toast } from 'sonner';

export interface ProductFormState {
  name: string;
  sku: string;
  slug: string;
  price: string;
  original_price: string;
  stock: string;
  category_id: string;
  gender: string;
  description: string;
  is_active: boolean;
  is_new: boolean;
  is_sale: boolean;
  /** Comma-separated; empty means the product has no size variants. */
  sizes: string;
  /** Comma-separated "Name|#hex" pairs; empty means no colour variants. */
  colors: string;
  images: Array<{ src: string; alt: string }>;
}

export const emptyProductForm: ProductFormState = {
  name: '',
  sku: '',
  slug: '',
  price: '0',
  original_price: '',
  stock: '0',
  category_id: '',
  gender: '',
  description: '',
  is_active: true,
  is_new: false,
  is_sale: false,
  sizes: '',
  colors: '',
  images: [],
};

/**
 * Parses the free-text variant inputs into the shapes the database expects.
 *
 * A product with no sizes/colors is perfectly valid — the storefront renders
 * "One Size" for it — so both parsers return an empty array rather than
 * forcing the admin to invent variants.
 *
 * "Red|#ff0000, Blue|#0000ff" -> [{name:'Red',hex:'#ff0000',available:true}, ...]
 * "Red, Blue"                  -> name only, a neutral swatch is used.
 */
export function parseColorInput(raw: string): Array<{ name: string; hex: string; available: boolean }> {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, hex] = part.split('|').map((p) => p.trim());
      const cleanHex = hex && /^#[0-9a-f]{3,8}$/i.test(hex) ? hex : '';
      return { name, hex: cleanHex, available: true };
    })
    .filter((c) => c.name.length > 0);
}

export function parseSizeInput(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface ProductFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  title: string;
  initial?: ProductFormState;
  categories: CategoryRecord[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (form: ProductFormState) => void;
}

/**
 * Add / Edit a product. The slug is auto-derived from the name when creating
 * (both `sku` and `slug` are UNIQUE NOT NULL in the database, so the dialog
 * blocks submission until both are filled).
 */
export function ProductFormDialog({
  open,
  mode,
  title,
  initial,
  categories,
  saving,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductFormState>(initial ?? emptyProductForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, images: [{ src: url, alt: prev.name || file.name }] }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyProductForm);
      setSlugTouched(mode === 'edit');
    }
  }, [open, initial, mode]);

  const set = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const price = Number(form.price);
  const stock = Number(form.stock);
  const originalPrice = form.original_price.trim() === '' ? null : Number(form.original_price);

  const canSubmit =
    form.name.trim().length > 0 &&
    form.sku.trim().length > 0 &&
    form.slug.trim().length > 0 &&
    Number.isFinite(price) &&
    price >= 0 &&
    Number.isInteger(stock) &&
    stock >= 0 &&
    (originalPrice === null || (Number.isFinite(originalPrice) && originalPrice >= 0));

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="pf-name">Product name *</Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Classic Leather Handbag"
            />
          </div>

          <div>
            <Label htmlFor="pf-sku">SKU *</Label>
            <Input
              id="pf-sku"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="e.g. HB-001"
            />
          </div>

          <div>
            <Label htmlFor="pf-slug">Slug *</Label>
            <Input
              id="pf-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', e.target.value);
              }}
              placeholder="classic-leather-handbag"
            />
            <p className="text-xs text-muted-foreground mt-1">Must be unique. Used in the URL.</p>
          </div>
          <div>
            <Label htmlFor="pf-price">Price (KSh) *</Label>
            <Input
              id="pf-price"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="pf-original">Was price (KSh)</Label>
            <Input
              id="pf-original"
              type="number"
              min={0}
              value={form.original_price}
              onChange={(e) => set('original_price', e.target.value)}
              placeholder="Leave blank if not on sale"
            />
          </div>

          <div>
            <Label htmlFor="pf-stock">Stock *</Label>
            <Input
              id="pf-stock"
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="pf-category">Category</Label>
            <select
              id="pf-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="pf-gender">Gender</Label>
            <select
              id="pf-gender"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.gender}
              onChange={(e) => set('gender', e.target.value)}
            >
              <option value="">Unspecified</option>
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Kids">Kids</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pf-sizes">Sizes</Label>
            <Input
              id="pf-sizes"
              value={form.sizes}
              onChange={(e) => set('sizes', e.target.value)}
              placeholder="S, M, L, XL  — or leave blank for One Size"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate with commas. Leave blank and the product is sold as “One Size”.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pf-colors">Colours</Label>
            <Input
              id="pf-colors"
              value={form.colors}
              onChange={(e) => set('colors', e.target.value)}
              placeholder="Black|#1f2937, Red|#dc2626, Blue|#2563eb"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate with commas, optionally as “Name|#hex”. Leave blank for a single
              “As supplied” colour.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pf-description">Description</Label>
            <Textarea
              id="pf-description"
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the product…"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pf-image">Product image</Label>
            <div className="flex items-start gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted/50 flex items-center justify-center">
                {form.images[0]?.src ? (
                  <img
                    src={form.images[0].src}
                    alt={form.images[0].alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground px-1 text-center">No image</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  id="pf-image"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="h-auto py-2 text-sm"
                />
                <Input
                  placeholder="…or paste an image URL"
                  value={form.images[0]?.src ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      images: e.target.value
                        ? [{ src: e.target.value, alt: prev.name || 'product image' }]
                        : [],
                    }))
                  }
                />
                {uploading && (
                  <p className="text-xs text-muted-foreground">Uploading to Supabase Storage…</p>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="pf-active" className="text-sm">Active</Label>
              <Switch id="pf-active" checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="pf-new" className="text-sm">New</Label>
              <Switch id="pf-new" checked={form.is_new} onCheckedChange={(v) => set('is_new', v)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="pf-sale" className="text-sm">On sale</Label>
              <Switch id="pf-sale" checked={form.is_sale} onCheckedChange={(v) => set('is_sale', v)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(form)} disabled={!canSubmit || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {mode === 'create' ? 'Add Product' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductFormDialog;