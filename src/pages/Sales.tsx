import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, DollarSign, ShoppingCart, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Payment = {
  id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  bump_amount: number | null;
  total_amount: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  created_at: string;
  paid_at: string | null;
  checkouts: {
    name: string;
  };
};

const Sales = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, checkouts(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar vendas");
      console.error(error);
    } else {
      setPayments(data || []);
      calculateStats(data || []);
    }
    setLoading(false);
  };

  const calculateStats = (payments: Payment[]) => {
    const total = payments.length;
    const paid = payments.filter((p) => p.status === "paid").length;
    const pending = payments.filter((p) => p.status === "pending").length;
    const revenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.total_amount, 0);

    setStats({ total, paid, pending, revenue });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Pago", className: "bg-green-100 text-green-800" },
      expired: { label: "Expirado", className: "bg-gray-100 text-gray-800" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    };

    const variant = variants[status] || variants.pending;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${variant.className}`}>
        {variant.label}
      </span>
    );
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Vendas</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe seus pagamentos e faturamento
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendas Pagas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paid}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Pagamento</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>
              {payments.length} transação(ões) registrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma venda registrada ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Checkout</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.customer_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.checkouts.name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            R$ {payment.total_amount.toFixed(2)}
                          </div>
                          {payment.bump_amount && (
                            <div className="text-sm text-muted-foreground">
                              + R$ {payment.bump_amount.toFixed(2)} (bump)
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            {format(new Date(payment.created_at), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), "HH:mm", {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sales;
