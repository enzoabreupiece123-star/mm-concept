import { getSupabase } from './supabase';
import { CustomerUser, Order } from '../types';

const LOCAL_STORAGE_USER_KEY = 'mm_customer_active_user';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'mm_customer_registered_accounts';

// Helper to get local stored users (used as fallback or offline testing)
function getLocalRegisteredAccounts(): Array<CustomerUser & { passwordHash?: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRegisteredAccounts(accounts: Array<CustomerUser & { passwordHash?: string }>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save local accounts:', err);
  }
}

// Get active session from localStorage
export function getLocalCustomerSession(): CustomerUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalCustomerSession(user: CustomerUser | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to update local session:', err);
  }
}

export async function getCurrentCustomer(): Promise<CustomerUser | null> {
  const sb = getSupabase();
  const localUser = getLocalCustomerSession();

  if (!sb) {
    return localUser;
  }

  try {
    const { data: { session }, error: sessionError } = await sb.auth.getSession();
    if (sessionError || !session || !session.user) {
      return localUser;
    }

    const authUser = session.user;

    // Fetch profile from customer_profiles
    try {
      const { data: profile, error: profileError } = await sb
        .from('customer_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile && !profileError) {
        const fullUser: CustomerUser = {
          id: authUser.id,
          email: authUser.email || profile.email || '',
          name: profile.name || authUser.user_metadata?.name || 'Cliente',
          phone: profile.phone || authUser.user_metadata?.phone || '',
          cpf: profile.cpf || '',
          cep: profile.cep || '',
          street: profile.street || '',
          number: profile.number || '',
          complement: profile.complement || '',
          neighborhood: profile.neighborhood || '',
          city: profile.city || '',
          state: profile.state || '',
          createdAt: profile.created_at || authUser.created_at,
        };
        setLocalCustomerSession(fullUser);
        return fullUser;
      }
    } catch {
      // customer_profiles table might not be queried or network hiccup
    }

    // Fallback to auth metadata
    const userFromMeta: CustomerUser = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || localUser?.name || 'Cliente',
      phone: authUser.user_metadata?.phone || localUser?.phone || '',
      cpf: localUser?.cpf || '',
      cep: localUser?.cep || '',
      street: localUser?.street || '',
      number: localUser?.number || '',
      complement: localUser?.complement || '',
      neighborhood: localUser?.neighborhood || '',
      city: localUser?.city || '',
      state: localUser?.state || '',
      createdAt: authUser.created_at,
    };
    setLocalCustomerSession(userFromMeta);
    return userFromMeta;
  } catch (err) {
    console.warn('getCurrentCustomer check error:', err);
    return localUser;
  }
}

export interface RegisterCustomerData {
  email: string;
  password: string;
  name: string;
  phone: string;
  cpf?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export async function registerCustomer(data: RegisterCustomerData): Promise<{
  success: boolean;
  user?: CustomerUser;
  message?: string;
}> {
  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();
  const phone = data.phone.trim();

  if (!email || !data.password || !name) {
    return { success: false, message: 'Preencha todos os campos obrigatórios (Nome, E-mail e Senha).' };
  }

  if (data.password.length < 6) {
    return { success: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  const sb = getSupabase();

  if (sb) {
    try {
      const { data: authData, error: authError } = await sb.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (authError) {
        // If user already exists in auth or other error, report clearly
        if (authError.message.includes('already registered')) {
          return { success: false, message: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
        }
        console.warn('Supabase auth.signUp returned error:', authError.message);
      }

      const userId = authData?.user?.id || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const customerUser: CustomerUser = {
        id: userId,
        email,
        name,
        phone,
        cpf: data.cpf?.trim() || '',
        cep: data.cep?.trim() || '',
        street: data.street?.trim() || '',
        number: data.number?.trim() || '',
        complement: data.complement?.trim() || '',
        neighborhood: data.neighborhood?.trim() || '',
        city: data.city?.trim() || '',
        state: data.state?.trim() || '',
        createdAt: new Date().toISOString(),
      };

      // Upsert profile in customer_profiles table if possible
      try {
        await sb.from('customer_profiles').upsert({
          id: userId,
          email,
          name,
          phone,
          cpf: customerUser.cpf,
          cep: customerUser.cep,
          street: customerUser.street,
          number: customerUser.number,
          complement: customerUser.complement,
          neighborhood: customerUser.neighborhood,
          city: customerUser.city,
          state: customerUser.state,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('Could not upsert customer_profiles (table may not be created yet):', profileErr);
      }

      setLocalCustomerSession(customerUser);

      // Also save to local registry fallback
      const localAccounts = getLocalRegisteredAccounts();
      const existingIdx = localAccounts.findIndex((a) => a.email.toLowerCase() === email);
      if (existingIdx >= 0) {
        localAccounts[existingIdx] = { ...customerUser, passwordHash: data.password };
      } else {
        localAccounts.push({ ...customerUser, passwordHash: data.password });
      }
      saveLocalRegisteredAccounts(localAccounts);

      return {
        success: true,
        user: customerUser,
        message: 'Cadastro realizado com sucesso! Bem-vinda à MM Concepts.',
      };
    } catch (err: any) {
      console.warn('Supabase register error, switching to local registration:', err);
    }
  }

  // Fallback Local Storage Mode
  const localAccounts = getLocalRegisteredAccounts();
  const existing = localAccounts.find((a) => a.email.toLowerCase() === email);
  if (existing) {
    return { success: false, message: 'Este e-mail já está cadastrado. Faça login.' };
  }

  const newLocalUser: CustomerUser & { passwordHash?: string } = {
    id: `local_cust_${Date.now()}`,
    email,
    name,
    phone,
    cpf: data.cpf?.trim() || '',
    cep: data.cep?.trim() || '',
    street: data.street?.trim() || '',
    number: data.number?.trim() || '',
    complement: data.complement?.trim() || '',
    neighborhood: data.neighborhood?.trim() || '',
    city: data.city?.trim() || '',
    state: data.state?.trim() || '',
    createdAt: new Date().toISOString(),
    passwordHash: data.password,
  };

  localAccounts.push(newLocalUser);
  saveLocalRegisteredAccounts(localAccounts);
  setLocalCustomerSession(newLocalUser);

  return {
    success: true,
    user: newLocalUser,
    message: 'Cadastro realizado com sucesso! Bem-vinda à MM Concepts.',
  };
}

export async function loginCustomer(emailInput: string, passwordInput: string): Promise<{
  success: boolean;
  user?: CustomerUser;
  message?: string;
}> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (!email || !password) {
    return { success: false, message: 'Informe e-mail e senha para entrar.' };
  }

  const sb = getSupabase();

  if (sb) {
    try {
      const { data: authData, error: authError } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && authData.user) {
        const authUser = authData.user;
        let customerProfile: Partial<CustomerUser> = {};

        try {
          const { data: profile } = await sb
            .from('customer_profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profile) {
            customerProfile = profile;
          }
        } catch {
          // Table may not exist yet
        }

        const fullUser: CustomerUser = {
          id: authUser.id,
          email: authUser.email || email,
          name: customerProfile.name || authUser.user_metadata?.name || 'Cliente MM Concepts',
          phone: customerProfile.phone || authUser.user_metadata?.phone || '',
          cpf: customerProfile.cpf || '',
          cep: customerProfile.cep || '',
          street: customerProfile.street || '',
          number: customerProfile.number || '',
          complement: customerProfile.complement || '',
          neighborhood: customerProfile.neighborhood || '',
          city: customerProfile.city || '',
          state: customerProfile.state || '',
          createdAt: customerProfile.createdAt || authUser.created_at,
        };

        setLocalCustomerSession(fullUser);
        return { success: true, user: fullUser, message: 'Login realizado com sucesso!' };
      } else if (authError) {
        console.warn('Supabase signInWithPassword returned error:', authError.message);
      }
    } catch (err) {
      console.warn('Supabase login exception, checking local fallback:', err);
    }
  }

  // Fallback Check in local accounts
  const localAccounts = getLocalRegisteredAccounts();
  const match = localAccounts.find(
    (a) => a.email.toLowerCase() === email && a.passwordHash === password
  );

  if (match) {
    const { passwordHash: _, ...cleanUser } = match;
    setLocalCustomerSession(cleanUser);
    return { success: true, user: cleanUser, message: 'Login realizado com sucesso!' };
  }

  return {
    success: false,
    message: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  };
}

export async function logoutCustomer(): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
  }
  setLocalCustomerSession(null);
}

export async function updateCustomerProfile(updatedData: Partial<CustomerUser>): Promise<{
  success: boolean;
  user?: CustomerUser;
  message?: string;
}> {
  const current = getLocalCustomerSession();
  if (!current) {
    return { success: false, message: 'Você precisa estar conectada para atualizar seus dados.' };
  }

  const merged: CustomerUser = {
    ...current,
    ...updatedData,
  };

  setLocalCustomerSession(merged);

  // Update in local accounts
  const localAccounts = getLocalRegisteredAccounts();
  const idx = localAccounts.findIndex((a) => a.email.toLowerCase() === merged.email.toLowerCase());
  if (idx >= 0) {
    localAccounts[idx] = { ...localAccounts[idx], ...merged };
    saveLocalRegisteredAccounts(localAccounts);
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('customer_profiles').upsert({
        id: merged.id,
        email: merged.email,
        name: merged.name,
        phone: merged.phone,
        cpf: merged.cpf || null,
        cep: merged.cep || null,
        street: merged.street || null,
        number: merged.number || null,
        complement: merged.complement || null,
        neighborhood: merged.neighborhood || null,
        city: merged.city || null,
        state: merged.state || null,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to update remote profile:', err);
    }
  }

  return { success: true, user: merged, message: 'Dados e endereço atualizados com sucesso!' };
}

export async function resetCustomerPassword(emailInput: string): Promise<{
  success: boolean;
  message: string;
}> {
  const email = emailInput.trim().toLowerCase();
  if (!email) {
    return { success: false, message: 'Informe o seu e-mail cadastrado.' };
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return {
        success: true,
        message: 'Link de redefinição de senha enviado para o seu e-mail!',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao enviar redefinição.' };
    }
  }

  return {
    success: true,
    message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas!',
  };
}

export async function fetchCustomerOrders(user: CustomerUser): Promise<Order[]> {
  const sb = getSupabase();
  const userEmail = (user.email || '').toLowerCase().trim();
  const userPhone = (user.phone || '').replace(/\D/g, '');

  if (sb) {
    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const matched = data.filter((item: any) => {
          const orderEmail = (item.customer_email || item.customerEmail || '').toLowerCase().trim();
          const orderPhone = (item.customer_phone || item.customerPhone || '').replace(/\D/g, '');
          const orderCustomerId = item.customer_id || item.customerId;

          if (orderCustomerId && orderCustomerId === user.id) return true;
          if (userEmail && orderEmail && userEmail === orderEmail) return true;
          if (userPhone && orderPhone && userPhone.length >= 8 && orderPhone.includes(userPhone.slice(-8))) return true;
          return false;
        });

        return matched.map((item: any) => ({
          id: String(item.id),
          customerName: item.customer_name,
          customerPhone: item.customer_phone,
          customerEmail: item.customer_email || '',
          customerId: item.customer_id || '',
          deliveryType: item.delivery_type,
          cep: item.cep || '',
          street: item.street || '',
          number: item.number || '',
          complement: item.complement || '',
          neighborhood: item.neighborhood || '',
          city: item.city || '',
          state: item.state || '',
          notes: item.notes || '',
          items: Array.isArray(item.items) ? item.items : [],
          subtotal: Number(item.subtotal || 0),
          total: Number(item.total || 0),
          paymentMethod: item.payment_method || 'pix',
          status: item.status || 'pending',
          stockDeducted: Boolean(item.stock_deducted),
          receiptImage: item.receipt_image || item.receiptImage || '',
          createdAt: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch remote orders for customer:', err);
    }
  }

  // Fallback to localStorage orders
  try {
    const raw = localStorage.getItem('mariane_orders');
    if (raw) {
      const allOrders: Order[] = JSON.parse(raw);
      return allOrders.filter((order) => {
        if (order.customerId && order.customerId === user.id) return true;
        if (userEmail && order.customerEmail && userEmail === order.customerEmail.toLowerCase().trim()) return true;
        const oPhone = (order.customerPhone || '').replace(/\D/g, '');
        if (userPhone && oPhone && userPhone.length >= 8 && oPhone.includes(userPhone.slice(-8))) return true;
        return false;
      });
    }
  } catch {
    return [];
  }

  return [];
}
