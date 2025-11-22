import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Download, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

type DeliveryLog = {
  id: string;
  payment_id: string;
  product_id: string;
  status: 'pending' | 'delivered' | 'failed';
  delivery_url: string | null;
  created_at: string;
  updated_at: string;
  products: {
    name: string;
  };
  payments: {
    customer_name: string;
    customer_email: string;
  };
};

const Delivery = () => {
  const navigate = useNavigate();
  const { getPublicUrl } = useFileUpload();
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryLog | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('delivery_logs')
        .select(`
          *,
          products(name),
          payments(customer_name, customer_email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar entregas');
        console.error(error);
      } else {
        setDeliveries(data || []);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (filePath: string) => {
    if (!selectedDelivery) return;

    try {
      const { error } = await supabase
        .from('delivery_logs')
        .update({
          delivery_url: filePath,
          status: 'delivered',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDelivery.id);

      if (error) {
        toast.error('Erro ao atualizar entrega');
      } else {
        toast.success('Arquivo de entrega enviado com sucesso!');
        setSelectedDelivery(null);
        loadDeliveries();
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar entrega');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      pending: {
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      delivered: {
        label: 'Entregue',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      failed: {
        label: 'Falha',
        className: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variant.className}`}>
          {variant.label}
        </span>
      </div>
    );
  };

  const downloadFile = (filePath: string, fileName: string) => {
    const url = getPublicUrl('deliveries', filePath);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Entregas de Produtos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os arquivos de entrega para seus clientes
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Coluna Principal - Tabela */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Entregas Pendentes</CardTitle>
                <CardDescription>
                  {deliveries.filter((d) => d.status === 'pending').length} entrega(s) aguardando
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliveries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma entrega registrada
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {delivery.payments?.customer_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {delivery.payments?.customer_email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{delivery.products?.name}</TableCell>
                          <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                          <TableCell className="space-x-2">
                            {delivery.status === 'pending' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedDelivery(delivery)}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Entregar
                              </Button>
                            ) : delivery.delivery_url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  downloadFile(
                                    delivery.delivery_url!,
                                    delivery.products?.name || 'arquivo'
                                  )
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Upload */}
          <div>
            {selectedDelivery ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Entregar Arquivo</CardTitle>
                  <CardDescription className="text-sm">
                    {selectedDelivery.products?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>Cliente:</strong>{' '}
                      {selectedDelivery.payments?.customer_name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedDelivery.payments?.customer_email}
                    </p>
                  </div>

                  <FileUpload
                    bucket="deliveries"
                    path={`${selectedDelivery.payment_id}`}
                    onUploadComplete={handleUploadComplete}
                    multiple={false}
                    acceptedTypes=".pdf,.zip,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav,.doc,.docx,.xls,.xlsx"
                  />

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedDelivery(null)}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">{deliveries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pendentes</span>
                      <span className="font-bold text-yellow-600">
                        {deliveries.filter((d) => d.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entregues</span>
                      <span className="font-bold text-green-600">
                        {deliveries.filter((d) => d.status === 'delivered').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Falhas</span>
                      <span className="font-bold text-red-600">
                        {deliveries.filter((d) => d.status === 'failed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
