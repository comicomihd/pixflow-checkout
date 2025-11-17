import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, ArrowLeft, Pencil, Trash2, ExternalLink, Settings } from "lucide-react";

type Product = {
  id: string;
  name: string;
};

type Checkout = {
  id: string;
  name: string;
  slug: string;
  product_id: string;
  products: Product;
  active: boolean;
  has_countdown: boolean;
  countdown_minutes: number | null;
  theme_color: string | null;
};

const Checkouts = () => {
  const navigate = useNavigate();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState<Checkout | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    product_id: "",
    has_countdown: false,
    countdown_minutes: "15",
    theme_color: "#6366f1",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [checkoutsRes, productsRes] = await Promise.all([
      supabase
        .from("checkouts")
        .select("*, products(id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name").eq("active", true),
    ]);

    if (checkoutsRes.error) {
      toast.error("Erro ao carregar checkouts");
      console.error(checkoutsRes.error);
    } else {
      setCheckouts(checkoutsRes.data || []);
    }

    if (productsRes.error) {
      toast.error("Erro ao carregar produtos");
      console.error(productsRes.error);
    } else {
      setProducts(productsRes.data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const checkoutData = {
      name: formData.name,
      slug: formData.slug,
      product_id: formData.product_id,
      has_countdown: formData.has_countdown,
      countdown_minutes: formData.has_countdown ? parseInt(formData.countdown_minutes) : null,
      theme_color: formData.theme_color,
      user_id: user.id,
    };

    if (editingCheckout) {
      const { error } = await supabase
        .from("checkouts")
        .update(checkoutData)
        .eq("id", editingCheckout.id);

      if (error) {
        toast.error("Erro ao atualizar checkout");
        console.error(error);
      } else {
        toast.success("Checkout atualizado com sucesso!");
        loadData();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase.from("checkouts").insert([checkoutData]);

      if (error) {
        toast.error("Erro ao criar checkout");
        console.error(error);
      } else {
        toast.success("Checkout criado com sucesso!");
        loadData();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este checkout?")) return;

    const { error } = await supabase.from("checkouts").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir checkout");
      console.error(error);
    } else {
      toast.success("Checkout excluído com sucesso!");
      loadData();
    }
  };

  const handleOpenDialog = (checkout?: Checkout) => {
    if (checkout) {
      setEditingCheckout(checkout);
      setFormData({
        name: checkout.name,
        slug: checkout.slug,
        product_id: checkout.product_id,
        has_countdown: checkout.has_countdown,
        countdown_minutes: checkout.countdown_minutes?.toString() || "15",
        theme_color: checkout.theme_color || "#6366f1",
      });
    } else {
      setEditingCheckout(null);
      setFormData({
        name: "",
        slug: "",
        product_id: "",
        has_countdown: false,
        countdown_minutes: "15",
        theme_color: "#6366f1",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCheckout(null);
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
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Checkouts</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas páginas de venda
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Checkout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCheckout ? "Editar Checkout" : "Novo Checkout"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure sua página de checkout
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Checkout</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="meu-produto"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      URL: /c/{formData.slug || "slug"}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="product_id">Produto</Label>
                    <Select
                      value={formData.product_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, product_id: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="theme_color">Cor do Tema</Label>
                    <Input
                      id="theme_color"
                      type="color"
                      value={formData.theme_color}
                      onChange={(e) =>
                        setFormData({ ...formData, theme_color: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="has_countdown">Contador Regressivo</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar urgência com timer
                      </p>
                    </div>
                    <Switch
                      id="has_countdown"
                      checked={formData.has_countdown}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, has_countdown: checked })
                      }
                    />
                  </div>
                  {formData.has_countdown && (
                    <div className="grid gap-2">
                      <Label htmlFor="countdown_minutes">Tempo (minutos)</Label>
                      <Input
                        id="countdown_minutes"
                        type="number"
                        value={formData.countdown_minutes}
                        onChange={(e) =>
                          setFormData({ ...formData, countdown_minutes: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingCheckout ? "Salvar Alterações" : "Criar Checkout"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Checkouts</CardTitle>
            <CardDescription>
              {checkouts.length} checkout(s) criado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkouts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum checkout criado ainda
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkouts.map((checkout) => (
                    <TableRow key={checkout.id}>
                      <TableCell className="font-medium">{checkout.name}</TableCell>
                      <TableCell>{checkout.products.name}</TableCell>
                      <TableCell className="font-mono text-sm">/c/{checkout.slug}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            checkout.active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {checkout.active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/c/${checkout.slug}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/checkouts/${checkout.id}/edit`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(checkout)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(checkout.id)}
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

export default Checkouts;
