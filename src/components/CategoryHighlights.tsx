import React from 'react';
import { Sparkles, Shirt, Crown, Layers, Tag, HeartHandshake } from 'lucide-react';
import { Category } from '../types';

interface CategoryHighlightsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryHighlights: React.FC<CategoryHighlightsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  // Category visual icons or curated mini images
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'vestidos':
        return '👗';
      case 'conjuntos':
        return '✨';
      case 'alfaiataria':
        return '👔';
      case 'blusas-camisas':
      case 'blusas':
        return '👚';
      case 'calcas-saias':
      case 'calcas':
        return '👖';
      case 'lancamentos':
        return '🌟';
      case 'acessorios':
        return '💎';
      default:
        return '✦';
    }
  };

  return (
    <section className="bg-[#FAF6F6] py-6 sm:py-8 border-b border-[#EEDCDD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#936F33]">
              Navegue por Categorias
            </h3>
          </div>
          <span className="text-[11px] text-[#78686B] hidden sm:inline">
            Toque para filtrar a coleção
          </span>
        </div>

        {/* Circular highlights pills row */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {/* Todas as Peças */}
          <button
            type="button"
            onClick={() => {
              onSelectCategory('todas');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 p-0.5 ${
                selectedCategory === 'todas'
                  ? 'ring-2 ring-[#C5A059] ring-offset-2 ring-offset-[#FAF6F6] bg-gradient-to-tr from-[#231A1B] to-[#382B2D] text-[#FFE8B6] shadow-md'
                  : 'border border-[#EEDCDD] bg-white text-[#231A1B] hover:border-[#C5A059] group-hover:scale-105 shadow-xs'
              }`}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center">
                ✦
              </div>
            </div>
            <span
              className={`text-xs font-semibold tracking-wide transition-colors ${
                selectedCategory === 'todas'
                  ? 'text-[#231A1B] font-bold'
                  : 'text-[#6A5A5D] group-hover:text-[#231A1B]'
              }`}
            >
              Todas
            </span>
          </button>

          {/* Dinamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.slug);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-[#c5a059] ring-offset-2 ring-offset-[#faf8f5] bg-[#1c1917] text-white shadow-md'
                      : 'border border-[#d5cbbe] bg-white text-[#1c1917] hover:border-[#c5a059] group-hover:scale-105 shadow-xs'
                  }`}
                >
                  <span>{getCategoryIcon(cat.slug)}</span>
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'text-[#1c1917] font-bold'
                      : 'text-[#695f54] group-hover:text-[#1c1917]'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
