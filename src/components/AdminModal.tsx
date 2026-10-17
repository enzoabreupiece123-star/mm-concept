import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Trash2, Edit3, ShieldCheck, Database, Key, Sparkles, Check,
  AlertCircle, Image as ImageIcon, Save, ArrowLeft, RefreshCw, HelpCircle, Eye,
  EyeOff, Lock, AlertTriangle, Camera, UploadCloud, Loader2, Star, Link as LinkIcon,
  Package, ShoppingBag, Palette, Copy, CheckCheck, UserCheck
} from 'lucide-react';
import { Product, Category, StoreSettings, Order, OrderStatus } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  testSupabaseConnection,
  saveSupabaseConfig,
  upsertRemoteProduct,
  deleteRemoteProduct,
  uploadProductImage,
  fetchRemoteSettings,
  upsertRemoteSettings,
} from '../lib/supabase';
import { compressImage } from '../lib/imageCompressor';
import { AdminOrdersView } from './AdminOrdersView';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  orders: Order[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onConfirmOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, restoreStock?: boolean) => void;
  onDeleteOrder: (orderId: string) => void;
  onQuickAdjustStock: (productId: string, delta: number) => void;
  onOpenGuide: () => void;
  isSupabaseConnected: boolean;
  onRefreshData: () => void;
}

const PRESET_FASHION_IMAGES = [
  { label: 'Vestido Linho Terracota', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Conjunto Colete Areia', url: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Blazer Alfaiataria Camel', url: 'https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Camisa Seda Off-White', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Pantalona Alfaiataria', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Vestido Transpasse Preto', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80' },
];

const PRESET_FOUNDER_HERO_IMAGES = [
  { label: 'Mariane Editorial Noir Glamour', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85' },
  { label: 'Mariane Alfaiataria & Poder', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1920&q=85' },
  { label: 'Mariane Studio Minimalista', url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1920&q=85' },
  { label: 'Mariane Terracota Sofisticada', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1920&q=85' },
];

const STANDARD_SIZES = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44', 'Único'];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  settings,
  orders,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory,
  onSaveSettings,
  onConfirmOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onQuickAdjustStock,
  onOpenGuide,
  isSupabaseConnected,
  onRefreshData,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'form' | 'categories' | 'appearance' | 'settings' | 'supabase'>('orders');

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Vestidos');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(5);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formDetailsText, setFormDetailsText] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['P', 'M', 'G']);
  const [formColorsText, setFormColorsText] = useState('Terracota, Off-White, Preto');
  const [formInStock, setFormInStock] = useState(true);
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');

  // Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [appearanceSavedToast, setAppearanceSavedToast] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Sync settings when prop updates
  useEffect(() => {
    setStoreSettings(settings);
  }, [settings]);

  // Login PIN visibility
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase test state
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Handle PIN Login state (queries Supabase directly for instant multi-device synchronization)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinInput.trim();
    if (!entered) return;

    setIsVerifyingPin(true);
    setPinError(false);

    try {
      // 1. Try real-time check against Supabase
      const remote = await fetchRemoteSettings();
      if (remote && remote.adminPin) {
        const remotePin = remote.adminPin.trim();
        if (entered === remotePin) {
          setIsAuthenticated(true);
          setPinError(false);
          setPinInput('');
          setIsVerifyingPin(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Real-time remote PIN verification error:', err);
    }

    // 2. Fallback check against local state
    const activePin = (settings.adminPin || '1234').trim();
    if (entered === activePin) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
    setIsVerifyingPin(false);
  };

  // Dedicated Password Change Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 4) {
      setPasswordChangeStatus({
        type: 'error',
        text: 'A nova senha deve ter no mínimo 4 caracteres.',
      });
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordChangeStatus({
        type: 'error',
        text: 'A confirmação de senha não coincide com a nova senha digitada.',
      });
      return;
    }

    const updated = {
      ...storeSettings,
      adminPin: newPassword.trim(),
    };
    setStoreSettings(updated);
    onSaveSettings(updated);

    // Save directly to Supabase cloud database
    await upsertRemoteSettings(updated);

    setNewPassword('');
    setConfirmPassword('');
    setPasswordChangeStatus({
      type: 'success',
      text: '✅ Senha atualizada e salva no banco de dados! O PIN antigo foi desativado em todos os aparelhos.',
    });
    setTimeout(() => setPasswordChangeStatus(null), 5000);
  };

  // Handle Files Uploaded from Device (Camera, Gallery, Drag-and-Drop)
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploadingImage(true);
    setUploadProgressMsg(`Processando ${fileArray.length} foto(s)...`);

    const newUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        setUploadProgressMsg(`Otimizando foto ${i + 1} de ${fileArray.length}...`);
        const compressed = await compressImage(file, 1200, 1200, 0.85);

        // Try Supabase Storage if connected
        if (isSupabaseConnected) {
          setUploadProgressMsg(`Enviando foto ${i + 1} para o Supabase...`);
          const remoteUrl = await uploadProductImage(compressed.blob, compressed.name);
          if (remoteUrl) {
            newUrls.push(remoteUrl);
            continue;
          }
        }

        // Fallback / immediate local storage: use compressed high-quality dataUrl
        newUrls.push(compressed.dataUrl);
      } catch (err) {
        console.warn('Erro ao processar imagem:', err);
      }
    }

    setFormImages((prev) => [...prev, ...newUrls]);
    setIsUploadingImage(false);
    setUploadProgressMsg(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Open Form for New Product
  const handleStartNewProduct = () => {
    setEditingProductId(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Vestidos');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStockQuantity(5);
    setFormImages(['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80']);
    setFormDescription('Peça selecionada com caimento fluido, elegância e acabamento sofisticado.');
    setFormDetailsText('Toque suave e modelagem impecável\nForro interno confortável\nExcelente acabamento');
    setFormSizes(['P', 'M', 'G']);
    setFormColorsText('Areia, Terracota, Preto');
    setFormInStock(true);
    setFormIsNew(true);
    setFormIsFeatured(false);
    setActiveTab('form');
  };

  // Open Form for Editing Existing Product
  const handleStartEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(String(prod.price));
    setFormOriginalPrice(prod.original_price ? String(prod.original_price) : '');
    setFormStockQuantity(prod.stock_quantity !== undefined ? prod.stock_quantity : (prod.in_stock ? 5 : 0));
    setFormImages(prod.images && prod.images.length > 0 ? prod.images : []);
    setFormDescription(prod.description);
    setFormDetailsText(prod.details ? prod.details.join('\n') : '');
    setFormSizes(prod.sizes || ['P', 'M', 'G']);
    setFormColorsText(prod.colors ? prod.colors.join(', ') : '');
    setFormInStock(prod.in_stock);
    setFormIsNew(prod.is_new ?? false);
    setFormIsFeatured(prod.is_featured ?? false);
    setActiveTab('form');
  };

  // Save Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor, informe um preço válido.');
      return;
    }

    const origPriceNum = formOriginalPrice.trim() ? parseFloat(formOriginalPrice.replace(',', '.')) : null;

    if (formImages.length === 0) {
      alert('Por favor, adicione pelo menos uma foto para a roupa do seu celular, computador ou link.');
      return;
    }

    const details = formDetailsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const colors = formColorsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const stockNum = Math.max(0, parseInt(String(formStockQuantity), 10) || 0);
    const inStockComputed = formInStock && stockNum > 0;

    const newProduct: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      price: priceNum,
      original_price: origPriceNum,
      stock_quantity: stockNum,
      images: formImages,
      description: formDescription.trim(),
      details,
      sizes: formSizes.length > 0 ? formSizes : ['Único'],
      colors,
      in_stock: inStockComputed,
      is_new: formIsNew,
      is_featured: formIsFeatured,
      created_at: new Date().toISOString(),
    };

    onSaveProduct(newProduct);
    setActiveTab('products');
  };


  // Toggle Size in Form
  const toggleSize = (size: string) => {
    if (formSizes.includes(size)) {
      setFormSizes(formSizes.filter((s) => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDescription.trim(),
    };

    onSaveCategory(newCat);
    setNewCatName('');
    setNewCatDescription('');
  };

  // Save Settings
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(storeSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  // Test Supabase
  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(storeSettings.supabaseUrl, storeSettings.supabaseAnonKey);
    setTestResult(res);
    setIsTesting(false);
    if (res.success) {
      saveSupabaseConfig(storeSettings.supabaseUrl, storeSettings.supabaseAnonKey);
      onRefreshData();
    }
  };

  return (
    <div
      id="admin-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="admin-modal-container"
        className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e8dfd2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#1c1917] text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#c5a059]/20 text-[#e6c687]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                Painel da Dona | MM Concept
              </h2>
              <p className="text-[11px] text-stone-400">
                Gerencie catálogo de roupas, preços, categorias, chave PIX e conexão Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-stone-400 hover:text-white px-2.5 py-1 rounded border border-stone-700 hover:bg-stone-800 transition-colors"
              >
                Bloquear
              </button>
            )}
            <button
              type="button"
              id="close-admin-modal-button"
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PIN Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#faf5ec] flex items-center justify-center text-[#8e6e34] border border-[#e8dfd2]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="font-serif text-2xl font-medium text-[#1c1917]">
                Acesso Exclusivo da Administradora
              </h3>
              <p className="text-xs text-[#786e64] leading-relaxed">
                Área restrita à dona da loja. Digite sua senha ou PIN de segurança para gerenciar as roupas, preços e pedidos.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  id="admin-pin-input"
                  type={showLoginPin ? 'text' : 'password'}
                  maxLength={30}
                  autoFocus
                  placeholder="Digite sua senha ou PIN..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full text-center tracking-[0.2em] font-mono text-base py-3 px-10 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPin(!showLoginPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  tabIndex={-1}
                  aria-label={showLoginPin ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <div className="text-xs text-red-600 font-medium bg-red-50 py-2 px-3 rounded-lg border border-red-200">
                  Senha incorreta. Verifique os caracteres e tente novamente.
                </div>
              )}

              <button
                type="submit"
                id="admin-login-submit-button"
                disabled={isVerifyingPin}
                className="w-full py-3 bg-[#1c1917] hover:bg-[#322c29] disabled:opacity-70 text-white rounded-xl text-xs uppercase tracking-[0.15em] font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isVerifyingPin ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#e6c687]" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Acessar Painel</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Security Warning Banner if PIN is still default */}
            {(!settings.adminPin || settings.adminPin === '1234') && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Atenção de Segurança:</strong> Sua loja ainda está com a senha padrão inicial (1234). Altere agora para uma senha pessoal para que ninguém mais consiga acessar!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shrink-0 transition-colors text-[11px]"
                >
                  Trocar Senha Agora
                </button>
              </div>
            )}

            {/* Nav Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 bg-[#faf8f5] border-b border-[#e8dfd2] overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-[#8e6e34]" />
                Pedidos ({orders.length})
                {orders.filter((o) => o.status === 'pending').length > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                    {orders.filter((o) => o.status === 'pending').length} novos
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                Catálogo ({products.length} peças)
              </button>

              <button
                type="button"
                onClick={handleStartNewProduct}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#8e6e34] hover:text-[#1c1917]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {editingProductId ? 'Editar Peça' : 'Postar Nova Peça'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                Categorias ({categories.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'appearance'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#8e6e34]" />
                Visual & Dona (Karine Moser)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                WhatsApp & PIX
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`py-3 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'supabase'
                    ? 'border-[#1c1917] text-[#1c1917]'
                    : 'border-transparent text-[#786e64] hover:text-[#1c1917]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#8e6e34]" />
                Supabase & Render
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {/* TAB 0: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <AdminOrdersView
                  orders={orders}
                  products={products}
                  onConfirmOrder={onConfirmOrder}
                  onUpdateOrderStatus={onUpdateOrderStatus}
                  onDeleteOrder={onDeleteOrder}
                  onRefreshData={onRefreshData}
                />
              )}

              {/* TAB 1: PRODUCTS LIST */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                        Roupas da Coleção
                      </h3>
                      <p className="text-xs text-[#786e64]">
                        Gerencie preços, fotos, estoque e disponibilidade imediata.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onRefreshData}
                        className="px-3 py-2 text-xs text-[#5c544c] hover:text-[#1c1917] border border-[#d5cbbe] rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Atualizar
                      </button>
                      <button
                        type="button"
                        id="admin-add-product-button"
                        onClick={handleStartNewProduct}
                        className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" /> Postar Nova Peça
                      </button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="border border-[#e8dfd2] rounded-xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-[#e8dfd2]">
                      {products.map((prod) => {
                        const stock = prod.stock_quantity !== undefined ? prod.stock_quantity : (prod.in_stock ? 5 : 0);
                        const isZeroStock = stock <= 0 || !prod.in_stock;
                        const isLowStock = !isZeroStock && stock <= 3;

                        return (
                          <div
                            key={prod.id}
                            className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#fcfaf7] transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={prod.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80'}
                                alt={prod.name}
                                className="w-12 h-16 object-cover rounded-lg bg-[#f0ebe1] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8e6e34]">
                                  {prod.category}
                                </span>
                                <h4 className="text-xs sm:text-sm font-semibold text-[#1c1917] truncate">
                                  {prod.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-[#1c1917]">
                                    {formatCurrency(prod.price)}
                                  </span>
                                  {prod.original_price && (
                                    <span className="text-[11px] text-[#9c9389] line-through">
                                      {formatCurrency(prod.original_price)}
                                    </span>
                                  )}

                                  {/* Stock Badge */}
                                  {isZeroStock ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                      Esgotado (0 un.)
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                      Restam {stock} un.!
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                      {stock} un. em estoque
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Quick Stock +/- Stepper */}
                              <div className="hidden sm:flex items-center rounded-lg border border-[#d5cbbe] bg-white p-0.5">
                                <button
                                  type="button"
                                  onClick={() => onQuickAdjustStock(prod.id, -1)}
                                  disabled={stock <= 0}
                                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#5c544c] hover:bg-[#f5efe6] rounded transition-colors disabled:opacity-30"
                                  title="Diminuir estoque (-1)"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-[#1c1917]" title="Unidades em estoque">
                                  {stock}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onQuickAdjustStock(prod.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#5c544c] hover:bg-[#f5efe6] rounded transition-colors"
                                  title="Aumentar estoque (+1)"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleStartEditProduct(prod)}
                                className="p-2 text-[#5c544c] hover:text-[#1c1917] hover:bg-[#f0ebe1] rounded-lg transition-colors border border-[#e8dfd2]"
                                title="Editar Roupa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Deseja realmente excluir "${prod.name}" do catálogo?`)) {
                                    onDeleteProduct(prod.id);
                                  }
                                }}
                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-[#e8dfd2]"
                                title="Excluir Roupa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT FORM */}
              {activeTab === 'form' && (
                <form onSubmit={handleSaveProductSubmit} className="space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd2]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('products')}
                        className="p-1 text-[#786e64] hover:text-[#1c1917]"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                        {editingProductId ? 'Editar Roupa' : 'Cadastrar Nova Roupa'}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Nome da Peça *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Vestido Midi Linho Riviera Terracota"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Preço à Vista no PIX (R$) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="349.90"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-semibold text-[#1c1917]"
                      />
                    </div>

                    {/* Original Price */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Preço Original / De (Opcional para Promoção)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 389.90"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8c8278]">
                        Se preenchido, exibirá etiqueta de desconto (ex: -15% OFF).
                      </span>
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Cores Disponíveis (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Terracota, Off-White, Preto"
                        value={formColorsText}
                        onChange={(e) => setFormColorsText(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Stock Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1 flex items-center justify-between">
                        <span>Estoque (Quantidade Disponível) *</span>
                        <span className="text-[10px] text-[#8e6e34] font-bold">
                          {formStockQuantity > 0 ? `${formStockQuantity} un.` : 'Sem Estoque'}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          required
                          value={formStockQuantity}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                            setFormStockQuantity(val);
                            if (val === 0) {
                              setFormInStock(false);
                            } else if (!formInStock) {
                              setFormInStock(true);
                            }
                          }}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-bold text-[#1c1917]"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const val = Math.max(0, formStockQuantity - 1);
                              setFormStockQuantity(val);
                              if (val === 0) setFormInStock(false);
                            }}
                            className="w-9 h-10 flex items-center justify-center bg-[#faf8f5] hover:bg-[#ede6dc] border border-[#d5cbbe] rounded-xl text-sm font-bold text-[#5c544c] transition-colors"
                            title="Diminuir 1 peça"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const val = formStockQuantity + 1;
                              setFormStockQuantity(val);
                              if (!formInStock) setFormInStock(true);
                            }}
                            className="w-9 h-10 flex items-center justify-center bg-[#faf8f5] hover:bg-[#ede6dc] border border-[#d5cbbe] rounded-xl text-sm font-bold text-[#5c544c] transition-colors"
                            title="Aumentar 1 peça"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#8c8278]">
                        Ao confirmar pedidos, essa quantidade diminui automaticamente. Se zerar, a roupa fica indisponível.
                      </span>
                    </div>

                    {/* Sizes Selection */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-semibold text-[#5c544c]">
                        Tamanhos Disponíveis (Clique para ativar/desativar):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {STANDARD_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              formSizes.includes(size)
                                ? 'bg-[#1c1917] text-white border-[#1c1917]'
                                : 'bg-white text-[#786e64] border-[#d5cbbe] hover:border-[#1c1917]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Photos from Device (Camera / Gallery / Drag & Drop) */}
                    <div className="sm:col-span-2 space-y-3 p-4 bg-[#faf8f5] rounded-2xl border border-[#e8dfd2]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#1c1917] flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#8e6e34]" />
                            Fotos da Roupa *
                          </label>
                          <p className="text-[11px] text-[#786e64]">
                            Envie fotos direto do seu celular ou computador. A 1ª foto é a capa da peça.
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#8e6e34] bg-white px-3 py-1 rounded-full border border-[#e8dfd2] w-fit">
                          {formImages.length} {formImages.length === 1 ? 'foto' : 'fotos'} adicionada(s)
                        </span>
                      </div>

                      {/* Hidden File Input for Device Upload */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFilesSelected(e.target.files);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />

                      {/* Drag & Drop / Click Upload Box */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-6 sm:p-7 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 ${
                          isDragging
                            ? 'border-[#8e6e34] bg-[#faf5ec] scale-[1.01]'
                            : 'border-[#d5cbbe] hover:border-[#8e6e34] bg-white hover:bg-[#fcfaf7]'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#faf5ec] flex items-center justify-center text-[#8e6e34] border border-[#e8dfd2] shadow-xs">
                          {isUploadingImage ? (
                            <Loader2 className="w-6 h-6 animate-spin text-[#8e6e34]" />
                          ) : (
                            <UploadCloud className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-[#1c1917]">
                            {isUploadingImage
                              ? uploadProgressMsg || 'Processando fotos do dispositivo...'
                              : 'Clique para escolher fotos do seu celular ou computador'}
                          </p>
                          <p className="text-[11px] text-[#786e64] mt-0.5">
                            Ou arraste e solte arquivos aqui • Câmera, galeria ou arquivos (PNG, JPG, WEBP)
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isUploadingImage}
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-1.5 mt-1"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#e6c687]" />
                          Selecionar Fotos do Dispositivo
                        </button>
                      </div>

                      {/* Visual Gallery with Badges & Actions */}
                      {formImages.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-[11px] font-semibold text-[#5c544c] uppercase tracking-wider">
                            Fotos desta peça ({formImages.length}):
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {formImages.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-[#e8dfd2] shadow-xs"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Foto ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />

                                {/* Badge: Cover or #Number */}
                                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                  {idx === 0 ? (
                                    <span className="px-2 py-0.5 rounded-md bg-[#1c1917]/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                                      <Star className="w-3 h-3 text-[#e6c687] fill-current" /> Capa
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium shadow-sm">
                                      #{idx + 1}
                                    </span>
                                  )}
                                </div>

                                {/* Action Buttons Overlay */}
                                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFormImages(formImages.filter((_, i) => i !== idx));
                                      }}
                                      title="Remover foto"
                                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Move this image to index 0 (Cover)
                                        setFormImages([formImages[idx], ...formImages.filter((_, i) => i !== idx)]);
                                      }}
                                      className="w-full py-1.5 bg-white/95 hover:bg-white text-[#1c1917] text-[10px] font-semibold rounded-lg shadow-sm transition-colors text-center"
                                    >
                                      Tornar Foto de Capa
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Optional Link / Presets Accordion */}
                      <div className="pt-2 border-t border-[#e8dfd2]">
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-xs text-[#8e6e34] hover:underline flex items-center gap-1.5 font-medium"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          {showUrlInput ? 'Ocultar opção de links da internet' : 'Ou colar link de imagem da internet'}
                        </button>

                        {showUrlInput && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-[#d5cbbe] space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="Cole a URL da foto (https://...)"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="flex-1 text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-lg focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (urlInput.trim()) {
                                    setFormImages([...formImages, urlInput.trim()]);
                                    setUrlInput('');
                                  }
                                }}
                                className="px-3.5 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                              >
                                Adicionar
                              </button>
                            </div>

                            {/* Preset quick buttons */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                              <span className="text-[10px] text-[#8c8278] uppercase shrink-0">Fotos prontas:</span>
                              {PRESET_FASHION_IMAGES.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    if (!formImages.includes(preset.url)) {
                                      setFormImages((prev) => [...prev, preset.url]);
                                    }
                                  }}
                                  className="px-2 py-1 text-[10px] bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#4d443c] rounded border border-[#d5cbbe] shrink-0"
                                >
                                  + {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Descrição da Roupa
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Descreva a elegância, caimento e proposta do look..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Details / Composition */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Detalhes & Composição do Tecido (um por linha)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Composição: 70% Linho, 30% Viscose&#10;Forro acetinado&#10;Bolsos laterais"
                        value={formDetailsText}
                        onChange={(e) => setFormDetailsText(e.target.value)}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="sm:col-span-2 grid grid-cols-3 gap-3 p-3 bg-[#faf8f5] rounded-xl border border-[#e8dfd2]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1917]">
                        <input
                          type="checkbox"
                          checked={formInStock}
                          onChange={(e) => setFormInStock(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#8e6e34]"
                        />
                        <span>Em Estoque</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1917]">
                        <input
                          type="checkbox"
                          checked={formIsNew}
                          onChange={(e) => setFormIsNew(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#8e6e34]"
                        />
                        <span>Tag 'Novidade'</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1c1917]">
                        <input
                          type="checkbox"
                          checked={formIsFeatured}
                          onChange={(e) => setFormIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#8e6e34]"
                        />
                        <span>Destaque na Home</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8dfd2]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="px-5 py-2.5 text-xs text-[#5c544c] hover:text-[#1c1917] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      id="save-product-submit-button"
                      className="px-6 py-2.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4 text-[#e6c687]" />
                      Salvar Roupa no Catálogo
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                      Categorias da Loja
                    </h3>
                    <p className="text-xs text-[#786e64]">
                      Crie seções como Vestidos, Alfaiataria, Conjuntos, Lançamentos, etc.
                    </p>
                  </div>

                  {/* Add Category Form */}
                  <form onSubmit={handleAddCategory} className="p-4 bg-[#faf8f5] rounded-xl border border-[#e8dfd2] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                      Criar Nova Categoria
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nome da categoria (ex: Moda Praia)"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Breve descrição..."
                        value={newCatDescription}
                        onChange={(e) => setNewCatDescription(e.target.value)}
                        className="text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Categoria
                    </button>
                  </form>

                  {/* Existing Categories List */}
                  <div className="divide-y divide-[#e8dfd2] border border-[#e8dfd2] rounded-xl overflow-hidden">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-[#faf8f5]">
                        <div>
                          <div className="text-xs font-bold text-[#1c1917]">{cat.name}</div>
                          <div className="text-[11px] text-[#786e64]">{cat.description || `Slug: ${cat.slug}`}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: VISUAL & DONA (KARINE MOSER STYLE) */}
              {activeTab === 'appearance' && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8dfd2]">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1c1917] flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[#8e6e34]" />
                        Visual da Loja & Foto da Dona (Estilo Karine Moser)
                      </h3>
                      <p className="text-xs text-[#786e64]">
                        Personalize a foto de fundo no início do site, textos do topo, anúncios e a história da Mariane.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        onSaveSettings(storeSettings);
                        await upsertRemoteSettings(storeSettings);
                        setAppearanceSavedToast(true);
                        setTimeout(() => setAppearanceSavedToast(false), 3000);
                      }}
                      className="px-5 py-2.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Save className="w-4 h-4 text-[#e6c687]" />
                      Salvar Alterações
                    </button>
                  </div>

                  {appearanceSavedToast && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Visual da loja atualizado e salvo com sucesso!
                    </div>
                  )}

                  {/* 1. HERO BANNER COM FOTO DA DONA AO FUNDO */}
                  <div className="p-5 sm:p-6 bg-white border border-[#e8dfd2] rounded-2xl space-y-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#8e6e34] font-serif font-bold text-xs">
                          1
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#1c1917]">
                            Foto da Dona ao Fundo (Início do Site)
                          </h4>
                          <p className="text-[11px] text-[#786e64]">
                            Esta foto fica no fundo do topo da loja, trazendo autoridade e elegância à marca.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#c5a059]/15 text-[#8e6e34] px-2.5 py-1 rounded-full border border-[#c5a059]/30">
                        Início do Site
                      </span>
                    </div>

                    {/* Live Preview Card */}
                    <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#d5cbbe] shadow-inner group">
                      <img
                        src={
                          storeSettings.heroImageUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85'
                        }
                        alt="Prévia da Dona"
                        className="w-full h-full object-cover object-top"
                      />
                      <div
                        className={`absolute inset-0 ${
                          storeSettings.heroOverlayStyle === 'champagne'
                            ? 'bg-gradient-to-r from-[#faf6f0]/95 via-[#faf6f0]/70 to-transparent'
                            : 'bg-gradient-to-r from-[#12100e]/95 via-[#1a1715]/75 to-transparent'
                        }`}
                      />
                      <div className="absolute inset-0 p-5 flex flex-col justify-center max-w-md pointer-events-none">
                        {storeSettings.heroBadge ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e6c687] bg-black/40 px-2 py-0.5 rounded w-fit backdrop-blur-xs">
                            {storeSettings.heroBadge}
                          </span>
                        ) : null}
                        <h4
                          className={`font-serif text-lg sm:text-xl font-normal mt-1 leading-snug ${
                            storeSettings.heroOverlayStyle === 'champagne'
                              ? 'text-[#1c1917]'
                              : 'text-white'
                          }`}
                        >
                          {storeSettings.heroTitle || 'MM Concept'}
                        </h4>
                        {storeSettings.heroSubtitle ? (
                          <p
                            className={`text-[11px] line-clamp-2 mt-1 ${
                              storeSettings.heroOverlayStyle === 'champagne'
                                ? 'text-[#524b43]'
                                : 'text-stone-300'
                            }`}
                          >
                            {storeSettings.heroSubtitle}
                          </p>
                        ) : null}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded">
                        Prévia em Tempo Real
                      </div>
                    </div>

                    {/* Presets de Fotos Elegantes da Dona */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-2">
                        Escolher Fotos Elegantes Pré-definidas (ou use a sua própria foto abaixo):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_FOUNDER_HERO_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setStoreSettings({ ...storeSettings, heroImageUrl: preset.url })
                            }
                            className={`p-1.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                              storeSettings.heroImageUrl === preset.url
                                ? 'border-[#8e6e34] bg-[#faf5ec] ring-2 ring-[#c5a059]'
                                : 'border-[#e0d7cb] hover:border-[#8e6e34] bg-stone-50'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-16 object-cover object-top rounded-lg"
                            />
                            <span className="text-[10px] font-medium text-[#1c1917] truncate">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload da Foto da Dona do Celular / Computador */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#5c544c]">
                        Carregar Foto da Dona do seu Celular ou Computador:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <label className="cursor-pointer px-4 py-2.5 bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#1c1917] text-xs font-semibold rounded-xl border border-[#d5cbbe] flex items-center justify-center gap-2 transition-all">
                          {isUploadingHero ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#8e6e34]" />
                              <span>Processando Foto...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-[#8e6e34]" />
                              <span>Escolher Foto do Aparelho</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingHero}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingHero(true);
                              try {
                                const comp = await compressImage(file, 1920, 1920, 0.88);
                                let finalUrl = comp.dataUrl;
                                if (isSupabaseConnected) {
                                  const remote = await uploadProductImage(
                                    comp.blob,
                                    `hero-dona-${Date.now()}.jpg`
                                  );
                                  if (remote) finalUrl = remote;
                                }
                                setStoreSettings((prev) => ({ ...prev, heroImageUrl: finalUrl }));
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsUploadingHero(false);
                              }
                            }}
                          />
                        </label>

                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Ou cole a URL da imagem aqui (https://...)"
                            value={storeSettings.heroImageUrl || ''}
                            onChange={(e) =>
                              setStoreSettings({ ...storeSettings, heroImageUrl: e.target.value })
                            }
                            className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Estilo do Overlay (Tema) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Estilo de Iluminação do Topo (Overlay):
                        </label>
                        <select
                          value={storeSettings.heroOverlayStyle || 'dark'}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              heroOverlayStyle: e.target.value as any,
                            })
                          }
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        >
                          <option value="dark">Escuro Luxo Noir com Dourado (Padrão Karine Moser)</option>
                          <option value="champagne">Champagne Suave Editorial (Claro)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <label className="flex items-center gap-2 text-xs text-[#242120] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={storeSettings.heroShowOwnerCard !== false}
                            onChange={(e) =>
                              setStoreSettings({
                                ...storeSettings,
                                heroShowOwnerCard: e.target.checked,
                              })
                            }
                            className="rounded border-[#d5cbbe] text-[#8e6e34] focus:ring-[#8e6e34] w-4 h-4"
                          />
                          <span className="font-medium">
                            Exibir selo flutuante de autoridade da Mariane no canto da foto
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 2. TEXTOS E CHAMADAS DO HERO */}
                  <div className="p-5 sm:p-6 bg-white border border-[#e8dfd2] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#f0ebe1]">
                      <span className="w-7 h-7 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#8e6e34] font-serif font-bold text-xs">
                        2
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#1c1917]">
                          Frases & Botões do Início do Site
                        </h4>
                        <p className="text-[11px] text-[#786e64]">
                          Textos persuasivos que aparecem logo abaixo ou acima da foto de fundo.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Selo Superior (Eyebrow):
                        </label>
                        <input
                          type="text"
                          value={storeSettings.heroBadge || ''}
                          onChange={(e) =>
                            setStoreSettings({ ...storeSettings, heroBadge: e.target.value })
                          }
                          placeholder="Selo opcional (ex: Nova Seleção, Tendência)"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Título Principal:
                        </label>
                        <input
                          type="text"
                          value={storeSettings.heroTitle || ''}
                          onChange={(e) =>
                            setStoreSettings({ ...storeSettings, heroTitle: e.target.value })
                          }
                          placeholder="MM Concept"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-serif text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Subtítulo / Mensagem da Coleção:
                      </label>
                      <textarea
                        rows={2}
                        value={storeSettings.heroSubtitle || ''}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, heroSubtitle: e.target.value })
                        }
                        placeholder="Subtítulo ou mensagem da coleção (opcional)..."
                        className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Texto do Botão 1 (Catálogo):
                        </label>
                        <input
                          type="text"
                          value={storeSettings.heroCtaText || ''}
                          onChange={(e) =>
                            setStoreSettings({ ...storeSettings, heroCtaText: e.target.value })
                          }
                          placeholder="Explorar Coleção"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Texto do Botão 2 (WhatsApp da Mariane):
                        </label>
                        <input
                          type="text"
                          value={storeSettings.heroSecondaryCtaText || ''}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              heroSecondaryCtaText: e.target.value,
                            })
                          }
                          placeholder="Atendimento com a Mariane"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. TARJA DE AVISOS NO TOPO (TICKER) */}
                  <div className="p-5 sm:p-6 bg-white border border-[#e8dfd2] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#8e6e34] font-serif font-bold text-xs">
                          3
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#1c1917]">
                            Tarja de Destaques Superior (Topo do Site)
                          </h4>
                          <p className="text-[11px] text-[#786e64]">
                            Barra elegante de avisos no topo com promoções, parcelamento e frete.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-[#242120] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={storeSettings.showAnnouncement !== false}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              showAnnouncement: e.target.checked,
                            })
                          }
                          className="rounded border-[#d5cbbe] text-[#8e6e34] focus:ring-[#8e6e34] w-4 h-4"
                        />
                        <span className="font-semibold text-xs">Ativar Tarja</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Texto da Tarja Superior:
                      </label>
                      <input
                        type="text"
                        value={storeSettings.announcementText || ''}
                        onChange={(e) =>
                          setStoreSettings({ ...storeSettings, announcementText: e.target.value })
                        }
                        placeholder="Mensagem da barra de avisos (opcional)..."
                        className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* 4. SEÇÃO "SOBRE A DONA" (A ESSÊNCIA DA MARCA) */}
                  <div className="p-5 sm:p-6 bg-white border border-[#e8dfd2] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0ebe1]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#8e6e34] font-serif font-bold text-xs">
                          4
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#1c1917]">
                            Seção "Sobre a Dona" (A Essência da Marca)
                          </h4>
                          <p className="text-[11px] text-[#786e64]">
                            Seção editorial onde Mariane conta a inspiração e o propósito das peças.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-[#242120] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={storeSettings.aboutFounderEnabled !== false}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              aboutFounderEnabled: e.target.checked,
                            })
                          }
                          className="rounded border-[#d5cbbe] text-[#8e6e34] focus:ring-[#8e6e34] w-4 h-4"
                        />
                        <span className="font-semibold text-xs">Exibir na Home</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Título da Seção:
                        </label>
                        <input
                          type="text"
                          value={storeSettings.aboutFounderTitle || ''}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              aboutFounderTitle: e.target.value,
                            })
                          }
                          placeholder="A Essência da Marca"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-serif text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Subtítulo Inspirador:
                        </label>
                        <input
                          type="text"
                          value={storeSettings.aboutFounderSubtitle || ''}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              aboutFounderSubtitle: e.target.value,
                            })
                          }
                          placeholder="Vista-se de confiança. Seja você sempre..."
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Foto da Fundadora na História */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Foto da Dona para a Seção de História:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <label className="cursor-pointer px-4 py-2.5 bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#1c1917] text-xs font-semibold rounded-xl border border-[#d5cbbe] flex items-center justify-center gap-2 shrink-0">
                          {isUploadingAbout ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#8e6e34]" />
                          ) : (
                            <Camera className="w-4 h-4 text-[#8e6e34]" />
                          )}
                          <span>Trocar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingAbout}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingAbout(true);
                              try {
                                const comp = await compressImage(file, 1200, 1200, 0.88);
                                let finalUrl = comp.dataUrl;
                                if (isSupabaseConnected) {
                                  const remote = await uploadProductImage(
                                    comp.blob,
                                    `about-dona-${Date.now()}.jpg`
                                  );
                                  if (remote) finalUrl = remote;
                                }
                                setStoreSettings((prev) => ({
                                  ...prev,
                                  aboutFounderImage: finalUrl,
                                }));
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsUploadingAbout(false);
                              }
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          value={storeSettings.aboutFounderImage || ''}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              aboutFounderImage: e.target.value,
                            })
                          }
                          placeholder="URL da foto..."
                          className="flex-1 text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        História e Filosofia da Marca:
                      </label>
                      <textarea
                        rows={4}
                        value={storeSettings.aboutFounderStory || ''}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            aboutFounderStory: e.target.value,
                          })
                        }
                        placeholder="Conte como a marca nasceu, a curadoria de peças selecionadas pela fundadora e o envio 100% online..."
                        className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Frase de Efeito / Citação da Mariane:
                        </label>
                        <input
                          type="text"
                          value={storeSettings.aboutFounderQuote || ''}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              aboutFounderQuote: e.target.value,
                            })
                          }
                          placeholder="“A verdadeira sofisticação reside na força silenciosa...”"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Nome da Assinatura:
                        </label>
                        <input
                          type="text"
                          value={storeSettings.aboutFounderSignature || ''}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              aboutFounderSignature: e.target.value,
                            })
                          }
                          placeholder="Mariane Moreira"
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-serif text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. CONDIÇÕES COMERCIAIS */}
                  <div className="p-5 sm:p-6 bg-white border border-[#e8dfd2] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#f0ebe1]">
                      <span className="w-7 h-7 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#8e6e34] font-serif font-bold text-xs">
                        5
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#1c1917]">
                          Condições Comerciais Exclusivas (Exibição nos Cards)
                        </h4>
                        <p className="text-[11px] text-[#786e64]">
                          Defina a quantidade de parcelas e o desconto do pagamento à vista via PIX.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Parcelamento Máximo (ex: 6x sem juros):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={storeSettings.installmentMax || 6}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              installmentMax: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Desconto à Vista no PIX (%):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={storeSettings.pixDiscountPercent || 5}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              pixDiscountPercent: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs p-2.5 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botão Final de Salvar */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={async () => {
                        onSaveSettings(storeSettings);
                        await upsertRemoteSettings(storeSettings);
                        setAppearanceSavedToast(true);
                        setTimeout(() => setAppearanceSavedToast(false), 3000);
                      }}
                      className="px-8 py-3.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
                    >
                      <Save className="w-4 h-4 text-[#e6c687]" />
                      Salvar Todas as Alterações do Visual
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1c1917]">
                      Configurações da Loja, WhatsApp e PIX
                    </h3>
                    <p className="text-xs text-[#786e64]">
                      Personalize para onde os pedidos serão enviados e a chave Pix que as clientes verão.
                    </p>
                  </div>

                  {settingsSavedToast && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Configurações salvas com sucesso!
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        WhatsApp da Loja (Número com DDD, ex: 5511999999999) *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeSettings.whatsapp}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp: e.target.value })}
                        className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Chave PIX da Loja *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeSettings.pixKey}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixKey: e.target.value })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Tipo de Chave PIX
                        </label>
                        <select
                          value={storeSettings.pixKeyType}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixKeyType: e.target.value as any })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        >
                          <option value="email">E-mail</option>
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="phone">Celular</option>
                          <option value="random">Chave Aleatória</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Nome do Titular da Conta PIX *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeSettings.pixBeneficiary}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixBeneficiary: e.target.value })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Cidade do Titular PIX
                        </label>
                        <input
                          type="text"
                          value={storeSettings.pixCity}
                          onChange={(e) => setStoreSettings({ ...storeSettings, pixCity: e.target.value })}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#e8dfd2]">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4 text-[#e6c687]" />
                      Salvar Dados da Loja e PIX
                    </button>
                  </div>
                </form>

                {/* DEDICATED PASSWORD / PIN SECURITY FORM */}
                <div className="p-6 bg-white border border-[#e8dfd2] rounded-2xl space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0ebe1]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#faf5ec] flex items-center justify-center text-[#8e6e34] border border-[#e8dfd2]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold text-[#1c1917]">
                          Segurança & Senha da Dona
                        </h4>
                        <p className="text-[11px] text-[#786e64]">
                          Crie uma senha pessoal exclusiva para que somente você tenha acesso ao painel.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full w-fit ${
                        !storeSettings.adminPin || storeSettings.adminPin === '1234'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {!storeSettings.adminPin || storeSettings.adminPin === '1234'
                        ? '⚠️ Senha Padrão (Altere Já)'
                        : '🔒 Senha Pessoal Protegida'}
                    </span>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Nova Senha ou PIN *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            placeholder="Mínimo 4 caracteres (números ou letras)..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full text-xs p-3 pr-10 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                            tabIndex={-1}
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                          Confirmar Nova Senha *
                        </label>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          placeholder="Repita a nova senha..."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full text-xs p-3 bg-[#faf8f5] border border-[#d5cbbe] rounded-xl focus:bg-white focus:border-[#8e6e34] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-[#786e64] bg-[#faf8f5] p-3 rounded-xl border border-[#e8dfd2] space-y-1">
                      <p className="font-semibold text-[#1c1917]">Como funciona a proteção:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Você pode usar números, letras ou símbolos (ex: <code>8392</code> ou <code>Mariane#2026</code>).</li>
                        <li>Assim que você clicar em <strong>"Atualizar Senha"</strong>, a senha antiga <strong>1234 deixa de funcionar imediatamente</strong> em qualquer computador ou celular.</li>
                        <li>A nova senha fica salva no seu banco de dados Supabase e no seu navegador.</li>
                      </ul>
                    </div>

                    {passwordChangeStatus && (
                      <div
                        className={`text-xs p-3 rounded-xl border font-medium ${
                          passwordChangeStatus.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        {passwordChangeStatus.text}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#8e6e34] hover:bg-[#735a2e] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Atualizar Senha de Acesso
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

              {/* TAB 5: SUPABASE & RENDER */}
              {activeTab === 'supabase' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#1c1917] flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#8e6e34]" />
                        Conexão & Republicação Supabase / Render
                      </h3>
                      <p className="text-xs text-[#786e64]">
                        Instruções passo a passo e Script SQL pronto para recriar seu banco 100% limpo.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenGuide}
                      className="px-3 py-1.5 bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#1c1917] text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-[#d5cbbe] self-start sm:self-auto"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#8e6e34]" /> Ver Guia Completo
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    isSupabaseConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      <div>
                        <div className="text-xs font-bold">
                          {isSupabaseConnected ? 'Supabase Conectado e Sincronizado!' : 'Aguardando Credenciais do Novo Supabase'}
                        </div>
                        <div className="text-[11px] opacity-80">
                          {isSupabaseConnected
                            ? 'Todas as peças, fotos e configurações estão salvas na sua nuvem.'
                            : 'O app está funcionando em modo local. Siga o passo a passo abaixo para conectar seu novo Supabase.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-CLICK SQL SCRIPT GENERATOR BOX */}
                  <div className="p-4 sm:p-5 bg-stone-900 text-stone-200 rounded-2xl space-y-3 border border-stone-800 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#c5a059]/20 text-[#e6c687]">
                          <Database className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-wide">
                            Script SQL Completo e Atualizado (2026)
                          </h4>
                          <p className="text-[10px] text-stone-400">
                            Inclui fotos da dona, personalização do início do site e comprovantes PIX
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          const sqlScript = `-- ==============================================================================
-- MARIANE MOREIRA CONCEPTS - ESQUEMA DEFINITIVO SUPABASE (ESTILO KARINE MOSER)
-- ==============================================================================
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customer_profiles CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 1. TABELA DE CONFIGURAÇÕES DA LOJA E APARÊNCIA
CREATE TABLE public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'MM Concept',
    tagline TEXT DEFAULT 'Vista-se de confiança. Seja você sempre.',
    whatsapp TEXT DEFAULT '5511999999999',
    pix_key TEXT DEFAULT 'contato@mmconcept.com.br',
    pix_key_type TEXT DEFAULT 'email',
    pix_beneficiary TEXT DEFAULT 'MM Concept',
    pix_city TEXT DEFAULT 'São Paulo',
    instagram TEXT DEFAULT '@marianemoreira_concept',
    admin_pin TEXT DEFAULT '1234',
    free_shipping_above NUMERIC(10, 2) DEFAULT 499.00,
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85',
    hero_title TEXT DEFAULT 'MM Concept',
    hero_subtitle TEXT DEFAULT 'Vista-se de confiança. Seja você sempre.',
    hero_badge TEXT DEFAULT 'Mariane Moreira',
    hero_cta_text TEXT DEFAULT 'Explorar Catálogo',
    hero_secondary_cta_text TEXT DEFAULT 'Atendimento Personalizado',
    hero_overlay_style TEXT DEFAULT 'dark',
    hero_show_owner_card BOOLEAN DEFAULT true,
    announcement_text TEXT DEFAULT '',
    show_announcement BOOLEAN DEFAULT false,
    about_founder_enabled BOOLEAN DEFAULT true,
    about_founder_title TEXT DEFAULT 'A Essência da Marca',
    about_founder_subtitle TEXT DEFAULT 'Vista-se de confiança. Seja você sempre.',
    about_founder_story TEXT DEFAULT 'A MM Concept nasceu do olhar e paixão de Mariane Moreira pela moda feminina. Mariane é a fundadora da marca, atuando diretamente na curadoria, compra e revenda de peças selecionadas a dedo, com alto padrão de qualidade e elegância. Vista-se de confiança. Seja você sempre. Não temos loja física — somos uma boutique 100% online, garantindo atendimento humanizado e envio cuidadoso para todo o Brasil.',
    about_founder_image TEXT DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=85',
    about_founder_quote TEXT DEFAULT '“A verdadeira sofisticação está em escolher peças com caimento impecável e elegância atemporal que valorizam o seu estilo.”',
    about_founder_signature TEXT DEFAULT 'Mariane Moreira',
    installment_max INTEGER DEFAULT 6,
    pix_discount_percent NUMERIC(5, 2) DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.store_settings (id, admin_pin, whatsapp, pix_key, pix_key_type, pix_beneficiary, pix_city, instagram)
VALUES ('default', '1234', '5511999999999', 'contato@mmconcept.com.br', 'email', 'MM Concept', 'São Paulo', '@marianemoreira_concept')
ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- 2. TABELA DE PRODUTOS
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    images TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    details TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{"P", "M", "G"}',
    colors TEXT[] DEFAULT '{}',
    stock_quantity INTEGER DEFAULT 5,
    in_stock BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('cat-1', 'Vestidos', 'vestidos', 'Modelos sofisticados para todas as ocasiões'),
  ('cat-2', 'Conjuntos', 'conjuntos', 'Combinações elegantes e práticas'),
  ('cat-3', 'Alfaiataria', 'alfaiataria', 'Cortes precisos e caimento estruturado'),
  ('cat-4', 'Blusas', 'blusas', 'Camisas de seda, tricots finos e regatas clássicas'),
  ('cat-5', 'Calças', 'calcas', 'Modelagens impecáveis em alfaiataria e tecidos nobres'),
  ('cat-6', 'Saias', 'saias', 'Saias mídi, lápis e evasê'),
  ('cat-7', 'Acessórios', 'acessorios', 'Complementos para elevar qualquer look')
ON CONFLICT (id) DO NOTHING;

-- 4. TABELA DE CONTAS E PERFIS DE CLIENTES (CADASTRO E LOGIN)
CREATE TABLE public.customer_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    cpf TEXT,
    cep TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE PEDIDOS COM COMPROVANTE PIX
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_id TEXT,
    delivery_type TEXT NOT NULL,
    cep TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'pix',
    status TEXT DEFAULT 'pending',
    stock_deducted BOOLEAN DEFAULT false,
    receipt_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir colunas receipt_image, customer_email e customer_id em tabelas existentes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_image TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- 6. SEGURANÇA E ACESSO
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.store_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.customer_profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;

CREATE POLICY "Acesso irrestrito configuracoes" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito produtos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito categorias" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito clientes" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);`;

                          try {
                            await navigator.clipboard.writeText(sqlScript);
                            setSqlCopied(true);
                            setTimeout(() => setSqlCopied(false), 4000);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#b48a4d] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {sqlCopied ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-950" />
                            <span>Copiado com Sucesso!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Script SQL (1 Clique)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-400 space-y-1 bg-black/40 p-3 rounded-xl border border-stone-800">
                      <p className="font-semibold text-stone-200">Como aplicar no Supabase novo:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Crie seu projeto gratuito no <strong>supabase.com</strong>.</li>
                        <li>No menu da esquerda, clique em <strong>SQL Editor</strong> (&gt;_).</li>
                        <li>Clique em <strong>New query</strong>, cole o script copiado e clique no botão verde <strong>Run</strong>.</li>
                        <li>Vá em <strong>Settings &gt; API</strong>, copie a <em>Project URL</em> e a <em>Publishable Key</em> e cole nos campos abaixo!</li>
                      </ol>
                    </div>
                  </div>

                  {/* Supabase credentials inputs */}
                  <div className="space-y-3 bg-[#faf8f5] p-4 rounded-xl border border-[#e8dfd2]">
                    <div>
                      <label className="block text-xs font-semibold text-[#5c544c] mb-1">
                        Supabase Project URL (ex: https://xyz.supabase.co)
                      </label>
                      <input
                        type="text"
                        placeholder="https://xyz.supabase.co"
                        value={storeSettings.supabaseUrl}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supabaseUrl: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#5c544c]">
                          Supabase Publishable Key (chave pública / anon) *
                        </label>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Use a Publishable Key
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder="sb_pub_... ou eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        value={storeSettings.supabaseAnonKey}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supabaseAnonKey: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-lg focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-[#786e64] mt-1">
                        ✅ <strong>Use a Publishable Key:</strong> Ela é a chave pública segura para o site no navegador.<br />
                        ⛔ <strong>NÃO use a Secret Key:</strong> A secret key (service_role) é restrita e nunca deve ir para o navegador.
                      </p>
                    </div>

                    {testResult && (
                      <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{testResult.message}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isTesting}
                        onClick={handleTestSupabase}
                        className="px-4 py-2 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Testar e Conectar Supabase
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!isSupabaseConnected) {
                            alert('Por favor, teste e conecte o Supabase primeiro.');
                            return;
                          }
                          for (const p of products) {
                            await upsertRemoteProduct(p);
                          }
                          await upsertRemoteSettings(storeSettings);
                          alert('Todas as peças e configurações foram enviadas para o seu novo Supabase com sucesso!');
                        }}
                        className="px-4 py-2 bg-white text-[#1c1917] border border-[#d5cbbe] hover:bg-[#f0ebe1] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#8e6e34]" />
                        Sincronizar Todas as Peças para o Supabase
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
