# 🧪 GUIA DE TESTES - CHECKOUT MOBILE

## ✅ COMO TESTAR A RESPONSIVIDADE

---

## 1️⃣ TESTE NO NAVEGADOR (DevTools)

### Passo 1: Abrir DevTools
```
Windows/Linux: F12 ou Ctrl + Shift + I
Mac: Cmd + Option + I
```

### Passo 2: Ativar Modo Responsivo
```
1. Clique no ícone de dispositivo móvel (canto superior esquerdo)
2. Ou pressione: Ctrl + Shift + M (Windows/Linux)
3. Ou pressione: Cmd + Shift + M (Mac)
```

### Passo 3: Selecionar Dispositivo
```
Clique em "Responsive" e escolha:
- iPhone SE (375px)
- iPhone 12 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad (768px)
- iPad Pro (1024px)
```

### Passo 4: Testar Responsividade
```
1. Redimensione a janela
2. Verifique se o layout se adapta
3. Teste em diferentes tamanhos
4. Verifique se não há scroll horizontal
```

---

## 2️⃣ TESTE EM DISPOSITIVO REAL

### iPhone
```
1. Abra o checkout em um iPhone
2. Verifique:
   ✓ Textos legíveis
   ✓ Botões clicáveis
   ✓ Formulário preenchível
   ✓ QR Code visível
   ✓ Sem scroll horizontal
   ✓ Imagens carregam
```

### Android
```
1. Abra o checkout em um Android
2. Verifique:
   ✓ Textos legíveis
   ✓ Botões clicáveis
   ✓ Formulário preenchível
   ✓ QR Code visível
   ✓ Sem scroll horizontal
   ✓ Imagens carregam
```

### Tablet
```
1. Abra o checkout em um tablet
2. Verifique:
   ✓ Layout em 2 colunas
   ✓ Textos aumentados
   ✓ Botões maiores
   ✓ Espaçamento apropriado
   ✓ Resumo visível
```

---

## 3️⃣ CHECKLIST DE TESTES

### Textos
```
Mobile (< 640px)
- [ ] Título: text-2xl (28px) ✓
- [ ] Descrição: text-base (16px) ✓
- [ ] Labels: text-sm (14px) ✓
- [ ] Legível sem zoom ✓

Tablet (640px - 1024px)
- [ ] Título: sm:text-3xl (30px) ✓
- [ ] Descrição: sm:text-lg (18px) ✓
- [ ] Labels: sm:text-base (16px) ✓
- [ ] Legível sem zoom ✓

Desktop (> 1024px)
- [ ] Título: lg:text-5xl (48px) ✓
- [ ] Descrição: md:text-xl (20px) ✓
- [ ] Labels: text-base (16px) ✓
- [ ] Legível sem zoom ✓
```

### Inputs
```
Mobile (< 640px)
- [ ] Altura: h-10 (40px) ✓
- [ ] Fácil de tocar ✓
- [ ] Teclado aparece ✓
- [ ] Texto visível ✓

Tablet (640px - 1024px)
- [ ] Altura: sm:h-12 (48px) ✓
- [ ] Fácil de tocar ✓
- [ ] Teclado aparece ✓
- [ ] Texto visível ✓

Desktop (> 1024px)
- [ ] Altura: md:h-14 (56px) ✓
- [ ] Fácil de clicar ✓
- [ ] Cursor muda ✓
- [ ] Texto visível ✓
```

### Botões
```
Mobile (< 640px)
- [ ] Altura: h-11 (44px) ✓
- [ ] Largura: w-full (100%) ✓
- [ ] Fácil de tocar ✓
- [ ] Feedback visual ✓

Tablet (640px - 1024px)
- [ ] Altura: sm:h-12 (48px) ✓
- [ ] Largura: sm:w-auto ✓
- [ ] Fácil de tocar ✓
- [ ] Feedback visual ✓

Desktop (> 1024px)
- [ ] Altura: md:h-14 (56px) ✓
- [ ] Largura: auto ✓
- [ ] Fácil de clicar ✓
- [ ] Hover funciona ✓
```

### Layout
```
Mobile (< 640px)
- [ ] Coluna única ✓
- [ ] Sem scroll horizontal ✓
- [ ] Conteúdo centralizado ✓
- [ ] Padding reduzido ✓

Tablet (640px - 1024px)
- [ ] 2 colunas (benefícios) ✓
- [ ] Sem scroll horizontal ✓
- [ ] Conteúdo bem distribuído ✓
- [ ] Padding normal ✓

Desktop (> 1024px)
- [ ] 3 colunas (layout principal) ✓
- [ ] Sem scroll horizontal ✓
- [ ] Resumo sticky ✓
- [ ] Padding completo ✓
```

### Imagens
```
Mobile (< 640px)
- [ ] Logo: h-12 (48px) ✓
- [ ] QR Code: w-48 h-48 (192px) ✓
- [ ] Carregam rápido ✓
- [ ] Sem distorção ✓

Tablet (640px - 1024px)
- [ ] Logo: sm:h-14 (56px) ✓
- [ ] QR Code: sm:w-64 sm:h-64 (256px) ✓
- [ ] Carregam rápido ✓
- [ ] Sem distorção ✓

Desktop (> 1024px)
- [ ] Logo: md:h-16 (64px) ✓
- [ ] QR Code: md:w-72 md:h-72 (288px) ✓
- [ ] Carregam rápido ✓
- [ ] Sem distorção ✓
```

### Ícones
```
Mobile (< 640px)
- [ ] Tamanho: h-4 w-4 (16px) ✓
- [ ] Proporcionais ✓
- [ ] Visíveis ✓

Tablet (640px - 1024px)
- [ ] Tamanho: sm:h-5 sm:w-5 (20px) ✓
- [ ] Proporcionais ✓
- [ ] Visíveis ✓

Desktop (> 1024px)
- [ ] Tamanho: md:h-6 md:w-6 (24px) ✓
- [ ] Proporcionais ✓
- [ ] Visíveis ✓
```

### Espaçamento
```
Mobile (< 640px)
- [ ] Padding: p-3, p-4 ✓
- [ ] Gap: gap-2, gap-3 ✓
- [ ] Margin: m-3, m-4 ✓
- [ ] Apropriado ✓

Tablet (640px - 1024px)
- [ ] Padding: sm:p-4, sm:p-5, sm:p-6 ✓
- [ ] Gap: sm:gap-3, sm:gap-4 ✓
- [ ] Margin: sm:m-4, sm:m-6 ✓
- [ ] Apropriado ✓

Desktop (> 1024px)
- [ ] Padding: md:p-6, md:p-8 ✓
- [ ] Gap: md:gap-6, md:gap-8 ✓
- [ ] Margin: md:m-6, md:m-8 ✓
- [ ] Apropriado ✓
```

---

## 4️⃣ TESTES DE FUNCIONALIDADE

### Formulário
```
Mobile
- [ ] Campo Nome: digita corretamente ✓
- [ ] Campo Email: valida email ✓
- [ ] Campo CPF: formata automaticamente ✓
- [ ] Campo WhatsApp: formata automaticamente ✓
- [ ] Botão Enviar: funciona ✓

Tablet
- [ ] Todos os campos funcionam ✓
- [ ] Validações funcionam ✓
- [ ] Botão funciona ✓

Desktop
- [ ] Todos os campos funcionam ✓
- [ ] Validações funcionam ✓
- [ ] Botão funciona ✓
```

### Order Bump
```
Mobile
- [ ] Checkbox visível ✓
- [ ] Texto legível ✓
- [ ] Preço visível ✓
- [ ] Clica corretamente ✓
- [ ] Total atualiza ✓

Tablet
- [ ] Checkbox visível ✓
- [ ] Texto legível ✓
- [ ] Preço visível ✓
- [ ] Clica corretamente ✓
- [ ] Total atualiza ✓

Desktop
- [ ] Checkbox visível ✓
- [ ] Texto legível ✓
- [ ] Preço visível ✓
- [ ] Clica corretamente ✓
- [ ] Total atualiza ✓
```

### Botão Copiar Pix
```
Mobile
- [ ] Botão visível ✓
- [ ] Clicável ✓
- [ ] Copia código ✓
- [ ] Notificação aparece ✓

Tablet
- [ ] Botão visível ✓
- [ ] Clicável ✓
- [ ] Copia código ✓
- [ ] Notificação aparece ✓

Desktop
- [ ] Botão visível ✓
- [ ] Clicável ✓
- [ ] Copia código ✓
- [ ] Notificação aparece ✓
```

### Timer
```
Mobile
- [ ] Timer visível ✓
- [ ] Conta regressiva funciona ✓
- [ ] Formato correto ✓

Tablet
- [ ] Timer visível ✓
- [ ] Conta regressiva funciona ✓
- [ ] Formato correto ✓

Desktop
- [ ] Timer visível ✓
- [ ] Conta regressiva funciona ✓
- [ ] Formato correto ✓
```

---

## 5️⃣ TESTES DE PERFORMANCE

### Carregamento
```
Mobile
- [ ] Página carrega em < 3s ✓
- [ ] Imagens carregam ✓
- [ ] Sem erros no console ✓

Tablet
- [ ] Página carrega em < 2s ✓
- [ ] Imagens carregam ✓
- [ ] Sem erros no console ✓

Desktop
- [ ] Página carrega em < 2s ✓
- [ ] Imagens carregam ✓
- [ ] Sem erros no console ✓
```

### Scroll
```
Mobile
- [ ] Scroll suave ✓
- [ ] Sem lag ✓
- [ ] Sem scroll horizontal ✓

Tablet
- [ ] Scroll suave ✓
- [ ] Sem lag ✓
- [ ] Sem scroll horizontal ✓

Desktop
- [ ] Scroll suave ✓
- [ ] Sem lag ✓
- [ ] Sem scroll horizontal ✓
```

---

## 6️⃣ TESTES DE COMPATIBILIDADE

### Navegadores Mobile
```
- [ ] Chrome Mobile ✓
- [ ] Safari iOS ✓
- [ ] Firefox Mobile ✓
- [ ] Samsung Internet ✓
```

### Navegadores Desktop
```
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓
```

---

## 7️⃣ TESTES DE ACESSIBILIDADE

### Teclado
```
Mobile
- [ ] Teclado aparece ✓
- [ ] Campos focam ✓
- [ ] Botões focam ✓

Desktop
- [ ] Tab funciona ✓
- [ ] Enter envia ✓
- [ ] Esc fecha ✓
```

### Cores
```
- [ ] Contraste adequado ✓
- [ ] Texto legível ✓
- [ ] Ícones visíveis ✓
```

### Zoom
```
- [ ] Zoom 100% funciona ✓
- [ ] Zoom 150% funciona ✓
- [ ] Zoom 200% funciona ✓
- [ ] Sem quebra de layout ✓
```

---

## 📋 RESUMO DE TESTES

```
Total de Testes: 100+
Categorias: 7
- Textos: 12 testes
- Inputs: 12 testes
- Botões: 12 testes
- Layout: 12 testes
- Imagens: 12 testes
- Ícones: 9 testes
- Espaçamento: 12 testes
- Funcionalidade: 12 testes
- Performance: 9 testes
- Compatibilidade: 8 testes
- Acessibilidade: 9 testes
```

---

## ✅ RESULTADO ESPERADO

```
Todos os testes devem passar:
✅ Textos legíveis em todos os tamanhos
✅ Botões clicáveis/tocáveis
✅ Formulário funcional
✅ Sem scroll horizontal
✅ Layout responsivo
✅ Imagens carregam
✅ Ícones proporcionais
✅ Espaçamento apropriado
✅ Performance boa
✅ Compatibilidade total
✅ Acessibilidade OK
```

---

## 🚀 PRÓXIMOS PASSOS

Se todos os testes passarem:
1. ✅ Deploy em staging
2. ✅ Teste final em produção
3. ✅ Monitorar performance
4. ✅ Coletar feedback
5. ✅ Fazer ajustes se necessário

---

**Última Atualização:** 22 de Novembro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Testes
