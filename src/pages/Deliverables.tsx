import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ArrowLeft } from "lucide-react";

interface Deliverable {
  id: string;
  type: "product" | "order_bump" | "upsell" | "downsell";
  itemId: string;
  itemName: string;
  links: string[];
  created_at: string;
}

const Deliverables = () => {
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"product" | "order_bump" | "upsell" | "downsell">("product");
  const [formData, setFormData] = useState({
    itemId: "",
    itemName: "",
    link: "",
  });
  const [items, setItems] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadDeliverables();
  }, []);

  const loadDeliverables = () => {
    const saved = localStorage.getItem("deliverables");
    if (saved) {
      setDeliverables(JSON.parse(saved));
    }
  };

  const saveDeliverables = (data: Deliverable[]) => {
    localStorage.setItem("deliverables", JSON.stringify(data));
    setDeliverables(data);
  };

  const handleOpenDialog = async (type: "product" | "order_bump" | "upsell" | "downsell", deliverable?: Deliverable) => {
    setSelectedType(type);
    await loadItems(type);
    if (deliverable) {
      setEditingId(deliverable.id);
      setFormData({
        itemId: deliverable.itemId,
        itemName: deliverable.itemName,
        link: "",
      });
    } else {
      setEditingId(null);
      setFormData({
        itemId: "",
        itemName: "",
        link: "",
      });
    }
    setDialogOpen(true);
  };

  const loadItems = async (type: "product" | "order_bump" | "upsell" | "downsell") => {
    let loadedItems: Array<{ id: string; name: string }> = [];

    try {
      if (type === "product") {
        const { data, error } = await supabase
          .from("products")
          .select("id, name")
          .order("created_at", { ascending: false });

        if (error) throw error;
        loadedItems = (data || []).map((p: any) => ({ id: p.id, name: p.name }));
      } else if (type === "order_bump") {
        const { data, error } = await supabase
          .from("order_bumps")
          .select("id, name")
          .order("created_at", { ascending: false });

        if (error) throw error;
        loadedItems = (data || []).map((b: any) => ({ id: b.id, name: b.name }));
      } else if (type === "upsell") {
        const upsellConfig = localStorage.getItem("upsellConfig");
        if (upsellConfig) {
          const config = JSON.parse(upsellConfig);
          loadedItems = [{ id: "upsell-1", name: config.name }];
        }
      } else if (type === "downsell") {
        const downsellConfig = localStorage.getItem("downsellConfig");
        if (downsellConfig) {
          const config = JSON.parse(downsellConfig);
          loadedItems = [{ id: "downsell-1", name: config.name }];
        }
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens");
    }

    setItems(loadedItems);
  };

  const handleAddLink = () => {
    if (!formData.itemId || !formData.link) {
      toast.error("Selecione um item e preencha o link");
      return;
    }

    if (editingId) {
      // Editar entregável existente
      const updated = deliverables.map((d) => {
        if (d.id === editingId) {
          return {
            ...d,
            links: [...d.links, formData.link],
          };
        }
        return d;
      });
      saveDeliverables(updated);
      toast.success("Link adicionado com sucesso!");
    } else {
      // Criar novo entregável
      const newDeliverable: Deliverable = {
        id: `${selectedType}-${formData.itemId}-${Date.now()}`,
        type: selectedType,
        itemId: formData.itemId,
        itemName: formData.itemName,
        links: [formData.link],
        created_at: new Date().toISOString(),
      };
      saveDeliverables([...deliverables, newDeliverable]);
      toast.success("Entregável criado com sucesso!");
    }

    setDialogOpen(false);
    setFormData({ itemId: "", itemName: "", link: "" });
  };

  const handleRemoveLink = (deliverableId: string, linkIndex: number) => {
    const updated = deliverables.map((d) => {
      if (d.id === deliverableId) {
        return {
          ...d,
          links: d.links.filter((_, i) => i !== linkIndex),
        };
      }
      return d;
    });
    saveDeliverables(updated);
    toast.success("Link removido com sucesso!");
  };

  const handleDeleteDeliverable = (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este entregável?")) return;
    saveDeliverables(deliverables.filter((d) => d.id !== id));
    toast.success("Entregável deletado com sucesso!");
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      product: "Produto",
      order_bump: "Order Bump",
      upsell: "Upsell",
      downsell: "Downsell",
    };
    return labels[type] || type;
  };

  const renderDeliverablesList = (type: "product" | "order_bump" | "upsell" | "downsell") => {
    const filtered = deliverables.filter((d) => d.type === type);

    return (
      <div className="space-y-4">
        <Dialog open={dialogOpen && selectedType === type} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog(type)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Entregável
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Adicionar Link" : `Novo Entregável - ${getTypeLabel(type)}`}
              </DialogTitle>
              <DialogDescription>
                Configure os links ou arquivos que serão entregues ao cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="itemId">Selecione o Item *</Label>
                <Select
                  value={formData.itemId}
                  onValueChange={(value) => {
                    const selected = items.find((i) => i.id === value);
                    setFormData({
                      ...formData,
                      itemId: value,
                      itemName: selected?.name || "",
                    });
                  }}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="link">Link ou URL do Arquivo *</Label>
                <Textarea
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://drive.google.com/file/... ou https://seu-servidor.com/arquivo.zip"
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>💡 Dica:</strong> Use links do Google Drive, Dropbox, OneDrive ou hospede os arquivos em seu próprio servidor.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddLink}>
                {editingId ? "Adicionar Link" : "Criar Entregável"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Nenhum entregável configurado para {getTypeLabel(type).toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((deliverable) => (
              <Card key={deliverable.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{deliverable.itemName}</CardTitle>
                      <CardDescription>
                        {deliverable.links.length} link(s) configurado(s)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenDialog(type, deliverable)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteDeliverable(deliverable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deliverable.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1 break-all">
                          <p className="text-sm font-mono text-muted-foreground">
                            {link.length > 80 ? link.substring(0, 80) + "..." : link}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLink(deliverable.id, index)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold">Entregáveis</h1>
          <p className="text-muted-foreground mt-2">
            Configure os links e arquivos que serão entregues aos clientes por email
          </p>
        </div>

        <Tabs defaultValue="product" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="product">Produtos</TabsTrigger>
            <TabsTrigger value="order_bump">Order Bumps</TabsTrigger>
            <TabsTrigger value="upsell">Upsells</TabsTrigger>
            <TabsTrigger value="downsell">Downsells</TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="mt-6">
            {renderDeliverablesList("product")}
          </TabsContent>

          <TabsContent value="order_bump" className="mt-6">
            {renderDeliverablesList("order_bump")}
          </TabsContent>

          <TabsContent value="upsell" className="mt-6">
            {renderDeliverablesList("upsell")}
          </TabsContent>

          <TabsContent value="downsell" className="mt-6">
            {renderDeliverablesList("downsell")}
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ℹ️ Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p>
              <strong>1. Configure os entregáveis:</strong> Para cada produto, order bump, upsell ou downsell, adicione os links ou arquivos que o cliente receberá.
            </p>
            <p>
              <strong>2. Múltiplos links:</strong> Você pode adicionar vários links para um mesmo entregável (ex: vídeo + PDF + acesso à plataforma).
            </p>
            <p>
              <strong>3. Entrega automática:</strong> Quando um cliente comprar, ele receberá um email com todos os links configurados.
            </p>
            <p>
              <strong>4. Formatos suportados:</strong> Google Drive, Dropbox, OneDrive, links diretos, ou qualquer URL pública.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Deliverables;
