import { useState, useRef } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Download, Loader2 } from 'lucide-react';

interface FileUploadProps {
  bucket: string;
  path: string;
  onUploadComplete?: (filePath: string) => void;
  onMultipleUploadComplete?: (filePaths: string[]) => void;
  multiple?: boolean;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

const FileUpload = ({
  bucket,
  path,
  onUploadComplete,
  onMultipleUploadComplete,
  multiple = false,
  acceptedTypes = '.pdf,.zip,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav',
  maxSize = 50,
}: FileUploadProps) => {
  const { uploading, progress, uploadFile, uploadMultiple, getPublicUrl } = useFileUpload();
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; path: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validar tamanho
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`Arquivo ${file.name} é muito grande. Máximo ${maxSize}MB.`);
        return;
      }
    }

    if (multiple) {
      const paths = await uploadMultiple(fileArray, bucket, path);
      if (paths) {
        const newFiles = paths.map((filePath) => ({
          name: filePath.split('/').pop() || 'arquivo',
          path: filePath,
        }));
        setUploadedFiles([...uploadedFiles, ...newFiles]);
        onMultipleUploadComplete?.(paths);
      }
    } else {
      const filePath = await uploadFile(fileArray[0], bucket, path);
      if (filePath) {
        const newFile = {
          name: filePath.split('/').pop() || 'arquivo',
          path: filePath,
        };
        setUploadedFiles([newFile]);
        onUploadComplete?.(filePath);
      }
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const downloadFile = (filePath: string, fileName: string) => {
    const url = getPublicUrl(bucket, filePath);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Arquivos</CardTitle>
        <CardDescription>
          Arraste arquivos ou clique para selecionar. Máximo {maxSize}MB por arquivo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">Arraste arquivos aqui</p>
              <p className="text-sm text-muted-foreground">ou</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo{multiple ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Barra de Progresso */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enviando...</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} />
          </div>
        )}

        {/* Lista de Arquivos Enviados */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Arquivos Enviados</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(file.path, file.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
