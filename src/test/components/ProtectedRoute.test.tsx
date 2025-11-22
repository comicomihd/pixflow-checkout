import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    const { supabase } = require('@/integrations/supabase/client');
    vi.mocked(supabase.auth.getSession).mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves
    );
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValueOnce({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText(/verificando autenticação/i)).toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    const mockUser = { id: '123', email: 'test@example.com' };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: { user: mockUser } },
      error: null,
    });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValueOnce({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to /auth when not authenticated', async () => {
    const { supabase } = require('@/integrations/supabase/client');

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValueOnce({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
