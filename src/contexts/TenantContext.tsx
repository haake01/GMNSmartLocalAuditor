import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantService } from '../services/tenantService';
import type { Tenant } from '../types/tenant';

interface TenantContextType {
  currentTenant: Tenant | null;
  loading: boolean;
  error: string | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  defaultTenantSlug?: string;
}

export function TenantProvider({ children, defaultTenantSlug = 'gmn-master' }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenant = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const tenant = await TenantService.getTenantBySlug(slug);
      if (tenant) {
        setCurrentTenant(tenant);
        localStorage.setItem('gmn_current_tenant_slug', slug);
      } else {
        setError(`Tenant "${slug}" não encontrado`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tenant');
      console.error('Erro ao carregar tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshTenant = async () => {
    if (currentTenant) {
      await loadTenant(currentTenant.slug);
    }
  };

  useEffect(() => {
    const savedSlug = localStorage.getItem('gmn_current_tenant_slug');
    const slugToLoad = savedSlug || defaultTenantSlug;
    loadTenant(slugToLoad);
  }, [defaultTenantSlug]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        loading,
        error,
        setCurrentTenant: (tenant) => {
          setCurrentTenant(tenant);
          if (tenant) {
            localStorage.setItem('gmn_current_tenant_slug', tenant.slug);
          }
        },
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useTenantId(): string | null {
  const { currentTenant } = useTenant();
  return currentTenant?.id || null;
}

export function useRequireTenant(): Tenant {
  const { currentTenant, loading } = useTenant();

  if (loading) {
    throw new Error('Tenant is loading');
  }

  if (!currentTenant) {
    throw new Error('No tenant selected');
  }

  return currentTenant;
}
