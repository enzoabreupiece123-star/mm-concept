import React from 'react';
import { Sparkles, MessageCircle, Heart, Gem, Check } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhone } from '../lib/utils';
import { BrandLogo } from './BrandLogo';

interface FounderSectionProps {
  settings: StoreSettings;
}

export const FounderSection: React.FC<FounderSectionProps> = ({ settings }) => {
  if (settings.aboutFounderEnabled === false) return null;

  const cleanWa = cleanPhone(settings.whatsapp);

  const title = settings.aboutFounderTitle || 'A Essência da Marca';
  const subtitle =
    settings.aboutFounderSubtitle && !settings.aboutFounderSubtitle.includes('alfaiataria')
      ? settings.aboutFounderSubtitle
      : 'Vista-se de confiança. Seja você sempre.';
  const story =
    settings.aboutFounderStory && !settings.aboutFounderStory.includes('alfaiataria') && !settings.aboutFounderStory.includes('alta costura')
      ? settings.aboutFounderStory
      : 'A Mariane Moreira Concept nasceu do olhar e paixão de Mariane Moreira pela moda feminina. Mariane é a fundadora da marca, atuando diretamente na curadoria, compra e revenda de peças selecionadas a dedo, com alto padrão de qualidade e elegância. Vista-se de confiança. Seja você sempre. Não temos loja física — somos uma boutique 100% online, garantindo atendimento humanizado e envio cuidadoso para todo o Brasil.';
  const image =
    settings.aboutFounderImage ||
    '/src/assets/images/mm_founder_portrait_1792103266710.jpg';
  const quote =
    settings.aboutFounderQuote ||
    '“A verdadeira sofisticação está em escolher peças com caimento impecável e elegância atemporal que valorizam o seu estilo.”';
  const signature = settings.aboutFounderSignature || 'Mariane Moreira';

  return (
    <section className="bg-[#FAF3F4]/70 border-y border-[#EEDCDD] py-16 sm:py-24 relative overflow-hidden">
      {/* Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Founder Photo Editorial Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src={image}
                  alt={signature}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1415]/75 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="font-serif text-xl sm:text-2xl font-light italic">
                    {signature}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#FFE8B6] font-semibold">
                    Fundadora • Mariane Moreira Concept
                  </div>
                </div>
              </div>

              {/* Floating decorative badge using BrandLogo */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#EEDCDD] max-w-[230px] hidden sm:block">
                <div className="flex items-center gap-3">
                  <BrandLogo size="xs" showText={false} customLogoUrl={settings.logoUrl} />
                  <div>
                    <div className="text-xs font-bold text-[#231A1B]">
                      Vista-se de Confiança
                    </div>
                    <div className="text-[10px] text-[#78686B]">
                      Seja você sempre
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E6E8] border border-[#E8C5C8] text-xs font-semibold tracking-wider uppercase text-[#936F33]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              Conheça a Fundadora
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#231A1B] leading-tight">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-[#936F33] font-serif italic">
              {subtitle}
            </p>

            <div className="text-sm sm:text-base text-[#5E4F52] leading-relaxed whitespace-pre-line font-normal space-y-4">
              <p>{story}</p>
            </div>

            {/* Founder Quote Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#EEDCDD] shadow-xs space-y-2">
              <p className="font-serif italic text-base text-[#231A1B] leading-relaxed">
                {quote}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#F5EAEB]">
                <span className="text-xs font-bold tracking-wider uppercase text-[#936F33]">
                  — {signature}
                </span>
                <span className="text-[11px] text-[#78686B]">
                  Fundadora & Curadora
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Call */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                  'Olá Mariane! Conheci a sua história no site e adorei as suas peças. Gostaria de um atendimento personalizado.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 bg-[#231A1B] hover:bg-[#382B2D] text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-full transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                Conversar com a Mariane no WhatsApp
              </a>
              <span className="text-xs text-[#78686B]">
                Atendimento pessoal e consultoria de estilo
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
