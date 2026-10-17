import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShoppingBag,
  MapPin,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  LogOut,
  ExternalLink,
  PackageCheck,
  Clock,
  Truck,
  Sparkles,
} from 'lucide-react';
import { CustomerUser, Order, StoreSettings } from '../types';
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  updateCustomerProfile,
  resetCustomerPassword,
  fetchCustomerOrders,
} from '../lib/customerAuth';
import { formatCurrency, cleanPhone } from '../lib/utils';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerUser | null;
  onUserChange: (user: CustomerUser | null) => void;
  settings: StoreSettings;
  onOrderClick?: (orderId: string) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'account' | 'forgot'>(
    currentUser ? 'account' : 'login'
  );
  const [accountSubTab, setAccountSubTab] = useState<'orders' | 'profile'>('orders');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCpf, setRegCpf] = useState('');
  const [regCep, setRegCep] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regComplement, setRegComplement] = useState('');
  const [regNeighborhood, setRegNeighborhood] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [showAddressFields, setShowAddressFields] = useState(false);

  // Profile edit form state (when logged in)
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profCpf, setProfCpf] = useState('');
  const [profCep, setProfCep] = useState('');
  const [profStreet, setProfStreet] = useState('');
  const [profNumber, setProfNumber] = useState('');
  const [profComplement, setProfComplement] = useState('');
  const [profNeighborhood, setProfNeighborhood] = useState('');
  const [profCity, setProfCity] = useState('');
  const [profState, setProfState] = useState('');

  // Orders list state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setActiveTab('account');
      setProfName(currentUser.name || '');
      setProfPhone(currentUser.phone || '');
      setProfCpf(currentUser.cpf || '');
      setProfCep(currentUser.cep || '');
      setProfStreet(currentUser.street || '');
      setProfNumber(currentUser.number || '');
      setProfComplement(currentUser.complement || '');
      setProfNeighborhood(currentUser.neighborhood || '');
      setProfCity(currentUser.city || '');
      setProfState(currentUser.state || '');
      loadOrders(currentUser);
    } else {
      if (activeTab === 'account') {
        setActiveTab('login');
      }
    }
    setErrorMessage('');
    setSuccessMessage('');
  }, [currentUser, isOpen]);

  const loadOrders = async (user: CustomerUser) => {
    setLoadingOrders(true);
    try {
      const list = await fetchCustomerOrders(user);
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen) return null;

  // CEP Search handler
  const handleCepSearch = async (cepValue: string, isRegister: boolean) => {
    const clean = cepValue.replace(/\D/g, '');
    if (clean.length !== 8) {
      setErrorMessage('CEP deve conter 8 dígitos.');
      return;
    }

    setLoadingCep(true);
    setErrorMessage('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();

      if (data.erro) {
        setErrorMessage('CEP não encontrado. Digite o endereço manualmente.');
        setLoadingCep(false);
        return;
      }

      if (isRegister) {
        setRegStreet(data.logradouro || '');
        setRegNeighborhood(data.bairro || '');
        setRegCity(data.localidade || '');
        setRegState(data.uf || '');
        setShowAddressFields(true);
      } else {
        setProfStreet(data.logradouro || '');
        setProfNeighborhood(data.bairro || '');
        setProfCity(data.localidade || '');
        setProfState(data.uf || '');
      }
    } catch {
      setErrorMessage('Erro ao consultar CEP. Preencha os campos manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const res = await loginCustomer(loginEmail, loginPassword);
    setLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMessage('Bem-vinda de volta à MM Concept!');
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('account');
      }, 800);
    } else {
      setErrorMessage(res.message || 'Falha no login.');
    }
  };

  // Register submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const res = await registerCustomer({
      email: regEmail,
      password: regPassword,
      name: regName,
      phone: regPhone,
      cpf: regCpf,
      cep: regCep,
      street: regStreet,
      number: regNumber,
      complement: regComplement,
      neighborhood: regNeighborhood,
      city: regCity,
      state: regState,
    });
    setLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMessage('Conta criada com sucesso! Seja bem-vinda!');
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('account');
      }, 1000);
    } else {
      setErrorMessage(res.message || 'Falha ao criar conta.');
    }
  };

  // Update profile submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const res = await updateCustomerProfile({
      name: profName,
      phone: profPhone,
      cpf: profCpf,
      cep: profCep,
      street: profStreet,
      number: profNumber,
      complement: profComplement,
      neighborhood: profNeighborhood,
      city: profCity,
      state: profState,
    });
    setLoading(false);

    if (res.success && res.user) {
      onUserChange(res.user);
      setSuccessMessage('Seus dados foram atualizados com sucesso!');
      setTimeout(() => setSuccessMessage(''), 2500);
    } else {
      setErrorMessage(res.message || 'Erro ao atualizar dados.');
    }
  };

  // Forgot password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    const res = await resetCustomerPassword(loginEmail);
    setLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logoutCustomer();
    onUserChange(null);
    setActiveTab('login');
    setOrders([]);
    setSuccessMessage('Você saiu da sua conta.');
    setTimeout(() => setSuccessMessage(''), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-[#fcfaf7] w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#e8dfd2] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1c1917] text-white px-6 py-5 flex items-center justify-between border-b border-[#322c29]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#e6c687]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-[#c5a059] font-medium">
                Área da Cliente
              </div>
              <h2 className="font-serif text-lg sm:text-xl tracking-wide font-medium">
                {currentUser ? `Olá, ${currentUser.name.split(' ')[0]}` : 'Minha Conta MM Concept'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Alert Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGGED IN VIEW */}
        {currentUser && activeTab === 'account' ? (
          <div>
            {/* Sub Tabs */}
            <div className="flex border-b border-[#e8dfd2] bg-[#f7f2ea] px-6 pt-3">
              <button
                type="button"
                onClick={() => setAccountSubTab('orders')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                  accountSubTab === 'orders'
                    ? 'border-[#936f33] text-[#1c1917]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#c5a059]" />
                <span>Meus Pedidos ({orders.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountSubTab('profile')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                  accountSubTab === 'profile'
                    ? 'border-[#936f33] text-[#1c1917]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#c5a059]" />
                <span>Meus Dados & Endereço</span>
              </button>
            </div>

            <div className="p-6 max-h-[68vh] overflow-y-auto">
              {/* TAB 1: MEUS PEDIDOS */}
              {accountSubTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#eee6da]">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1c1917]">Histórico de Compras</h3>
                      <p className="text-xs text-stone-500">
                        Acompanhe o status e os detalhes das suas peças selecionadas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadOrders(currentUser)}
                      className="text-xs text-[#936f33] hover:underline"
                    >
                      Atualizar
                    </button>
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 text-center text-stone-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c5a059] mb-2" />
                      <p className="text-xs">Carregando seus pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-white border border-[#e8dfd2] space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#f4ece1] mx-auto flex items-center justify-center text-[#936f33]">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-sm text-[#1c1917]">Nenhum pedido encontrado ainda</div>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Vista-se de confiança. Seja você sempre. Explore nossas peças e faça seu primeiro pedido com envio cuidadoso para todo o Brasil.
                      </p>
                      <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1c1917] text-white text-xs font-semibold rounded-full hover:bg-[#322c29] transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#e6c687]" />
                        <span>Ver Catálogo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => {
                        const statusConfig = {
                          pending: {
                            label: 'Aguardando Confirmação',
                            badge: 'bg-amber-100 text-amber-800 border-amber-300',
                            icon: Clock,
                          },
                          confirmed: {
                            label: 'Pedido Confirmado',
                            badge: 'bg-blue-100 text-blue-800 border-blue-300',
                            icon: PackageCheck,
                          },
                          dispatched: {
                            label: 'Enviado / A Caminho',
                            badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                            icon: Truck,
                          },
                          cancelled: {
                            label: 'Cancelado',
                            badge: 'bg-stone-100 text-stone-600 border-stone-300',
                            icon: X,
                          },
                        }[ord.status] || {
                          label: ord.status,
                          badge: 'bg-stone-100 text-stone-700 border-stone-200',
                          icon: Clock,
                        };

                        const StatusIcon = statusConfig.icon;
                        const cleanWa = cleanPhone(settings.whatsapp);
                        const waMsg = encodeURIComponent(
                          `Olá Mariane! Sou ${currentUser.name} e gostaria de saber sobre o status do meu pedido *${ord.id}* na MM Concept.`
                        );
                        const orderWaUrl = `https://wa.me/${cleanWa}?text=${waMsg}`;

                        return (
                          <div
                            key={ord.id}
                            className="bg-white rounded-xl border border-[#e8dfd2] p-4 shadow-sm space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e8dc] pb-2.5">
                              <div>
                                <span className="text-xs font-bold text-[#1c1917] font-mono">
                                  {ord.id}
                                </span>
                                <span className="text-[11px] text-stone-500 ml-2">
                                  {new Date(ord.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusConfig.badge}`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                <span>{statusConfig.label}</span>
                              </span>
                            </div>

                            {/* Order Items list */}
                            <div className="space-y-2">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-12 h-14 object-cover rounded-md border border-[#e8dfd2] shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-[#1c1917] truncate">
                                      {item.productName}
                                    </div>
                                    <div className="text-[11px] text-stone-500">
                                      Tam: <span className="font-medium text-[#1c1917]">{item.size}</span>
                                      {item.color && ` • Cor: ${item.color}`} • Qtd: {item.quantity}x
                                    </div>
                                  </div>
                                  <div className="text-xs font-semibold text-[#936f33]">
                                    {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order summary bar */}
                            <div className="pt-2 border-t border-[#f4ece1] flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="text-stone-500">Total: </span>
                                <span className="font-bold text-[#1c1917] text-sm">
                                  {formatCurrency(ord.total)}
                                </span>
                                {ord.deliveryType === 'delivery' && ord.city && (
                                  <span className="text-[11px] text-stone-500 ml-2">
                                    (Entrega em {ord.city}/{ord.state})
                                  </span>
                                )}
                              </div>
                              <a
                                href={orderWaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5ede0] hover:bg-[#ebdcc8] text-[#84632b] text-[11px] font-medium rounded-full transition-colors border border-[#ded1bd]"
                              >
                                <span>Falar no WhatsApp sobre este pedido</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MEUS DADOS & ENDEREÇO */}
              {accountSubTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="pb-2 border-b border-[#eee6da]">
                    <h3 className="text-sm font-semibold text-[#1c1917]">Dados de Contato & Envio</h3>
                    <p className="text-xs text-stone-500">
                      Mantenha seu endereço atualizado para preenchimento rápido em todas as compras.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        E-mail (Login)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full text-xs p-2.5 bg-stone-100 text-stone-500 border border-stone-200 rounded-xl cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        WhatsApp / Celular *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 99999-9999"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        CPF (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={profCpf}
                        onChange={(e) => setProfCpf(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Endereço de Entrega */}
                  <div className="pt-2">
                    <div className="text-xs font-bold text-[#1c1917] mb-2 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#936f33]" />
                      <span>Endereço de Entrega Padrão</span>
                    </div>

                    <div className="space-y-3 bg-[#faf7f2] p-3.5 rounded-xl border border-[#e8dfd2]">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="CEP (ex: 01310-100)"
                            value={profCep}
                            onChange={(e) => setProfCep(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => profCep && handleCepSearch(profCep, false)}
                          disabled={loadingCep}
                          className="px-3.5 py-2.5 bg-[#1c1917] text-white text-xs font-semibold rounded-xl hover:bg-[#322c29] transition-colors flex items-center gap-1.5"
                        >
                          {loadingCep ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          <span>Buscar</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Rua / Avenida"
                            value={profStreet}
                            onChange={(e) => setProfStreet(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Número"
                            value={profNumber}
                            onChange={(e) => setProfNumber(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Complemento (Apto, Bloco)"
                            value={profComplement}
                            onChange={(e) => setProfComplement(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Bairro"
                            value={profNeighborhood}
                            onChange={(e) => setProfNeighborhood(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Cidade"
                            value={profCity}
                            onChange={(e) => setProfCity(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="UF"
                            maxLength={2}
                            value={profState}
                            onChange={(e) => setProfState(e.target.value.toUpperCase())}
                            className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#936f33] hover:bg-[#7e5e2b] text-white text-xs font-semibold rounded-full shadow-md transition-all flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Logout Footer */}
            <div className="px-6 py-3.5 bg-[#f4ece1] border-t border-[#e8dfd2] flex items-center justify-between text-xs">
              <span className="text-stone-500">Conectada como {currentUser.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-stone-600 hover:text-rose-700 font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        ) : (
          /* NOT LOGGED IN / AUTH FORMS */
          <div>
            {/* Tab switchers: Entrar | Criar Conta */}
            {activeTab !== 'forgot' && (
              <div className="flex border-b border-[#e8dfd2] bg-[#f7f2ea]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 ${
                    activeTab === 'login'
                      ? 'border-[#936f33] text-[#1c1917] bg-[#fcfaf7]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Entrar na Minha Conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-all border-b-2 ${
                    activeTab === 'register'
                      ? 'border-[#936f33] text-[#1c1917] bg-[#fcfaf7]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Criar Nova Conta
                </button>
              </div>
            )}

            <div className="p-6 max-h-[72vh] overflow-y-auto">
              {/* 1. LOGIN FORM */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <h3 className="font-serif text-base sm:text-lg text-[#1c1917] font-medium">
                      Acesse sua Conta
                    </h3>
                    <p className="text-xs text-stone-500">
                      Gerencie seus pedidos, dados de entrega e finalize suas compras com 1 clique.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                      E-mail *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="seuemail@exemplo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-[#5c544c]">Senha *</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-[11px] text-[#936f33] hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Sua senha secreta"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs pl-9 pr-10 py-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-full shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />}
                    <span>Entrar na Minha Conta</span>
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-stone-500">Ainda não tem conta na MM Concept? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-[#936f33] hover:underline"
                    >
                      Cadastre-se grátis
                    </button>
                  </div>
                </form>
              )}

              {/* 2. REGISTER FORM */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="text-center space-y-1 mb-2">
                    <h3 className="font-serif text-base sm:text-lg text-[#1c1917] font-medium">
                      Cadastre-se na MM Concept
                    </h3>
                    <p className="text-xs text-stone-500">
                      Crie sua conta para acompanhar seus pedidos e comprar com facilidade.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Fernanda Silva"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        WhatsApp / Celular *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="(11) 99999-9999"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                        />
                        <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                      E-mail *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="seuemail@exemplo.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                      <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        Senha (mínimo 6 dígitos) *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full text-xs pl-8 pr-9 py-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                        Confirmar Senha *
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Toggle Optional Delivery Address */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddressFields(!showAddressFields)}
                      className="text-xs font-semibold text-[#936f33] hover:underline flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{showAddressFields ? '− Ocultar endereço de entrega' : '+ Cadastrar endereço de entrega agora (opcional)'}</span>
                    </button>

                    {showAddressFields && (
                      <div className="mt-3 space-y-3 bg-[#faf7f2] p-3.5 rounded-xl border border-[#e8dfd2] animate-fade-in">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="CEP (ex: 01310-100)"
                              value={regCep}
                              onChange={(e) => setRegCep(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => regCep && handleCepSearch(regCep, true)}
                            disabled={loadingCep}
                            className="px-3.5 py-2.5 bg-[#1c1917] text-white text-xs font-semibold rounded-xl hover:bg-[#322c29] transition-colors flex items-center gap-1"
                          >
                            {loadingCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                            <span>Buscar</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Rua / Avenida"
                              value={regStreet}
                              onChange={(e) => setRegStreet(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Número"
                              value={regNumber}
                              onChange={(e) => setRegNumber(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              placeholder="Complemento (Apto, Bloco)"
                              value={regComplement}
                              onChange={(e) => setRegComplement(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Bairro"
                              value={regNeighborhood}
                              onChange={(e) => setRegNeighborhood(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Cidade"
                              value={regCity}
                              onChange={(e) => setRegCity(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="UF"
                              maxLength={2}
                              value={regState}
                              onChange={(e) => setRegState(e.target.value.toUpperCase())}
                              className="w-full text-xs p-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#936f33] hover:bg-[#7e5e2b] text-white text-xs font-semibold rounded-full shadow-md transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Criar Minha Conta</span>
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-stone-500">Já possui cadastro? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-[#1c1917] hover:underline"
                    >
                      Fazer login
                    </button>
                  </div>
                </form>
              )}

              {/* 3. FORGOT PASSWORD FORM */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="text-center space-y-1 mb-3">
                    <h3 className="font-serif text-base sm:text-lg text-[#1c1917] font-medium">
                      Recuperação de Senha
                    </h3>
                    <p className="text-xs text-stone-500">
                      Digite o seu e-mail cadastrado para enviarmos instruções de redefinição.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5c544c] mb-1">
                      E-mail Cadastrado *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="seuemail@exemplo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-[#d5cbbe] rounded-xl focus:border-[#8e6e34] focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1c1917] hover:bg-[#322c29] text-white text-xs font-semibold rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />}
                    <span>Enviar Link de Recuperação</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setErrorMessage('');
                      }}
                      className="text-xs font-semibold text-[#936f33] hover:underline"
                    >
                      ← Voltar para o Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
