import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  uploadFile: (file: File, bucket: string, path: string) => Promise<string | null>;
  uploadMultiple: (files: File[], bucket: string, pathPrefix: string) => Promise<string[] | null>;
  deleteFile: (bucket: string, path: string) => Promise<boolean>;
  getPublicUrl: (bucket: string, path: string) => string;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string
  ): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Validar tamanho (máximo 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 50MB.');
        return null;
      }

      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido.');
        return null;
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${random}-${file.name}`;
      const filePath = `${path}/${fileName}`;

      // Upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        toast.error('Erro ao fazer upload do arquivo.');
        return null;
      }

      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      toast.success('Arquivo enviado com sucesso!');

      return filePath;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo.');
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 2000);
    }
  };

  const uploadMultiple = async (
    files: File[],
    bucket: string,
    pathPrefix: string
  ): Promise<string[] | null> => {
    try {
      setUploading(true);
      const uploadedPaths: string[] = [];
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      let uploadedSize = 0;

      for (const file of files) {
        const filePath = await uploadFile(file, bucket, pathPrefix);
        if (filePath) {
          uploadedPaths.push(filePath);
          uploadedSize += file.size;
          setProgress({
            loaded: uploadedSize,
            total: totalSize,
            percentage: Math.round((uploadedSize / totalSize) * 100),
          });
        }
      }

      if (uploadedPaths.length === files.length) {
        toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
        return uploadedPaths;
      } else {
        toast.warning(`${uploadedPaths.length} de ${files.length} arquivo(s) enviado(s).`);
        return uploadedPaths.length > 0 ? uploadedPaths : null;
      }
    } catch (error) {
      console.error('Erro ao fazer upload múltiplo:', error);
      toast.error('Erro ao fazer upload dos arquivos.');
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(null), 2000);
    }
  };

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        toast.error('Erro ao deletar arquivo.');
        return false;
      }

      toast.success('Arquivo deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error('Erro ao deletar arquivo.');
      return false;
    }
  };

  const getPublicUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadMultiple,
    deleteFile,
    getPublicUrl,
  };
};
