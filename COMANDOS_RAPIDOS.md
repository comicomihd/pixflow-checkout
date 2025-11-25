# ⚡ COMANDOS RÁPIDOS

## 🚀 INICIAR PROJETO

### 1. Instalar Dependências
```bash
npm install
```

### 2. Criar Arquivo .env
```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### 3. Preencher .env
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

### 5. Acessar no Navegador
```
http://localhost:5173
```

---

## 📦 COMANDOS DE DESENVOLVIMENTO

### Iniciar Servidor
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview de Produção
```bash
npm run preview
```

### Linter (ESLint)
```bash
npm run lint
```

### Linter com Fix
```bash
npm run lint -- --fix
```

---

## 🧪 COMANDOS DE TESTE

### Executar Testes Unitários
```bash
npm run test
```

### Modo Watch (Reexecuta ao salvar)
```bash
npm run test:watch
```

### Coverage (Cobertura de Testes)
```bash
npm run test:coverage
```

### Executar Testes E2E
```bash
npm run e2e
```

### Interface E2E
```bash
npm run e2e:ui
```

---

## 🔧 COMANDOS DE CONFIGURAÇÃO

### Instalar Pacote Específico
```bash
npm install nome-do-pacote
```

### Desinstalar Pacote
```bash
npm uninstall nome-do-pacote
```

### Atualizar Pacotes
```bash
npm update
```

### Verificar Versões
```bash
npm list
```

---

## 📊 COMANDOS DE BANCO DE DADOS

### Acessar SQL Editor (Supabase)
```
Dashboard → SQL Editor
```

### Criar Tabelas
```sql
-- Copie e cole os scripts do GUIA_CONEXAO_SUPABASE.md
```

### Resetar Banco (Cuidado!)
```sql
-- Supabase → Settings → Danger Zone → Reset Database
```

---

## 🔐 COMANDOS DE AUTENTICAÇÃO

### Fazer Login
```bash
# No navegador
http://localhost:5173/auth
```

### Fazer Signup
```bash
# No navegador
http://localhost:5173/auth
# Clique em "Sign Up"
```

### Logout
```bash
# No dashboard
# Clique em "Logout"
```

---

## 📁 COMANDOS DE ARQUIVO

### Criar Arquivo
```bash
# Windows
New-Item -Path caminho/arquivo.ts -ItemType File

# Linux/Mac
touch caminho/arquivo.ts
```

### Criar Pasta
```bash
# Windows
New-Item -Path caminho/pasta -ItemType Directory

# Linux/Mac
mkdir caminho/pasta
```

### Deletar Arquivo
```bash
# Windows
Remove-Item caminho/arquivo.ts

# Linux/Mac
rm caminho/arquivo.ts
```

### Deletar Pasta
```bash
# Windows
Remove-Item -Path caminho/pasta -Recurse

# Linux/Mac
rm -rf caminho/pasta
```

---

## 🌐 COMANDOS DE NAVEGAÇÃO

### Acessar Páginas

```bash
# Landing Page
http://localhost:5173/

# Login/Signup
http://localhost:5173/auth

# Dashboard
http://localhost:5173/dashboard

# Produtos
http://localhost:5173/products

# Checkouts
http://localhost:5173/checkouts

# Vendas
http://localhost:5173/sales

# Presells
http://localhost:5173/presells

# Entregas
http://localhost:5173/delivery

# Webhooks
http://localhost:5173/webhooks

# Logs de Erro
http://localhost:5173/error-logs

# Analytics
http://localhost:5173/analytics

# Checkout Público
http://localhost:5173/c/seu-slug

# Upsell
http://localhost:5173/upsell

# Downsell
http://localhost:5173/downsell

# Obrigado
http://localhost:5173/obrigado
```

---

## 🐛 COMANDOS DE DEBUG

### Ver Logs do Console
```bash
# Abra o DevTools (F12)
# Vá para Console
# Veja os logs
```

### Ver Network
```bash
# Abra o DevTools (F12)
# Vá para Network
# Faça uma ação
# Veja as requisições
```

### Ver Storage
```bash
# Abra o DevTools (F12)
# Vá para Application → Storage
# Veja localStorage, sessionStorage, cookies
```

### Ver Elementos
```bash
# Abra o DevTools (F12)
# Vá para Elements
# Inspecione elementos HTML
```

---

## 📝 COMANDOS DE GIT

### Inicializar Git
```bash
git init
```

### Adicionar Arquivos
```bash
git add .
```

### Fazer Commit
```bash
git commit -m "Mensagem do commit"
```

### Push para Repositório
```bash
git push origin main
```

### Ver Status
```bash
git status
```

### Ver Histórico
```bash
git log
```

---

## 🚀 DEPLOY

### Build para Produção
```bash
npm run build
```

### Testar Build Localmente
```bash
npm run preview
```

### Deploy no Netlify
```bash
# 1. Instale Netlify CLI
npm install -g netlify-cli

# 2. Faça login
netlify login

# 3. Deploy
netlify deploy --prod
```

### Deploy no Vercel
```bash
# 1. Instale Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

---

## 📚 COMANDOS DE DOCUMENTAÇÃO

### Ver Documentação Local
```bash
# Abra os arquivos .md no seu editor
```

### Gerar Documentação
```bash
# Já está gerada em .md
# Veja os arquivos na raiz do projeto
```

---

## 🔍 COMANDOS DE BUSCA

### Buscar Texto no Projeto
```bash
# No VS Code
Ctrl + Shift + F (Windows)
Cmd + Shift + F (Mac)
```

### Buscar Arquivo
```bash
# No VS Code
Ctrl + P (Windows)
Cmd + P (Mac)
```

### Buscar Símbolo
```bash
# No VS Code
Ctrl + Shift + O (Windows)
Cmd + Shift + O (Mac)
```

---

## 💾 COMANDOS DE SALVAR

### Auto-save no VS Code
```
File → Auto Save (ativar)
```

### Salvar Arquivo
```bash
Ctrl + S (Windows)
Cmd + S (Mac)
```

### Salvar Tudo
```bash
Ctrl + Shift + S (Windows)
Cmd + Shift + S (Mac)
```

---

## 🎯 FLUXO COMPLETO DE DESENVOLVIMENTO

### 1. Clonar Projeto
```bash
git clone https://seu-repositorio.git
cd pixflow-checkout
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Ambiente
```bash
# Criar .env
# Preencher variáveis
```

### 4. Iniciar Servidor
```bash
npm run dev
```

### 5. Fazer Alterações
```bash
# Edite os arquivos
# Salve com Ctrl+S
```

### 6. Testar Alterações
```bash
# Veja no navegador
# http://localhost:5173
```

### 7. Executar Testes
```bash
npm run test
npm run e2e
```

### 8. Fazer Commit
```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

### 9. Build para Produção
```bash
npm run build
```

### 10. Deploy
```bash
# Netlify, Vercel, ou seu servidor
```

---

## ⚠️ COMANDOS PERIGOSOS

### Resetar Banco de Dados
```bash
# ⚠️ CUIDADO: Deleta todos os dados!
# Supabase → Settings → Danger Zone → Reset Database
```

### Deletar Pasta node_modules
```bash
# Windows
Remove-Item -Path node_modules -Recurse

# Linux/Mac
rm -rf node_modules
```

### Limpar Cache npm
```bash
npm cache clean --force
```

---

## 🆘 COMANDOS DE AJUDA

### Ver Versão do Node
```bash
node --version
```

### Ver Versão do npm
```bash
npm --version
```

### Ver Versão do Projeto
```bash
npm list
```

### Ajuda do npm
```bash
npm help
```

---

## 📞 SUPORTE

### Problemas Comuns

**Erro: "Cannot find module"**
```bash
npm install
```

**Erro: "Port 5173 is already in use"**
```bash
# Mude a porta no vite.config.ts
# Ou mate o processo que está usando a porta
```

**Erro: "VITE_SUPABASE_URL is not defined"**
```bash
# Verifique se .env existe
# Reinicie o servidor
```

**Erro: "npm ERR! code EACCES"**
```bash
# Use sudo (não recomendado)
# Ou configure npm corretamente
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] npm install
- [ ] Criar .env
- [ ] Preencher variáveis
- [ ] npm run dev
- [ ] Acessar http://localhost:5173
- [ ] Fazer signup
- [ ] Fazer login
- [ ] Testar funcionalidades
- [ ] npm run test
- [ ] npm run build

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Usar
