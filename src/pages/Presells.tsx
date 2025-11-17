import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const presellSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  checkout_id: z.string().min(1, "Checkout é obrigatório"),
  headline: z.string().min(1, "Headline é obrigatório"),
  description: z.string().optional(),
  video_url: z.string().url("URL inválida").optional().or(z.literal("")),
  bullet_points: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

type PresellFormData = z.infer<typeof presellSchema>;

const Presells = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presells, setPresells] = useState<any[]>([]);
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulletInput, setBulletInput] = useState("");

  const form = useForm<PresellFormData>({
    resolver: zodResolver(presellSchema),
    defaultValues: {
      name: "",
      checkout_id: "",
      headline: "",
      description: "",
      video_url: "",
      bullet_points: [],
      active: true,
    },
  });

  useEffect(() => {
    checkAuth();
    fetchPresells();
    fetchCheckouts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchPresells = async () => {
    const { data, error } = await supabase
      .from("presells")
      .select(`
        *,
        checkouts (name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar presells",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPresells(data || []);
    }
  };

  const fetchCheckouts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("checkouts")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      toast({
        title: "Erro ao carregar checkouts",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCheckouts(data || []);
    }
  };

  const onSubmit = async (data: PresellFormData) => {
    try {
      const presellData = {
        name: data.name,
        checkout_id: data.checkout_id,
        headline: data.headline,
        video_url: data.video_url || null,
        description: data.description || null,
        bullet_points: data.bullet_points,
        active: data.active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("presells")
          .update(presellData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Presell atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from("presells")
          .insert([presellData]);

        if (error) throw error;

        toast({
          title: "Presell criado com sucesso!",
        });
      }

      form.reset();
      setEditingId(null);
      fetchPresells();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar presell",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (presell: any) => {
    setEditingId(presell.id);
    form.reset({
      name: presell.name,
      checkout_id: presell.checkout_id,
      headline: presell.headline,
      description: presell.description || "",
      video_url: presell.video_url || "",
      bullet_points: presell.bullet_points || [],
      active: presell.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este presell?")) return;

    const { error } = await supabase
      .from("presells")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir presell",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Presell excluído com sucesso!",
      });
      fetchPresells();
    }
  };

  const addBulletPoint = () => {
    if (bulletInput.trim()) {
      const currentBullets = form.getValues("bullet_points");
      form.setValue("bullet_points", [...currentBullets, bulletInput.trim()]);
      setBulletInput("");
    }
  };

  const removeBulletPoint = (index: number) => {
    const currentBullets = form.getValues("bullet_points");
    form.setValue("bullet_points", currentBullets.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Presells</h1>
            <p className="text-muted-foreground">Gerencie suas páginas de presell</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Editar Presell" : "Novo Presell"}</CardTitle>
              <CardDescription>
                Configure a página de presell com vídeo e benefícios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Presell do Curso X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkout_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checkout</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um checkout" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {checkouts.map((checkout) => (
                              <SelectItem key={checkout.id} value={checkout.id}>
                                {checkout.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Descubra o segredo para..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="video_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Vídeo (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição adicional sobre o produto..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Bullet Points</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicione um benefício..."
                        value={bulletInput}
                        onChange={(e) => setBulletInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addBulletPoint();
                          }
                        }}
                      />
                      <Button type="button" onClick={addBulletPoint} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {form.watch("bullet_points").map((bullet, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="flex-1">{bullet}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBulletPoint(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? "Atualizar" : "Criar"} Presell
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          form.reset();
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Presells Cadastrados</h2>
            {presells.map((presell) => (
              <Card key={presell.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {presell.name}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(presell)}>
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(presell.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Checkout: {presell.checkouts?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Headline:</strong> {presell.headline}</p>
                    {presell.video_url && (
                      <p><strong>Vídeo:</strong> {presell.video_url}</p>
                    )}
                    {presell.description && (
                      <p><strong>Descrição:</strong> {presell.description}</p>
                    )}
                    {presell.bullet_points?.length > 0 && (
                      <div>
                        <strong>Bullet Points:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {presell.bullet_points.map((bullet: string, index: number) => (
                            <li key={index}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={presell.active ? "text-green-600" : "text-red-600"}>
                        {presell.active ? "Ativo" : "Inativo"}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presells;
