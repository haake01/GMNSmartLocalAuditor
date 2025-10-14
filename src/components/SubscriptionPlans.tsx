import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import { TenantService } from '../services/tenantService';
import type { SubscriptionPlan } from '../types/tenant';

interface SubscriptionPlansProps {
  tenantId: string;
  currentPlan: string;
  onPlanChange: (planName: string) => void;
}

export function SubscriptionPlans({ tenantId, currentPlan, onPlanChange }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await TenantService.getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planName: string) => {
    if (processing) return;

    try {
      setProcessing(true);
      await TenantService.changeSubscriptionPlan(tenantId, planName as any, billingCycle);
      onPlanChange(planName);
      alert('Plano alterado com sucesso!');
    } catch (err) {
      console.error('Erro ao alterar plano:', err);
      alert('Erro ao alterar plano. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free': return 'from-gray-400 to-gray-600';
      case 'starter': return 'from-blue-400 to-blue-600';
      case 'professional': return 'from-purple-400 to-purple-600';
      case 'enterprise': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Escolha seu Plano</h2>
        <div className="inline-flex items-center gap-2 bg-white/90 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              billingCycle === 'annual'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Anual
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">-10%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;
          const monthlyPrice = billingCycle === 'annual' ? (plan.price_annual / 12).toFixed(2) : price.toFixed(2);
          const isCurrentPlan = plan.name === currentPlan;

          return (
            <div
              key={plan.id}
              className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                isCurrentPlan
                  ? 'border-blue-500 ring-4 ring-blue-500/20'
                  : 'border-white/20 hover:border-blue-300'
              }`}
            >
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(plan.name)} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.display_name}</h3>
                <p className="text-sm text-gray-600 mb-4 h-12">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-800">R$ {monthlyPrice}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cobrado anualmente (R$ {plan.price_annual.toFixed(2)})
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handlePlanChange(plan.name)}
                  disabled={isCurrentPlan || processing}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 mb-6 ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {processing ? 'Processando...' : isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
                </button>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Recursos Inclusos</p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Limites</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Usuários</p>
                      <p className="font-semibold text-gray-800">
                        {plan.limits.max_users === 0 ? 'Ilimitado' : plan.limits.max_users}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Auditorias</p>
                      <p className="font-semibold text-gray-800">
                        {plan.limits.max_audits_per_month === 0 ? 'Ilimitado' : `${plan.limits.max_audits_per_month}/mês`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
