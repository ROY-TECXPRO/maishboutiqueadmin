import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import type { ReactNode } from 'react';

/**
 * A product exactly as the admin dashboard writes it: a `products` table row
 * with a generated uuid, NO `legacy_id`, and NO `sizes` / `colors` (the admin
 * Add Product form has no fields for them).
 */
const ADMIN_PRODUCT_ROW = {
  id: '3f7c1a20-9b44-4c1e-8f0a-2d6e5b8a1c33',
  legacy_id: null,
  sku: 'HB-900',
  slug: 'classic-leather-handbag',
  name: 'Classic Leather Handbag',
  price: 4500,
  original_price: null,
  description: 'A handbag.',
  category_id: null,
  gender: 'Women',
  tags: [],
  use_case: [],
  rating: 0,
  review_count: 0,
  is_new: true,
  is_sale: false,
  stock: 12,
  size_prices: null,
  images: [{ src: '/images/bag.webp', alt: 'Classic Leather Handbag' }],
  colors: [],
  sizes: [],
  features: [],
  is_active: true,
};

let productsRows: unknown[] = [];

const chainable = (value: unknown) => {
  const q: Record<string, unknown> = {};
  ['select', 'order', 'eq', 'in', 'limit', 'single'].forEach((m) => {
    q[m] = () => q;
  });
  q.then = (onOk: (v: unknown) => unknown) => Promise.resolve(onOk(value));
  return q;
};

/** Minimal in-memory Storage so CartContext can persist in this environment. */
function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
  } as Storage;
}

const memoryStorage = createMemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  value: memoryStorage,
  configurable: true,
  writable: true,
});
Object.defineProperty(window, 'localStorage', {
  value: memoryStorage,
  configurable: true,
  writable: true,
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'categories') return chainable([]);
      return chainable({ data: productsRows, error: null });
    },
    storage: { from: () => ({ upload: vi.fn(), getPublicUrl: vi.fn() }) },
  },
}));

// sonner renders toasts outside the tree; keep the test output clean.
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { fetchCatalog, findById } = await import('@/lib/catalog');
const ProductDetailPage = (await import('@/pages/ProductDetailPage')).default;

function Harness({ path }: { path: string }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const wrap = (children: ReactNode) => (
    <QueryClientProvider client={client}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
  return wrap(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:productId" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('admin-created products are purchasable', () => {
  beforeEach(() => {
    productsRows = [ADMIN_PRODUCT_ROW];
    window.localStorage.clear();
  });

  it('reads the admin product from the database', async () => {
    const catalog = await fetchCatalog();
    expect(catalog.source).toBe('supabase');
    expect(catalog.products).toHaveLength(1);
    expect(catalog.products[0].name).toBe('Classic Leather Handbag');
  });

  it('exposes the database uuid as the product id so /product/<uuid> resolves', async () => {
    const catalog = await fetchCatalog();
    const found = findById(catalog.products, ADMIN_PRODUCT_ROW.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(ADMIN_PRODUCT_ROW.id);
  });

  it('renders the product page for an admin product (never "Product Not Found")', async () => {
    render(<Harness path={`/product/${ADMIN_PRODUCT_ROW.id}`} />);
    expect(screen.queryByText('Product Not Found')).toBeNull();
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Classic Leather Handbag' })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText('Product Not Found')).toBeNull();
  });

  it('lets a customer add an admin product with no sizes/colors to the cart', async () => {
    render(<Harness path={`/product/${ADMIN_PRODUCT_ROW.id}`} />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Classic Leather Handbag' })
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    // The item must actually land in the cart.
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('maish-cart') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].product.name).toBe('Classic Leather Handbag');
    });
  });
});