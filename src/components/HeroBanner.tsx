import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  MessageCircle,
  Gem,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhone } from '../lib/utils';
import { BrandLogo } from './BrandLogo';

interface HeroBannerProps {
  settings: StoreSettings;
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ settings, onExploreClick }) => {
  const cleanWa = cleanPhone(settings.whatsapp);

  const heroImage =
    settings.heroImageUrl ||
    '/src/assets/images/mm_concept_hero_1792103250693.jpg';

  const heroCtaText = settings.heroCtaText || 'Explorar Coleção';
  const heroSecondaryCtaText = settings.heroSecondaryCtaText || 'Atendimento no WhatsApp';

  return (
    <header className="relative w-full overflow-hidden border-b border-[#EEDCDD]">
      {/* =========================================================================
          HERO BANNER - MARIANE MOREIRA CONCEPT
          ========================================================================= */}
      <div className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center">
        {/* Foto Editorial ao Fundo */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroImage}
            alt="Mariane Moreira Concept - Boutique Online"
            className="w-full h-full object-cover object-[center_20%] sm:object-[center_top] scale-100 transition-transform duration-1000 ease-out"
            loading="eager"
            referrerPolicy="no-referrer"
          />

          {/* Gradients de Sobreposição com Luz Rose Gold e Champagne */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1415]/95 via-[#231A1B]/85 to-[#1A1415]/40 sm:w-4/5 lg:w-7/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1415] via-transparent to-[#1A1415]/60" />
          <div className="absolute inset-0 bg-[#381B20]/15 mix-blend-multiply" />

          {/* Textura sutil de luz suave */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F4D0D4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        </div>

        {/* Conteúdo Editorial do Hero */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl text-left space-y-6">
            {/* Selo com a Logo Emblemática */}
            <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/10 border border-[#F4D0D4]/30 backdrop-blur-md shadow-sm">
              <BrandLogo size="xs" showText={false} customLogoUrl={settings.logoUrl} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#FFE8B6]">
                  MM Concept
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-stone-300 hidden sm:inline">
                  Mariane Moreira
                </span>
              </div>
            </div>

            {/* Título Principal */}
            <div className="space-y-1.5">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] tracking-tight text-white">
                MM <span className="italic font-light text-[#FFE8B6]">Concept</span>
              </h1>
              <p className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#FFE8B6] font-medium pt-0.5">
                Mariane Moreira
              </p>
              <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[#E5B5BA] font-light pt-1">
                Vista-se de confiança. Seja você sempre.
              </p>
            </div>

            {/* Subtítulo Narrativo */}
            <p className="text-sm sm:text-base leading-relaxed max-w-xl font-normal text-stone-200">
              Peças selecionadas a dedo pela fundadora Mariane Moreira. Modelagens com caimento impecável e elegância atemporal, entregues com carinho em todo o Brasil.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                id="hero-explore-button"
                onClick={onExploreClick}
                className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#9E7A36] hover:from-[#E2BE66] hover:to-[#B38C44] text-[#1A1415] font-semibold text-xs uppercase tracking-[0.18em] rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>{heroCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                  'Olá Mariane! Estive no site da Mariane Moreira Concept e gostaria de atendimento para conhecer as peças.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] rounded-full transition-all duration-300 flex items-center justify-center gap-2 border bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{heroSecondaryCtaText}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Card Flutuante de Autoridade da Dona (Canto inferior direito) */}
        {settings.heroShowOwnerCard !== false && (
          <div className="hidden lg:flex absolute bottom-8 right-8 z-20 items-center gap-3 p-3.5 pr-5 rounded-2xl bg-[#1A1415]/90 border border-[#F4D0D4]/30 backdrop-blur-md text-white shadow-2xl max-w-xs animate-fade-in">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C5A059] shadow-sm">
                <img
                  src={settings.aboutFounderImage || '/src/assets/images/mm_founder_portrait_1792103266710.jpg'}
                  alt="Mariane Moreira"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1A1415] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white tracking-wide truncate">
                Mariane Moreira
              </div>
              <div className="text-[10px] text-[#FFE8B6] tracking-wider uppercase truncate">
                Fundadora • MM Concept
              </div>
              <div className="text-[10px] text-stone-300 mt-0.5">
                Vista-se de confiança
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BARRA DE VANTAGENS EXCLUSIVAS
          ========================================================================= */}
      <div className="bg-[#231A1B] text-white border-t border-[#382B2D] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#382B2D] border border-[#C5A059]/40 flex items-center justify-center text-[#FFE8B6] shrink-0">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-100 tracking-wide">
                Vista-se de Confiança
              </div>
              <div className="text-[11px] text-stone-400">
                Seja você sempre • Peças selecionadas por Mariane
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#382B2D] border border-[#C5A059]/40 flex items-center justify-center text-[#FFE8B6] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-100 tracking-wide">
                Boutique 100% Online
              </div>
              <div className="text-[11px] text-stone-400">
                Envio cuidadoso para todo o Brasil
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#382B2D] border border-[#C5A059]/40 flex items-center justify-center text-[#FFE8B6] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-100 tracking-wide">
                Atendimento Humanizado
              </div>
              <div className="text-[11px] text-stone-400">
                Consultoria e suporte direto no WhatsApp
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
