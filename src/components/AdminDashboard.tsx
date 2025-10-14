import { useState, useEffect } from 'react';
import { TenantService } from '../services/tenantService';
import { useTenant } from '../contexts/TenantContext';
import type { Tenant, TenantUser } from '../types/tenant';
import {
  Users,
  Building2,
  CreditCard,
  Activity,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export function AdminDashboard() {
  const { currentTenant } = useTenant();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'usage'>('tenants');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, usersData] = await Promise.all([
        TenantService.listTenants(),
        currentTenant ? TenantService.listTenantUsers(currentTenant.id) : Promise.resolve([])
      ]);
      setTenants(tenantsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trial': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h2>
          <p className="text-gray-600 mt-1">Gerenciamento de tenants, usuários e recursos</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Novo Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{tenants.length}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Tenants</h3>
          <p className="text-xs text-gray-500 mt-1">
            {tenants.filter(t => t.status === 'active').length} ativos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{users.length}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Usuários</h3>
          <p className="text-xs text-gray-500 mt-1">
            {users.filter(u => u.is_active).length} ativos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {tenants.filter(t => t.subscription_plan === 'enterprise').length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Enterprise</h3>
          <p className="text-xs text-gray-500 mt-1">Planos premium</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              ${tenants.length * 997}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">MRR Estimado</h3>
          <p className="text-xs text-gray-500 mt-1">Receita mensal</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tenants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Tenants
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </div>
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'usage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Uso e Quotas
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b">
                      <th className="pb-3 font-medium">Tenant</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Plano</th>
                      <th className="pb-3 font-medium">Usuários</th>
                      <th className="pb-3 font-medium">Auditorias</th>
                      <th className="pb-3 font-medium">Criado</th>
                      <th className="pb-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div>
                            <div className="font-medium text-gray-900">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.slug}</div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                            {getStatusIcon(tenant.status)}
                            {tenant.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadge(tenant.subscription_plan)}`}>
                            {tenant.subscription_plan}
                          </span>
                        </td>
                        <td className="py-4 text-gray-600">
                          {tenant.max_users === 999999 ? '∞' : tenant.max_users}
                        </td>
                        <td className="py-4 text-gray-600">
                          {tenant.max_audits_per_month === 999999 ? '∞' : `${tenant.max_audits_per_month}/mês`}
                        </td>
                        <td className="py-4 text-gray-600 text-sm">
                          {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b">
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Último Login</th>
                      <th className="pb-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="font-medium text-gray-900">{user.email}</div>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <XCircle className="w-3 h-3" />
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-gray-600 text-sm">
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadge(tenant.subscription_plan)}`}>
                      {tenant.subscription_plan}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Usuários</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.tenant_id === tenant.id).length}
                        <span className="text-sm text-gray-500 font-normal ml-1">
                          / {tenant.max_users === 999999 ? '∞' : tenant.max_users}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: tenant.max_users === 999999
                              ? '0%'
                              : `${Math.min((users.filter(u => u.tenant_id === tenant.id).length / tenant.max_users) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Auditorias (mês)</div>
                      <div className="text-2xl font-bold text-gray-900">
                        0
                        <span className="text-sm text-gray-500 font-normal ml-1">
                          / {tenant.max_audits_per_month === 999999 ? '∞' : tenant.max_audits_per_month}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Features Habilitadas</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Object.values(tenant.features_enabled || {}).filter(Boolean).length}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.keys(tenant.features_enabled || {}).filter(k => (tenant.features_enabled as Record<string, boolean>)[k]).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
