# Guia Completo: Publicando a Loja MM Concept no Render com Supabase (100% Grátis)

Este guia prático foi preparado especialmente para você colocar a sua loja MM Concept no ar de forma gratuita, profissional e com banco de dados em nuvem.

---

## 🌟 Visão Geral da Arquitetura
1. **Frontend da Loja:** Hospedado gratuitamente na **Render** (como Static Site com HTTPS e CDN rápida).
2. **Banco de Dados & Autenticação:** Hospedado gratuitamente no **Supabase** (PostgreSQL em nuvem para guardar produtos, fotos, contas de clientes e pedidos).
3. **Contas de Clientes:** Cadastro e login com e-mail, senha, endereço salvo e histórico de compras ("Meus Pedidos").
4. **Vendas & Atendimento:** Redirecionamento automático e inteligente direto para o **WhatsApp da Mariane** com o resumo completo do pedido.
5. **Pagamento:** Chave Pix cadastrada com botão de "Copiar Chave Pix" na finalização do pedido.

---

## 1️⃣ Passo 1: Criar o Banco de Dados no Supabase (Grátis)

1. Acesse o site oficial: **[supabase.com](https://supabase.com)** e clique em **"Start your project"** (crie sua conta com e-mail ou GitHub).
2. Clique em **"New project"**:
   - **Name:** `mm-concepts-store`
   - **Database Password:** Escolha uma senha segura e anote.
   - **Region:** Selecione `South America (São Paulo)` para máxima velocidade no Brasil.
   - Clique em **"Create new project"** e aguarde cerca de 1 minuto.
3. No menu lateral esquerdo do Supabase, clique no ícone **"SQL Editor"** (ícone de terminal `>_`).
4. Clique em **"New query"** e cole todo o conteúdo do arquivo `supabase-schema.sql` (disponível na raiz deste projeto).
5. Clique no botão verde **"Run"** (no canto inferior direito do editor SQL). Pronto! As tabelas de produtos, configurações, clientes e pedidos com políticas de segurança já estão criadas.
6. Pegue as suas chaves de acesso:
   - No menu lateral, clique na engrenagem de configurações **"Project Settings"** > **"API"**.
   - Copie o **Project URL** (ex: `https://xyzabcdefg.supabase.co`).
   - Copie a **Publishable key** (também chamada de `anon` / `public`).
   - ⚠️ **MUITO IMPORTANTE:**
     - ✅ **Use a Publishable key:** Esta é a chave pública correta para colocar no seu site e nas variáveis da Render (`VITE_SUPABASE_ANON_KEY`).
     - ⛔ **NÃO use a Secret key:** A Secret key (antiga `service_role`) tem acesso total administrativo e nunca deve ser colocada no site ou exposta ao público. Guarde-a em segredo.

---

## 2️⃣ Passo 2: Subir o Código para o GitHub

1. Crie uma conta gratuita no **[github.com](https://github.com)** se ainda não tiver.
2. Crie um novo repositório chamado `mm-concepts`.
3. Envie os arquivos do projeto para este repositório no GitHub.

---

## 3️⃣ Passo 3: Hospedar Gratuitamente na Render (Passo a Passo)

1. Acesse **[render.com](https://render.com)** e crie sua conta gratuita (pode entrar usando o seu GitHub).
2. No painel principal da Render, clique no botão azul **"New +"** e selecione **"Static Site"**.
3. Conecte o repositório GitHub que você criou no Passo 2.
4. Configure os campos da seguinte forma:
   - **Name:** `mm-concepts` (ou o nome que preferir)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Na seção **"Environment Variables"** (Variáveis de Ambiente), clique em **"Add Environment Variable"** e adicione:
   - `VITE_SUPABASE_URL` = (Cole o seu Project URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (Cole sua chave anon/public do Supabase)
   - `VITE_STORE_WHATSAPP` = `5511999999999` (Substitua com o DDD e celular do WhatsApp da loja)
   - `VITE_STORE_PIX_KEY` = `contato@mmconcepts.com.br` (Sua chave Pix)
   - `VITE_STORE_PIX_NAME` = `MM Concepts`
6. Clique no botão **"Create Static Site"**.
7. O Render vai compilar e gerar o seu link oficial gratuito (ex: `https://mm-concepts.onrender.com`).
8. Você também pode conectar seu domínio próprio (ex: `www.mmconcepts.com.br`) na Render gratuitamente com SSL grátis!

---

## 4️⃣ Como a Dona (Mariane) cadastra roupas e altera preços

- A fundadora Mariane pode acessar o painel administrativo clicando em **"Painel da Dona"** no topo ou no rodapé do site.
- Digite o PIN de segurança padrão: **`1234`** (que você pode alterar nas configurações a qualquer momento).
- No painel da dona:
  - ➕ **Cadastrar Nova Peça:** Defina nome, categoria, preço à vista, preço anterior (para promoção), tamanhos (P, M, G, 38, 40...), cores e fotos.
  - ✏️ **Editar e Excluir:** Altere preços e status de estoque (Disponível ou Esgotado) com apenas 1 clique.
  - 🏷️ **Categorias:** Crie quantas categorias quiser (ex: Vestidos, Conjuntos, Alfaiataria, Blusas).
  - 📦 **Gestão de Pedidos:** Veja pedidos em tempo real, confirme e envie avisos no WhatsApp com 1 clique.
  - 💳 **Configurações:** Altere seu número de WhatsApp e sua Chave Pix quando desejar.

---

## 5️⃣ Sistema de Cadastro e Login das Clientes ("Minha Conta")

- As clientes agora têm a sua própria área VIP na loja clicando em **"Minha Conta"** no topo do site:
  - 📝 **Criar Conta:** Nome completo, WhatsApp com DDD, e-mail, senha e endereço de entrega opcional (com busca automática de CEP).
  - 🔑 **Fazer Login:** Acesso rápido por e-mail e senha com opção de redefinição.
  - 🛍️ **Meus Pedidos:** A cliente acompanha todos os seus pedidos já realizados, status de envio, peças e valor total, com botão direto para tirar dúvidas no WhatsApp.
  - 🏠 **Meus Dados & Endereço:** Endereço padrão salvo para entrega rápida.
  - ⚡ **Checkout com 1 Clique:** Na sacola de compras, os dados da cliente e endereço de entrega já aparecem pré-preenchidos automaticamente!

---

## 6️⃣ Como a Cliente faz o Pedido no WhatsApp

1. A cliente navega pela curadoria, filtra por categoria ou pesquisa sua peça favorita.
2. Clica na peça, escolhe o tamanho desejado e a cor.
3. Adiciona à sacola de compras.
4. Na sacola, seus dados de contato e endereço de entrega já são preenchidos com 1 clique caso esteja logada.
5. O sistema calcula o valor total, exibe a chave Pix para pagamento e permite anexar o comprovante.
6. A cliente clica em **"Finalizar Pedido no WhatsApp"** e é direcionada direto para a conversa com a Mariane com todo o resumo pronto!
