import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, ArrowLeft, Pencil, Trash2 } from "lucide-react";

type OrderBump = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  created_at: string;
  image_url?: string | null;
};

const OrderBumps = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [checkout, setCheckout] = useState<any>(null);
  const [bumps, setBumps] = useState<OrderBump[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBump, setEditingBump] = useState<OrderBump | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    active: true,
    image_url: "",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      // Carregar checkout
      const { data: checkoutData, error: checkoutError } = await supabase
        .from("checkouts")
        .select("id, name, slug")
        .eq("id", id)
        .single();

      if (checkoutError) throw checkoutError;
      setCheckout(checkoutData);

      // Carregar order bumps
      const { data: bumpsData, error: bumpsError } = await supabase
        .from("order_bumps")
        .select("*")
        .eq("checkout_id", id)
        .order("created_at", { ascending: false });

      if (bumpsError) throw bumpsError;
      setBumps(bumpsData || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
      console.error(error);
      navigate("/checkouts");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (bump?: OrderBump) => {
    if (bump) {
      setEditingBump(bump);
      setFormData({
        name: bump.name,
        description: bump.description || "",
        price: bump.price.toString(),
        active: bump.active,
        image_url: bump.image_url || "",
      });
    } else {
      setEditingBump(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        active: true,
        image_url: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const bumpData = {
        checkout_id: id,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        active: formData.active,
        image_url: formData.image_url || null,
      };

      if (editingBump) {
        const { error } = await supabase
          .from("order_bumps")
          .update(bumpData)
          .eq("id", editingBump.id);

        if (error) throw error;
        toast.success("Order Bump atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("order_bumps")
          .insert([bumpData]);

        if (error) throw error;
        toast.success("Order Bump criado com sucesso!");
      }

      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar order bump");
      console.error(error);
    }
  };

  const handleDelete = async (bumpId: string) => {
    if (!confirm("Tem certeza que deseja deletar este order bump?")) return;

    try {
      const { error } = await supabase
        .from("order_bumps")
        .delete()
        .eq("id", bumpId);

      if (error) throw error;
      toast.success("Order Bump deletado com sucesso!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar order bump");
      console.error(error);
    }
  };

  const toggleActive = async (bump: OrderBump) => {
    try {
      const { error } = await supabase
        .from("order_bumps")
        .update({ active: !bump.active })
        .eq("id", bump.id);

      if (error) throw error;
      toast.success(bump.active ? "Order Bump desativado!" : "Order Bump ativado!");
      loadData();
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
      console.error(error);
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate("/checkouts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Order Bumps</h1>
            <p className="text-muted-foreground mt-2">
              Checkout: <span className="font-semibold">{checkout?.name}</span>
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Order Bump
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingBump ? "Editar Order Bump" : "Novo Order Bump"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure uma oferta adicional para este checkout
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Order Bump *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Bônus - Templates Prontos"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o que o cliente vai receber"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image_url">URL da Imagem do Produto</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="27.00"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-semibold">Ativo</Label>
                      <p className="text-sm text-muted-foreground">Mostrar este order bump no checkout</p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingBump ? "Salvar Alterações" : "Criar Order Bump"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Order Bumps</CardTitle>
            <CardDescription>
              {bumps.length} order bump(s) criado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bumps.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum order bump criado ainda. Clique em "Novo Order Bump" para começar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bumps.map((bump) => (
                    <TableRow key={bump.id}>
                      <TableCell>
                        {bump.image_url ? (
                          <img
                            src={bump.image_url}
                            alt={bump.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                            Sem imagem
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{bump.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {bump.description || "-"}
                      </TableCell>
                      <TableCell className="font-semibold">R$ {bump.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium cursor-pointer ${
                            bump.active
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => toggleActive(bump)}
                        >
                          {bump.active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(bump)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(bump.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default OrderBumps;
