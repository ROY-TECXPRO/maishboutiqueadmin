import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RedirectToHomeOnLoad } from '@/components/ui/RedirectToHomeOnLoad';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RedirectToHomeOnLoad />
      <Routes>
        <Route path="/" element={<div>HOME PAGE</div>} />
        <Route path="/admin/login" element={<div>ADMIN LOGIN</div>} />
        <Route path="/cart" element={<div>CART PAGE</div>} />
        <Route path="/admin/products" element={<div>ADMIN DASHBOARD</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RedirectToHomeOnLoad', () => {
  it('sends the user home when the app loads on another page', () => {
    renderAt('/cart');
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('sends the user home when reloading inside the admin dashboard', () => {
    renderAt('/admin/products');
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('leaves the home page alone', () => {
    renderAt('/');
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('preserves /admin/login so admins can still sign in', () => {
    renderAt('/admin/login');
    expect(screen.getByText('ADMIN LOGIN')).toBeInTheDocument();
  });
});
