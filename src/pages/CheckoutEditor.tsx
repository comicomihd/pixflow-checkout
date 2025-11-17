import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

type TrustBadge = {
  icon: string;
  title: string;
  description: string;
};

type Testimonial = {
  name: string;
  text: string;
  rating: number;
};

type FAQ = {
  question: string;
  answer: string;
};

type CheckoutConfig = {
  header_text?: string;
  header_cta_text?: string;
  hero_banner_url?: string;
  trust_badges?: TrustBadge[];
  guarantee_days?: number;
  guarantee_text?: string;
  support_email?: string;
  support_text?: string;
  company_name?: string;
  faqs?: FAQ[];
};

const CheckoutEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkout, setCheckout] = useState<any>(null);
  const [config, setConfig] = useState<CheckoutConfig>({
    header_text: "Realize o pagamento agora!",
    header_cta_text: "COMPRAR AGORA",
    hero_banner_url: "",
    trust_badges: [
      { icon: "shield", title: "Dados protegidos", description: "Os seus dados são confidenciais e seguros." },
      { icon: "lock", title: "Pagamento 100% Seguro", description: "As informações desta compra são criptografadas." },
      { icon: "check", title: "Conteúdo Aprovado", description: "100% revisado e aprovado por profissionais" },
      { icon: "clock", title: "Garantia de 7 dias", description: "Você esta protegido por uma garantia de satisfação" },
    ],
    guarantee_days: 7,
    guarantee_text: "Você esta protegido por uma garantia de satisfação",
    support_email: "",
    support_text: "Em caso de dúvidas entre em contato",
    company_name: "",
    faqs: [],
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    loadCheckout();
  }, [id]);

  const loadCheckout = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("checkouts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao carregar checkout");
      console.error(error);
      navigate("/checkouts");
      return;
    }

    setCheckout(data);
    
    if (data.custom_fields && typeof data.custom_fields === 'object') {
      setConfig({ ...config, ...(data.custom_fields as CheckoutConfig) });
    }
    
    if (Array.isArray(data.testimonials)) {
      setTestimonials(data.testimonials as Testimonial[]);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("checkouts")
      .update({
        custom_fields: config,
        testimonials: testimonials,
        logo_url: config.hero_banner_url,
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar configurações");
      console.error(error);
    } else {
      toast.success("Configurações salvas com sucesso!");
    }

    setSaving(false);
  };

  const addTrustBadge = () => {
    setConfig({
      ...config,
      trust_badges: [
        ...(config.trust_badges || []),
        { icon: "check", title: "", description: "" },
      ],
    });
  };

  const removeTrustBadge = (index: number) => {
    const badges = [...(config.trust_badges || [])];
    badges.splice(index, 1);
    setConfig({ ...config, trust_badges: badges });
  };

  const updateTrustBadge = (index: number, field: keyof TrustBadge, value: string) => {
    const badges = [...(config.trust_badges || [])];
    badges[index] = { ...badges[index], [field]: value };
    setConfig({ ...config, trust_badges: badges });
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { name: "", text: "", rating: 5 }]);
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = [...testimonials];
    newTestimonials.splice(index, 1);
    setTestimonials(newTestimonials);
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string | number) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTestimonials(newTestimonials);
  };

  const addFAQ = () => {
    setConfig({
      ...config,
      faqs: [...(config.faqs || []), { question: "", answer: "" }],
    });
  };

  const removeFAQ = (index: number) => {
    const faqs = [...(config.faqs || [])];
    faqs.splice(index, 1);
    setConfig({ ...config, faqs });
  };

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const faqs = [...(config.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    setConfig({ ...config, faqs });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/checkouts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editor de Checkout</h1>
            <p className="text-muted-foreground">{checkout?.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="confianca">Confiança</TabsTrigger>
          <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="header_text">Texto do Cabeçalho</Label>
                <Input
                  id="header_text"
                  value={config.header_text}
                  onChange={(e) => setConfig({ ...config, header_text: e.target.value })}
                  placeholder="Realize o pagamento agora!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header_cta_text">Texto do Botão Principal</Label>
                <Input
                  id="header_cta_text"
                  value={config.header_cta_text}
                  onChange={(e) => setConfig({ ...config, header_cta_text: e.target.value })}
                  placeholder="COMPRAR AGORA"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  value={config.company_name}
                  onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                  placeholder="Sua Empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_email">Email de Suporte</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={config.support_email}
                  onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                  placeholder="suporte@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_text">Texto de Suporte</Label>
                <Textarea
                  id="support_text"
                  value={config.support_text}
                  onChange={(e) => setConfig({ ...config, support_text: e.target.value })}
                  placeholder="Em caso de dúvidas entre em contato"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aparência Visual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_banner_url">URL do Banner Principal</Label>
                <Input
                  id="hero_banner_url"
                  value={config.hero_banner_url}
                  onChange={(e) => setConfig({ ...config, hero_banner_url: e.target.value })}
                  placeholder="https://exemplo.com/banner.jpg"
                />
                {config.hero_banner_url && (
                  <img
                    src={config.hero_banner_url}
                    alt="Preview"
                    className="w-full max-w-md rounded-md border"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confianca" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Badges de Confiança</CardTitle>
                <Button onClick={addTrustBadge} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.trust_badges?.map((badge, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTrustBadge(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Ícone (nome do ícone lucide)</Label>
                      <Input
                        value={badge.icon}
                        onChange={(e) => updateTrustBadge(index, "icon", e.target.value)}
                        placeholder="shield"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={badge.title}
                        onChange={(e) => updateTrustBadge(index, "title", e.target.value)}
                        placeholder="Dados protegidos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={badge.description}
                        onChange={(e) => updateTrustBadge(index, "description", e.target.value)}
                        placeholder="Os seus dados são confidenciais e seguros."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Garantia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guarantee_days">Dias de Garantia</Label>
                    <Input
                      id="guarantee_days"
                      type="number"
                      value={config.guarantee_days}
                      onChange={(e) => setConfig({ ...config, guarantee_days: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantee_text">Texto da Garantia</Label>
                    <Textarea
                      id="guarantee_text"
                      value={config.guarantee_text}
                      onChange={(e) => setConfig({ ...config, guarantee_text: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depoimentos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Depoimentos</CardTitle>
                <Button onClick={addTestimonial} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Depoimento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTestimonial(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                        placeholder="João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Depoimento</Label>
                      <Textarea
                        value={testimonial.text}
                        onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                        placeholder="Excelente produto!"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avaliação (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) => updateTestimonial(index, "rating", parseInt(e.target.value))}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Perguntas Frequentes</CardTitle>
                <Button onClick={addFAQ} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.faqs?.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFAQ(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Pergunta</Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, "question", e.target.value)}
                        placeholder="Como funciona?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resposta</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                        placeholder="Funciona de forma simples..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckoutEditor;
