import { useState, useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { TenantService } from '../services/tenantService';
import type { Tenant } from '../types/tenant';

interface TenantSelectorProps {
  currentTenantId: string | null;
  onTenantChange: (tenant: Tenant) => void;
}

export function TenantSelector({ currentTenantId, onTenantChange }: TenantSelectorProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenantId) {
      loadTenant(currentTenantId);
    } else {
      setLoading(false);
    }
  }, [currentTenantId]);

  const loadTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      const data = await TenantService.getTenant(tenantId);
      setTenant(data);
      if (data) {
        onTenantChange(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tenant');
      console.error('Erro ao carregar tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-sm text-gray-600">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const planColors = {
    free: 'text-gray-600',
    starter: 'text-blue-600',
    professional: 'text-purple-600',
    enterprise: 'text-orange-600',
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{tenant.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[tenant.status]}`}>
                {tenant.status === 'active' && 'Ativo'}
                {tenant.status === 'trial' && 'Trial'}
                {tenant.status === 'suspended' && 'Suspenso'}
                {tenant.status === 'cancelled' && 'Cancelado'}
              </span>
            </div>
            <p className={`text-sm font-medium ${planColors[tenant.subscription_plan]}`}>
              Plano {tenant.subscription_plan.charAt(0).toUpperCase() + tenant.subscription_plan.slice(1)}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {tenant.status === 'trial' && tenant.trial_ends_at && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Trial termina em: {new Date(tenant.trial_ends_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Usuários</p>
          <p className="text-sm font-semibold text-gray-800">{tenant.max_users}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Auditorias/mês</p>
          <p className="text-sm font-semibold text-gray-800">
            {tenant.max_audits_per_month === 0 ? '∞' : tenant.max_audits_per_month}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-gray-600">Licença</p>
          <p className="text-xs font-mono text-gray-600">{tenant.license_key.slice(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
}
