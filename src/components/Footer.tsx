import React from 'react';
import { Phone, Instagram, ShieldCheck, MapPin, Sparkles, Database } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhone } from '../lib/utils';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, onOpenGuide }) => {
  const cleanWa = cleanPhone(settings.whatsapp);

  return (
    <footer className="bg-[#1c1917] text-[#ded8cf] border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <BrandLogo size="md" showText={true} variant="dark" />
            <div className="text-[11px] tracking-[0.25em] text-[#c5a059] uppercase font-light">
              Vista-se de confiança. Seja você sempre.
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Peças selecionadas pela fundadora Mariane Moreira. Sem loja física, operando 100% online com envio seguro para todo o Brasil.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Pagamento 100% via PIX
            </div>
          </div>

          {/* Customer Service & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
              Atendimento VIP
            </h4>
            <p className="text-xs text-stone-400">
              Dúvidas sobre tamanhos, caimento ou prazos de envio? Fale diretamente com a fundadora no WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Olá Mariane! Gostaria de atendimento para a escolha de peças.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#c5a059] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#25D366]" />
                WhatsApp: +{settings.whatsapp}
              </a>
            </div>
            <a
              href={`https://instagram.com/${(settings.instagram || 'marianemoreira_concept').replace('@', '').trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-stone-300 hover:text-[#c5a059] transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#c5a059]" />
              <span>{settings.instagram || '@marianemoreira_concept'}</span>
            </a>
          </div>

          {/* Pix & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
              Pagamento & Segurança
            </h4>
            <ul className="text-xs text-stone-400 space-y-2">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <span>Chave PIX com identificação imediata na finalização da compra.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <span>Atendimento humanizado e confirmação de estoque em tempo real.</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Owner & Tech Shortcuts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
              Área da Dona & Sistema
            </h4>
            <p className="text-xs text-stone-400">
              Acesso exclusivo para Mariane postar novas peças, alterar preços ou conectar o Supabase.
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="footer-admin-link"
                onClick={onOpenAdmin}
                className="w-full text-left py-2 px-3 text-xs bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg border border-stone-800 transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" /> Painel da Dona
                </span>
                <span className="text-[10px] text-stone-400">Área Restrita</span>
              </button>

              <button
                type="button"
                id="footer-guide-link"
                onClick={onOpenGuide}
                className="w-full text-left py-2 px-3 text-xs bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg border border-stone-800 transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#c5a059]" /> Guia Render & Supabase
                </span>
                <span className="text-[10px] text-emerald-400">Grátis</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} MM Concept. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Vista-se de confiança. Seja você sempre.</span>
            <span>•</span>
            <span>Mariane Moreira</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
