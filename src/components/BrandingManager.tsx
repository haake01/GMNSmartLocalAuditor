import { useState, useEffect } from 'react';
import { TenantService } from '../services/tenantService';
import { useTenant } from '../contexts/TenantContext';
import { Palette, Upload, Eye, Save, RotateCcw } from 'lucide-react';

interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export function BrandingManager() {
  const { currentTenant } = useTenant();
  const [colors, setColors] = useState<BrandingColors>({
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937'
  });
  const [logoUrl, setLogoUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      loadBranding();
    }
  }, [currentTenant]);

  const loadBranding = async () => {
    if (!currentTenant) return;

    try {
      const branding = await TenantService.getTenantBranding(currentTenant.id);
      if (branding) {
        setColors({
          primary: branding.primary_color,
          secondary: branding.secondary_color,
          accent: branding.accent_color || '#10B981',
          background: branding.background_color || '#FFFFFF',
          text: branding.text_color || '#1F2937'
        });
        setLogoUrl(branding.logo_url || '');
        setCompanyName(branding.company_name || currentTenant.name);
        setTagline(branding.tagline || '');
        setCustomCss(branding.custom_css || '');
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    }
  };

  const handleSave = async () => {
    if (!currentTenant) return;

    try {
      setSaving(true);
      await TenantService.updateTenantBranding(currentTenant.id, {
        logo_url: logoUrl,
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
        background_color: colors.background,
        text_color: colors.text,
        company_name: companyName,
        tagline: tagline,
        custom_css: customCss
      });
      alert('Branding atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Erro ao salvar branding');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColors({
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#FFFFFF',
      text: '#1F2937'
    });
    setLogoUrl('');
    setCompanyName(currentTenant?.name || '');
    setTagline('');
    setCustomCss('');
  };

  const PreviewCard = () => (
    <div
      className="rounded-xl shadow-xl border-2 overflow-hidden"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.primary
      }}
    >
      <div
        className="p-6"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-16 h-16 rounded-lg bg-white p-2 object-contain"
            />
          )}
          <div>
            <h3 className="text-2xl font-bold text-white">{companyName || 'Nome da Empresa'}</h3>
            {tagline && <p className="text-white/90 text-sm mt-1">{tagline}</p>}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
            Exemplo de Conteúdo
          </h4>
          <p className="text-sm" style={{ color: colors.text, opacity: 0.8 }}>
            Este é um preview de como seu branding aparecerá no sistema.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Primary
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: colors.secondary }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: colors.accent }}
          >
            Accent
          </button>
        </div>

        <div
          className="p-4 rounded-lg border-2"
          style={{
            borderColor: colors.accent,
            backgroundColor: `${colors.accent}10`
          }}
        >
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            Destaque com cor de acento
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Personalização de Marca</h2>
          <p className="text-gray-600 mt-1">Configure as cores, logotipo e identidade visual</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-5 h-5" />
            {showPreview ? 'Ocultar' : 'Preview'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Resetar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Identidade Visual</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Logotipo
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tamanho recomendado: 512x512px, formato PNG ou SVG
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Minha Empresa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline/Slogan
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Transformando dados em insights"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Paleta de Cores</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.secondary}
                      onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Acento
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor de Fundo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.background}
                      onChange={(e) => setColors({ ...colors, background: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.background}
                      onChange={(e) => setColors({ ...colors, background: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colors.text}
                      onChange={(e) => setColors({ ...colors, text: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colors.text}
                      onChange={(e) => setColors({ ...colors, text: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">CSS Customizado</h3>
            <textarea
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder="/* CSS adicional para customização avançada */"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              CSS personalizado será aplicado globalmente no sistema
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {showPreview && (
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview em Tempo Real</h3>
              <PreviewCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
