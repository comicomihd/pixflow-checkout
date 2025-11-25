# 📤 Guia de Upload de Arquivos - Pixflow Checkout

## 📋 Visão Geral

Sistema completo de upload de arquivos para delivery de produtos com suporte a múltiplos tipos de arquivo.

---

## 🎯 Funcionalidades

### ✅ Implementado

- [x] Upload de arquivo único
- [x] Upload de múltiplos arquivos
- [x] Drag & drop
- [x] Barra de progresso
- [x] Validação de tipo de arquivo
- [x] Validação de tamanho (máximo 50MB)
- [x] Download de arquivos
- [x] Página de gerenciamento de entregas
- [x] Integração com Supabase Storage
- [x] Rastreamento de status de entrega

---

## 📁 Arquivos Criados

### Hooks (1 arquivo)
- ✅ `src/hooks/useFileUpload.ts` - Hook para gerenciar uploads

### Componentes (1 arquivo)
- ✅ `src/components/FileUpload.tsx` - Componente de upload reutilizável

### Páginas (1 arquivo)
- ✅ `src/pages/Delivery.tsx` - Página de gerenciamento de entregas

### Rotas (1 atualização)
- ✅ `src/App.tsx` - Rota `/delivery` adicionada

---

## 🚀 Como Usar

### 1. Hook useFileUpload

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

const MyComponent = () => {
  const { uploading, progress, uploadFile, uploadMultiple, deleteFile, getPublicUrl } = useFileUpload();

  // Upload de arquivo único
  const handleUpload = async (file: File) => {
    const filePath = await uploadFile(file, 'deliveries', 'products');
    if (filePath) {
      console.log('Arquivo enviado:', filePath);
    }
  };

  // Upload de múltiplos arquivos
  const handleMultipleUpload = async (files: File[]) => {
    const paths = await uploadMultiple(files, 'deliveries', 'products');
    if (paths) {
      console.log('Arquivos enviados:', paths);
    }
  };

  // Deletar arquivo
  const handleDelete = async (filePath: string) => {
    const success = await deleteFile('deliveries', filePath);
    if (success) {
      console.log('Arquivo deletado');
    }
  };

  // Obter URL pública
  const publicUrl = getPublicUrl('deliveries', filePath);

  return (
    <div>
      {uploading && <p>Enviando... {progress?.percentage}%</p>}
    </div>
  );
};
```

### 2. Componente FileUpload

```typescript
import FileUpload from '@/components/FileUpload';

const MyPage = () => {
  const handleUploadComplete = (filePath: string) => {
    console.log('Arquivo enviado:', filePath);
  };

  return (
    <FileUpload
      bucket="deliveries"
      path="products"
      onUploadComplete={handleUploadComplete}
      multiple={false}
      acceptedTypes=".pdf,.zip,.jpg,.jpeg,.png,.gif,.mp4,.mov"
      maxSize={50}
    />
  );
};
```

### 3. Página de Delivery

Acesse `/delivery` para gerenciar entregas de produtos.

**Funcionalidades:**
- Listar todas as entregas pendentes
- Upload de arquivo para entrega
- Download de arquivos entregues
- Visualizar estatísticas de entregas

---

## 🗂️ Estrutura do Supabase Storage

```
deliveries/
├── {payment_id}/
│   ├── 1700000000000-abc123-produto.pdf
│   ├── 1700000000001-def456-guia.zip
│   └── ...
└── ...
```

---

## 📊 Tipos de Arquivo Suportados

| Tipo | Extensões | Uso |
|------|-----------|-----|
| PDF | .pdf | Documentos, guias |
| ZIP | .zip | Arquivos compactados |
| Imagem | .jpg, .jpeg, .png, .gif | Imagens do produto |
| Vídeo | .mp4, .mov | Tutoriais, demos |
| Áudio | .mp3, .wav | Áudios, podcasts |
| Documento | .doc, .docx, .xls, .xlsx | Planilhas, documentos |

---

## 🔒 Segurança

### Validações Implementadas

1. **Tamanho de Arquivo**
   - Máximo: 50MB
   - Validação no cliente e servidor

2. **Tipo de Arquivo**
   - Whitelist de tipos permitidos
   - Validação MIME type

3. **Nomes de Arquivo**
   - Nomes únicos com timestamp
   - Caracteres especiais removidos

4. **Autenticação**
   - Apenas usuários autenticados podem fazer upload
   - Apenas usuários autenticados podem acessar

---

## 🎨 Componente FileUpload

### Props

```typescript
interface FileUploadProps {
  bucket: string;                    // Nome do bucket (ex: 'deliveries')
  path: string;                      // Caminho dentro do bucket
  onUploadComplete?: (filePath: string) => void;
  onMultipleUploadComplete?: (filePaths: string[]) => void;
  multiple?: boolean;                // Permitir múltiplos arquivos
  acceptedTypes?: string;            // Tipos aceitos (ex: '.pdf,.zip')
  maxSize?: number;                  // Tamanho máximo em MB
}
```

### Exemplo Completo

```typescript
import FileUpload from '@/components/FileUpload';
import { useState } from 'react';

const DeliveryForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleUploadComplete = (filePath: string) => {
    setUploadedFiles([...uploadedFiles, filePath]);
    // Salvar no banco de dados
    saveDeliveryFile(filePath);
  };

  return (
    <FileUpload
      bucket="deliveries"
      path="products"
      onUploadComplete={handleUploadComplete}
      multiple={false}
      acceptedTypes=".pdf,.zip,.jpg,.jpeg,.png"
      maxSize={50}
    />
  );
};
```

---

## 📈 Página de Delivery

### Funcionalidades

1. **Listar Entregas**
   - Mostra todas as entregas pendentes
   - Exibe cliente, produto e status
   - Paginação automática

2. **Upload de Arquivo**
   - Selecionar arquivo para entrega
   - Drag & drop
   - Barra de progresso
   - Validação de tipo e tamanho

3. **Download de Arquivo**
   - Baixar arquivo entregue
   - Link direto para arquivo

4. **Estatísticas**
   - Total de entregas
   - Entregas pendentes
   - Entregas concluídas
   - Entregas com falha

---

## 🔄 Fluxo de Entrega

```
1. Cliente faz compra
   ↓
2. Pagamento confirmado
   ↓
3. Entrega criada (status: pending)
   ↓
4. Produtor faz upload do arquivo
   ↓
5. Status muda para: delivered
   ↓
6. Cliente recebe notificação
   ↓
7. Cliente faz download do arquivo
```

---

## 💾 Banco de Dados

### Tabela: delivery_logs

```sql
CREATE TABLE delivery_logs (
  id UUID PRIMARY KEY,
  payment_id UUID REFERENCES payments(id),
  product_id UUID REFERENCES products(id),
  status VARCHAR(50) DEFAULT 'pending',  -- pending, delivered, failed
  delivery_url VARCHAR(500),             -- Caminho do arquivo no storage
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔧 Configuração do Supabase Storage

### 1. Criar Bucket

```sql
-- Executar no Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliveries', 'deliveries', true);
```

### 2. Configurar Políticas RLS

```sql
-- Permitir usuários autenticados fazer upload
CREATE POLICY "Users can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'deliveries'
  AND auth.role() = 'authenticated'
);

-- Permitir usuários autenticados ler arquivos
CREATE POLICY "Users can read files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'deliveries'
  AND auth.role() = 'authenticated'
);

-- Permitir usuários autenticados deletar seus arquivos
CREATE POLICY "Users can delete files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'deliveries'
  AND auth.role() = 'authenticated'
);
```

---

## 📊 Exemplo de Uso Completo

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';
import FileUpload from '@/components/FileUpload';
import { useState } from 'react';

const DeliveryManager = () => {
  const { uploading, progress, getPublicUrl } = useFileUpload();
  const [deliveryUrl, setDeliveryUrl] = useState<string | null>(null);

  const handleUploadComplete = async (filePath: string) => {
    // Salvar no banco de dados
    const { error } = await supabase
      .from('delivery_logs')
      .update({
        delivery_url: filePath,
        status: 'delivered',
      })
      .eq('id', deliveryId);

    if (!error) {
      setDeliveryUrl(filePath);
    }
  };

  return (
    <div>
      <FileUpload
        bucket="deliveries"
        path={paymentId}
        onUploadComplete={handleUploadComplete}
        multiple={false}
        acceptedTypes=".pdf,.zip,.mp4"
        maxSize={100}
      />

      {uploading && (
        <div>
          <p>Enviando... {progress?.percentage}%</p>
          <progress value={progress?.percentage} max={100} />
        </div>
      )}

      {deliveryUrl && (
        <div>
          <p>Arquivo entregue com sucesso!</p>
          <a href={getPublicUrl('deliveries', deliveryUrl)}>
            Download
          </a>
        </div>
      )}
    </div>
  );
};
```

---

## 🚨 Tratamento de Erros

```typescript
const { uploading, uploadFile } = useFileUpload();

const handleUpload = async (file: File) => {
  try {
    const filePath = await uploadFile(file, 'deliveries', 'products');
    
    if (!filePath) {
      // Erro: arquivo não foi enviado
      console.error('Falha ao enviar arquivo');
      return;
    }

    // Sucesso
    console.log('Arquivo enviado:', filePath);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

---

## 📱 Responsividade

O componente FileUpload é totalmente responsivo:
- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)

---

## ⚡ Performance

### Otimizações Implementadas

1. **Validação no Cliente**
   - Reduz requisições desnecessárias
   - Feedback imediato ao usuário

2. **Nomes Únicos**
   - Evita conflitos de arquivo
   - Permite múltiplos uploads do mesmo arquivo

3. **Cache Control**
   - Cache de 1 hora (3600 segundos)
   - Reduz banda de download

4. **Barra de Progresso**
   - Feedback visual do upload
   - Melhora UX

---

## 🔍 Monitoramento

### Verificar Arquivos no Storage

```sql
-- Listar todos os arquivos
SELECT * FROM storage.objects
WHERE bucket_id = 'deliveries'
ORDER BY created_at DESC;

-- Verificar tamanho total
SELECT 
  SUM(metadata->>'size')::bigint as total_size,
  COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id = 'deliveries';
```

---

## 📞 Suporte

Para problemas com upload:

1. **Arquivo muito grande**
   - Máximo 50MB
   - Comprimir arquivo se necessário

2. **Tipo de arquivo não permitido**
   - Verifique a lista de tipos aceitos
   - Converta para formato suportado

3. **Erro de autenticação**
   - Certifique-se de estar logado
   - Verifique políticas RLS

4. **Arquivo não aparece**
   - Aguarde conclusão do upload
   - Verifique permissões do bucket

---

## 🎉 Próximas Melhorias

- [ ] Compressão automática de imagens
- [ ] Geração de thumbnails
- [ ] Suporte a upload por URL
- [ ] Resumable uploads
- [ ] Integração com CDN
- [ ] Antivírus scanning
- [ ] Backup automático
- [ ] Versionamento de arquivos

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Novembro de 2025  
**Status:** ✅ Pronto para Uso
