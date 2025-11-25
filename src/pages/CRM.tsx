import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Search, Mail, Tag, MessageSquare, TrendingUp, Users, DollarSign, Eye } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  total_spent: number;
  purchase_count: number;
  last_purchase?: string;
  status: "novo" | "ativo" | "inativo" | "vip";
  tags: string[];
  notes: string;
  created_at: string;
}

interface Purchase {
  id: string;
  product_name: string;
  amount: number;
  date: string;
  status: string;
}

const CRM = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Buscar pagamentos do Supabase
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Agrupar por cliente
      const customerMap = new Map<string, Customer>();

      payments?.forEach((payment: any) => {
        const key = payment.customer_email;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: `customer-${key}`,
            name: payment.customer_name || "Cliente",
            email: payment.customer_email,
            phone: payment.customer_phone,
            cpf: payment.customer_cpf,
            total_spent: 0,
            purchase_count: 0,
            status: "novo",
            tags: [],
            notes: "",
            created_at: payment.created_at,
          });
        }

        const customer = customerMap.get(key)!;
        if (payment.status === "paid") {
          customer.total_spent += parseFloat(payment.amount) || 0;
          customer.purchase_count += 1;
          customer.last_purchase = payment.created_at;
          
          // Determinar status
          if (customer.total_spent > 500) {
            customer.status = "vip";
          } else if (customer.purchase_count > 1) {
            customer.status = "ativo";
          }
        }
      });

      // Carregar dados salvos do localStorage
      const savedCustomers = JSON.parse(localStorage.getItem("crm_customers") || "{}");
      
      customerMap.forEach((customer, key) => {
        if (savedCustomers[key]) {
          customer.tags = savedCustomers[key].tags || [];
          customer.notes = savedCustomers[key].notes || "";
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const saveCustomerData = (customer: Customer) => {
    const saved = JSON.parse(localStorage.getItem("crm_customers") || "{}");
    saved[customer.email] = {
      tags: customer.tags,
      notes: customer.notes,
    };
    localStorage.setItem("crm_customers", JSON.stringify(saved));
  };

  const handleAddNote = () => {
    if (!selectedCustomer || !noteText) return;
    
    const updated = {
      ...selectedCustomer,
      notes: selectedCustomer.notes 
        ? `${selectedCustomer.notes}\n[${new Date().toLocaleDateString("pt-BR")}] ${noteText}`
        : `[${new Date().toLocaleDateString("pt-BR")}] ${noteText}`,
    };
    
    setSelectedCustomer(updated);
    saveCustomerData(updated);
    setNoteText("");
    toast.success("Nota adicionada!");
  };

  const handleAddTag = () => {
    if (!selectedCustomer || !tagText) return;
    
    if (!selectedCustomer.tags.includes(tagText)) {
      const updated = {
        ...selectedCustomer,
        tags: [...selectedCustomer.tags, tagText],
      };
      setSelectedCustomer(updated);
      saveCustomerData(updated);
    }
    
    setTagText("");
    toast.success("Tag adicionada!");
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedCustomer) return;
    
    const updated = {
      ...selectedCustomer,
      tags: selectedCustomer.tags.filter((t) => t !== tag),
    };
    setSelectedCustomer(updated);
    saveCustomerData(updated);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "todos" || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.status === "vip").length,
    active: customers.filter((c) => c.status === "ativo").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold">CRM - Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie todos os seus clientes em um único lugar
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Clientes VIP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.vip}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                R$ {stats.totalRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="todos">Todos os Status</option>
                <option value="novo">Novo</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredCustomers.length} de {customers.length} clientes
            </p>
          </CardContent>
        </Card>

        {/* Tabela de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cliente encontrado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compras</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Última Compra</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-sm">{customer.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              customer.status === "vip"
                                ? "default"
                                : customer.status === "ativo"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.purchase_count}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {customer.total_spent.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {customer.last_purchase
                            ? new Date(customer.last_purchase).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Dialog open={dialogOpen && selectedCustomer?.id === customer.id} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{selectedCustomer?.name}</DialogTitle>
                                <DialogDescription>
                                  {selectedCustomer?.email}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedCustomer && (
                                <div className="space-y-6">
                                  {/* Informações Básicas */}
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Informações Básicas</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium">{selectedCustomer.email}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Telefone</p>
                                        <p className="font-medium">{selectedCustomer.phone || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">CPF</p>
                                        <p className="font-medium">{selectedCustomer.cpf || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <Badge>{selectedCustomer.status}</Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Estatísticas */}
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Estatísticas</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div className="border rounded p-3">
                                        <p className="text-muted-foreground">Compras</p>
                                        <p className="text-2xl font-bold">{selectedCustomer.purchase_count}</p>
                                      </div>
                                      <div className="border rounded p-3">
                                        <p className="text-muted-foreground">Total Gasto</p>
                                        <p className="text-2xl font-bold">R$ {selectedCustomer.total_spent.toFixed(2)}</p>
                                      </div>
                                      <div className="border rounded p-3">
                                        <p className="text-muted-foreground">Ticket Médio</p>
                                        <p className="text-2xl font-bold">
                                          R$ {(selectedCustomer.total_spent / Math.max(selectedCustomer.purchase_count, 1)).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tags */}
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Tags</h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {selectedCustomer.tags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="secondary"
                                          className="cursor-pointer"
                                          onClick={() => handleRemoveTag(tag)}
                                        >
                                          {tag} ✕
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Nova tag..."
                                        value={tagText}
                                        onChange={(e) => setTagText(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                                      />
                                      <Button onClick={handleAddTag} size="sm">
                                        <Tag className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Notas */}
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Notas</h3>
                                    <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                                      {selectedCustomer.notes || "Nenhuma nota"}
                                    </div>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Adicionar nota..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                                      />
                                      <Button onClick={handleAddNote} size="sm">
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Ações */}
                                  <div className="flex gap-2 pt-4 border-t">
                                    <Button className="flex-1" variant="outline">
                                      <Mail className="mr-2 h-4 w-4" />
                                      Enviar Email
                                    </Button>
                                    <Button className="flex-1" variant="outline">
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      WhatsApp
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRM;
