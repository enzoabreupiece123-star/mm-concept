import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, X, Menu, User } from 'lucide-react';
import { Category, CustomerUser } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  currentUser?: CustomerUser | null;
  onOpenCustomerAuth: () => void;
  whatsappNumber: string;
  isSupabaseConnected: boolean;
  announcementText?: string;
  showAnnouncement?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  currentUser,
  onOpenCustomerAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F6]/95 backdrop-blur-md border-b border-[#EEDCDD] transition-all">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#231A1B] hover:text-[#C5A059] transition-colors focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              type="button"
              id="mobile-search-toggle-button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#231A1B] hover:text-[#C5A059] transition-colors"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo / Typography using new BrandLogo Component */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button
              onClick={() => onSelectCategory('todas')}
              className="group inline-flex items-center text-left focus:outline-none"
            >
              <BrandLogo size="sm" showText={true} />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <input
                id="desktop-search-input"
                type="text"
                placeholder="Buscar vestidos, conjuntos, linho..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#F5EEEE] text-[#231A1B] text-xs placeholder-[#9C8A8D] pl-9 pr-4 py-2.5 rounded-full border border-transparent focus:border-[#C5A059] focus:bg-white focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#9C8A8D] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C8A8D] hover:text-[#231A1B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Account Button */}
            <button
              type="button"
              id="navbar-customer-button"
              onClick={onOpenCustomerAuth}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                currentUser
                  ? 'bg-[#FDF0F1] text-[#936F33] border-[#E8C5C8] hover:bg-[#FBE4E6]'
                  : 'text-[#6A5A5D] hover:text-[#231A1B] hover:bg-[#F5EEEE] border-[#EEDCDD]'
              }`}
              title={currentUser ? `Conectada como ${currentUser.name}` : 'Acessar ou Criar Minha Conta'}
            >
              <User className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden sm:inline">
                {currentUser ? `Olá, ${currentUser.name.split(' ')[0]}` : 'Minha Conta'}
              </span>
            </button>

            {/* Admin Portal Button */}
            <button
              type="button"
              id="admin-access-button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6A5A5D] hover:text-[#231A1B] hover:bg-[#F5EEEE] rounded-full transition-colors border border-[#EEDCDD]"
              title="Área da Dona / Administradora"
            >
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden md:inline">Painel da Dona</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              id="navbar-cart-button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-[#231A1B] text-white hover:bg-[#382B2D] rounded-full transition-all shadow-sm focus:outline-none"
              aria-label="Abrir sacola de compras"
            >
              <ShoppingBag className="w-4 h-4 text-[#E6C687]" />
              <span className="text-xs font-medium tracking-wide hidden sm:inline">Sacola</span>
              <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white text-[11px] font-bold h-5 min-w-[20px] px-1.5 rounded-full shadow-xs">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Expandable) */}
        {searchOpen && (
          <div className="lg:hidden pb-4 pt-1">
            <div className="relative w-full">
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Buscar roupas, categorias..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full bg-[#F5EEEE] text-[#231A1B] text-sm placeholder-[#9C8A8D] pl-9 pr-4 py-2.5 rounded-full border border-[#C5A059] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#9C8A8D] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-center space-x-1 py-3 border-t border-[#EEDCDD] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory('todas')}
            className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] font-medium rounded-full transition-all whitespace-nowrap ${
              selectedCategory === 'todas'
                ? 'bg-[#231A1B] text-white font-semibold shadow-xs'
                : 'text-[#6A5A5D] hover:text-[#231A1B] hover:bg-[#F5EEEE]'
            }`}
          >
            Todas as Peças
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 py-1.5 text-xs uppercase tracking-[0.15em] font-medium rounded-full transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-[#231A1B] text-white font-semibold shadow-xs'
                  : 'text-[#6A5A5D] hover:text-[#231A1B] hover:bg-[#F5EEEE]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#faf8f5] border-b border-[#e0d8cc] px-4 pt-2 pb-6 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#8c827a] px-3 pt-2">
            Categorias
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('todas');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 text-xs uppercase tracking-wider rounded-lg text-left transition-colors ${
                selectedCategory === 'todas'
                  ? 'bg-[#1c1917] text-white font-semibold'
                  : 'bg-[#f0ebe1] text-[#3d3630]'
              }`}
            >
              Todas as Peças
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs uppercase tracking-wider rounded-lg text-left transition-colors truncate ${
                  selectedCategory === cat.slug
                    ? 'bg-[#1c1917] text-white font-semibold'
                    : 'bg-[#f0ebe1] text-[#3d3630]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#e8e2d8] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenCustomerAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#1c1917] bg-[#f4ede2] border border-[#dfcfb9] rounded-lg"
            >
              <User className="w-4 h-4 text-[#c5a059]" />
              {currentUser ? `Minha Conta (${currentUser.name})` : 'Entrar / Criar Conta de Cliente'}
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-[#242120] bg-[#ede7dd] rounded-lg"
            >
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              Acessar Painel da Dona (Cadastrar Peças)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
