import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, MessageCircle } from "lucide-react";
import CheckoutPreview from "@/components/CheckoutPreview";
import CheckoutTimer from "@/components/CheckoutTimer";

type TrustBadge = {
  icon: string;
  title: string;
  description: string;
};

type Testimonial = {
  name: string;
  text: string;
  rating: number;
  image_url?: string;
  video_url?: string;
  media_type?: "image" | "video" | "none";
};

type FAQ = {
  question: string;
  answer: string;
};

type CheckoutConfig = {
  header_text?: string;
  header_cta_text?: string;
  hero_banner_url?: string;
  footer_banner_url?: string;
  trust_badges?: TrustBadge[];
  guarantee_days?: number;
  guarantee_text?: string;
  support_email?: string;
  support_phone?: string;
  support_text?: string;
  company_name?: string;
  faqs?: FAQ[];
  timer_enabled?: boolean;
  timer_minutes?: number;
  timer_message?: string;
  popup_enabled?: boolean;
  popup_title?: string;
  popup_message?: string;
  popup_button_text?: string;
  whatsapp_button_enabled?: boolean;
  whatsapp_number?: string;
  whatsapp_message?: string;
  thank_you_whatsapp_enabled?: boolean;
  thank_you_whatsapp_number?: string;
  thank_you_whatsapp_message?: string;
  thank_you_whatsapp_button_text?: string;
  primary_color?: string;
  secondary_color?: string;
  button_color?: string;
  text_color?: string;
  background_color?: string;
  facebook_pixel_id?: string;
  google_analytics_id?: string;
  google_ads_id?: string;
  tiktok_pixel_id?: string;
  custom_pixels?: Array<{ name: string; code: string }>;
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
    footer_banner_url: "",
    trust_badges: [
      { icon: "shield", title: "Dados protegidos", description: "Os seus dados são confidenciais e seguros." },
      { icon: "lock", title: "Pagamento 100% Seguro", description: "As informações desta compra são criptografadas." },
      { icon: "check", title: "Conteúdo Aprovado", description: "100% revisado e aprovado por profissionais" },
      { icon: "clock", title: "Garantia de 7 dias", description: "Você esta protegido por uma garantia de satisfação" },
    ],
    guarantee_days: 7,
    guarantee_text: "Você esta protegido por uma garantia de satisfação",
    support_email: "",
    support_phone: "",
    support_text: "Em caso de dúvidas entre em contato",
    company_name: "",
    faqs: [],
    timer_enabled: true,
    timer_minutes: 15,
    timer_message: "Realize o pagamento em:",
    popup_enabled: true,
    popup_title: "Aproveite esta oferta!",
    popup_message: "Este preço especial é válido apenas nesta página",
    popup_button_text: "Comprar Agora",
    whatsapp_button_enabled: true,
    whatsapp_number: "",
    whatsapp_message: "Olá! Tenho dúvidas sobre o produto",
    thank_you_whatsapp_enabled: true,
    thank_you_whatsapp_number: "",
    thank_you_whatsapp_message: "Olá! Recebi meu pedido e gostaria de mais informações",
    thank_you_whatsapp_button_text: "Falar no WhatsApp",
    primary_color: "#3b82f6",
    secondary_color: "#6366f1",
    button_color: "#2563eb",
    text_color: "#1f2937",
    background_color: "#f9fafb",
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
    setTestimonials([...testimonials, { 
      name: "", 
      text: "", 
      rating: 5,
      image_url: "",
      video_url: "",
      media_type: "none"
    }]);
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

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="preview">👁️ Preview</TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="cores">Cores</TabsTrigger>
          <TabsTrigger value="bumps">Order Bumps</TabsTrigger>
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="popup">Pop-up</TabsTrigger>
          <TabsTrigger value="whatsapp-ty">WhatsApp TY</TabsTrigger>
          <TabsTrigger value="confianca">Confiança</TabsTrigger>
          <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>
          <TabsTrigger value="pixels">📊 Pixels</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <CheckoutPreview 
            title="Visualização do Timer" 
            description="Veja como o timer aparecerá em diferentes dispositivos"
          >
            <div className="p-6">
              <CheckoutTimer 
                minutes={config.timer_minutes || 15}
                message={config.timer_message || "⏰ Realize o pagamento em:"}
              />
              
              <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-bold">{config.header_text || "Realize o pagamento agora!"}</h2>
                <p className="text-muted-foreground">
                  Visualize como seu checkout aparecerá em diferentes tamanhos de tela
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="p-4 bg-slate-100 rounded-lg">
                    <p className="font-semibold">Configurações Atuais:</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>✓ Timer: {config.timer_minutes || 15} minutos</li>
                      <li>✓ Mensagem: {config.timer_message || "⏰ Realize o pagamento em:"}</li>
                      <li>✓ Cor Primária: {config.primary_color || "#3b82f6"}</li>
                      <li>✓ Cor do Botão: {config.button_color || "#2563eb"}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CheckoutPreview>
        </TabsContent>

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
                <Label htmlFor="support_phone">Telefone WhatsApp (com código do país)</Label>
                <Input
                  id="support_phone"
                  value={config.support_phone}
                  onChange={(e) => setConfig({ ...config, support_phone: e.target.value })}
                  placeholder="5511999999999"
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
                <Label htmlFor="hero_banner_url">URL do Banner Principal (Topo)</Label>
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

              <div className="space-y-2">
                <Label htmlFor="footer_banner_url">URL do Banner Rodapé</Label>
                <Input
                  id="footer_banner_url"
                  value={config.footer_banner_url}
                  onChange={(e) => setConfig({ ...config, footer_banner_url: e.target.value })}
                  placeholder="https://exemplo.com/footer-banner.jpg"
                />
                {config.footer_banner_url && (
                  <img
                    src={config.footer_banner_url}
                    alt="Preview"
                    className="w-full max-w-md rounded-md border"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Cores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_color">Cor do Botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="button_color"
                    type="color"
                    value={config.button_color}
                    onChange={(e) => setConfig({ ...config, button_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.button_color}
                    onChange={(e) => setConfig({ ...config, button_color: e.target.value })}
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_color">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                    placeholder="#1f2937"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={config.background_color}
                    onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.background_color}
                    onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                    placeholder="#f9fafb"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: config.background_color }}>
                <p style={{ color: config.text_color }} className="font-semibold mb-2">Preview:</p>
                <button style={{ backgroundColor: config.button_color }} className="text-white px-4 py-2 rounded">
                  Comprar Agora
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bumps" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Bumps</CardTitle>
                <Button onClick={() => navigate(`/checkouts/${id}/bumps`)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Gerenciar Order Bumps
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Clique em "Gerenciar Order Bumps" para adicionar, editar ou remover order bumps deste checkout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronômetro de Urgência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-semibold">Ativar Cronômetro</Label>
                  <p className="text-sm text-muted-foreground">Mostrar timer de contagem regressiva</p>
                </div>
                <Switch
                  checked={config.timer_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, timer_enabled: checked })}
                />
              </div>

              {config.timer_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="timer_minutes">Tempo em Minutos</Label>
                    <Input
                      id="timer_minutes"
                      type="number"
                      min="1"
                      max="60"
                      value={config.timer_minutes}
                      onChange={(e) => setConfig({ ...config, timer_minutes: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timer_message">Mensagem do Timer</Label>
                    <Input
                      id="timer_message"
                      value={config.timer_message}
                      onChange={(e) => setConfig({ ...config, timer_message: e.target.value })}
                      placeholder="Realize o pagamento em:"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pop-up de Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-semibold">Ativar Pop-up</Label>
                  <p className="text-sm text-muted-foreground">Mostrar pop-up de oferta ao carregar a página</p>
                </div>
                <Switch
                  checked={config.popup_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, popup_enabled: checked })}
                />
              </div>

              {config.popup_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="popup_title">Título do Pop-up</Label>
                    <Input
                      id="popup_title"
                      value={config.popup_title}
                      onChange={(e) => setConfig({ ...config, popup_title: e.target.value })}
                      placeholder="Aproveite esta oferta!"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup_message">Mensagem do Pop-up</Label>
                    <Textarea
                      id="popup_message"
                      value={config.popup_message}
                      onChange={(e) => setConfig({ ...config, popup_message: e.target.value })}
                      placeholder="Este preço especial é válido apenas nesta página"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup_button_text">Texto do Botão</Label>
                    <Input
                      id="popup_button_text"
                      value={config.popup_button_text}
                      onChange={(e) => setConfig({ ...config, popup_button_text: e.target.value })}
                      placeholder="Comprar Agora"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp-ty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp na Página de Obrigado</CardTitle>
              <CardDescription>
                Configure um botão de WhatsApp que aparecerá na página de agradecimento após a compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-semibold">Ativar Botão WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Mostrar botão de WhatsApp na página de obrigado</p>
                </div>
                <Switch
                  checked={config.thank_you_whatsapp_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, thank_you_whatsapp_enabled: checked })}
                />
              </div>

              {config.thank_you_whatsapp_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="thank_you_whatsapp_number">Número do WhatsApp</Label>
                    <Input
                      id="thank_you_whatsapp_number"
                      value={config.thank_you_whatsapp_number}
                      onChange={(e) => setConfig({ ...config, thank_you_whatsapp_number: e.target.value })}
                      placeholder="5511999999999"
                    />
                    <p className="text-xs text-muted-foreground">
                      Formato: código do país + DDD + número (ex: 5511999999999)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thank_you_whatsapp_message">Mensagem Personalizada</Label>
                    <Textarea
                      id="thank_you_whatsapp_message"
                      value={config.thank_you_whatsapp_message}
                      onChange={(e) => setConfig({ ...config, thank_you_whatsapp_message: e.target.value })}
                      placeholder="Olá! Recebi meu pedido e gostaria de mais informações"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Esta mensagem será enviada automaticamente quando o cliente clicar no botão
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thank_you_whatsapp_button_text">Texto do Botão</Label>
                    <Input
                      id="thank_you_whatsapp_button_text"
                      value={config.thank_you_whatsapp_button_text}
                      onChange={(e) => setConfig({ ...config, thank_you_whatsapp_button_text: e.target.value })}
                      placeholder="Falar no WhatsApp"
                    />
                  </div>

                  {/* Preview do Link */}
                  <div className="border-t pt-4 space-y-2">
                    <Label className="font-semibold">Preview do Link</Label>
                    {config.thank_you_whatsapp_number && config.thank_you_whatsapp_message ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-2">Link gerado:</p>
                        <code className="text-xs bg-white p-2 rounded border border-green-200 block overflow-auto">
                          https://wa.me/{config.thank_you_whatsapp_number}?text={encodeURIComponent(config.thank_you_whatsapp_message)}
                        </code>
                        <Button 
                          size="sm" 
                          className="mt-3 w-full bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const link = `https://wa.me/${config.thank_you_whatsapp_number}?text=${encodeURIComponent(config.thank_you_whatsapp_message)}`;
                            window.open(link, '_blank');
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Testar Link
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Preencha o número e a mensagem para ver o preview do link
                      </p>
                    )}
                  </div>
                </>
              )}
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

                    {/* Mídia */}
                    <div className="border-t pt-4 space-y-4">
                      <Label className="font-semibold">Mídia (Imagem ou Vídeo)</Label>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`media_type_${index}`}>Tipo de Mídia</Label>
                        <select
                          id={`media_type_${index}`}
                          value={testimonial.media_type || "none"}
                          onChange={(e) => updateTestimonial(index, "media_type", e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white text-sm"
                        >
                          <option value="none">Sem mídia</option>
                          <option value="image">Imagem</option>
                          <option value="video">Vídeo</option>
                        </select>
                      </div>

                      {(testimonial.media_type === "image" || testimonial.media_type === undefined) && (
                        <div className="space-y-2">
                          <Label htmlFor={`image_url_${index}`}>URL da Imagem</Label>
                          <Input
                            id={`image_url_${index}`}
                            value={testimonial.image_url || ""}
                            onChange={(e) => updateTestimonial(index, "image_url", e.target.value)}
                            placeholder="https://exemplo.com/foto.jpg"
                          />
                          {testimonial.image_url && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold mb-2">Preview:</p>
                              <img
                                src={testimonial.image_url}
                                alt="Preview"
                                className="max-w-xs h-auto rounded-lg border border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {testimonial.media_type === "video" && (
                        <div className="space-y-2">
                          <Label htmlFor={`video_url_${index}`}>URL do Vídeo (YouTube, Vimeo, etc)</Label>
                          <Input
                            id={`video_url_${index}`}
                            value={testimonial.video_url || ""}
                            onChange={(e) => updateTestimonial(index, "video_url", e.target.value)}
                            placeholder="https://youtube.com/embed/... ou https://vimeo.com/..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Use URLs de embed (youtube.com/embed/ID ou vimeo.com/ID)
                          </p>
                          {testimonial.video_url && (
                            <div className="mt-2">
                              <p className="text-sm font-semibold mb-2">Preview:</p>
                              <iframe
                                width="100%"
                                height="200"
                                src={testimonial.video_url}
                                title="Video preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-lg border border-slate-200"
                              />
                            </div>
                          )}
                        </div>
                      )}
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

        <TabsContent value="pixels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pixels de Rastreamento</CardTitle>
              <CardDescription>
                Configure pixels para rastrear conversões e comportamento dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Facebook Pixel */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">f</div>
                  <h3 className="font-semibold">Facebook Pixel</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_pixel_id">ID do Pixel do Facebook</Label>
                  <Input
                    id="facebook_pixel_id"
                    value={config.facebook_pixel_id || ""}
                    onChange={(e) => setConfig({ ...config, facebook_pixel_id: e.target.value })}
                    placeholder="123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre seu ID em: Facebook Ads Manager → Ferramentas → Pixel
                  </p>
                </div>
              </div>

              {/* Google Analytics */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">G</div>
                  <h3 className="font-semibold">Google Analytics</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">ID do Google Analytics (GA4)</Label>
                  <Input
                    id="google_analytics_id"
                    value={config.google_analytics_id || ""}
                    onChange={(e) => setConfig({ ...config, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: G-XXXXXXXXXX (encontre em Google Analytics → Admin → Propriedade)
                  </p>
                </div>
              </div>

              {/* Google Ads */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">A</div>
                  <h3 className="font-semibold">Google Ads (Conversion Tracking)</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google_ads_id">ID de Conversão do Google Ads</Label>
                  <Input
                    id="google_ads_id"
                    value={config.google_ads_id || ""}
                    onChange={(e) => setConfig({ ...config, google_ads_id: e.target.value })}
                    placeholder="AW-123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: AW-XXXXXXXXXX (encontre em Google Ads → Ferramentas → Conversões)
                  </p>
                </div>
              </div>

              {/* TikTok Pixel */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-sm">♪</div>
                  <h3 className="font-semibold">TikTok Pixel</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok_pixel_id">ID do Pixel do TikTok</Label>
                  <Input
                    id="tiktok_pixel_id"
                    value={config.tiktok_pixel_id || ""}
                    onChange={(e) => setConfig({ ...config, tiktok_pixel_id: e.target.value })}
                    placeholder="C1234567890123456"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: TikTok Ads Manager → Ativos → Pixels
                  </p>
                </div>
              </div>

              {/* Custom Pixels */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Pixels Personalizados</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setConfig({
                        ...config,
                        custom_pixels: [...(config.custom_pixels || []), { name: "", code: "" }],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pixel
                  </Button>
                </div>

                {config.custom_pixels?.map((pixel, index) => (
                  <Card key={index} className="mt-4">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const pixels = [...(config.custom_pixels || [])];
                            pixels.splice(index, 1);
                            setConfig({ ...config, custom_pixels: pixels });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome do Pixel</Label>
                        <Input
                          value={pixel.name}
                          onChange={(e) => {
                            const pixels = [...(config.custom_pixels || [])];
                            pixels[index].name = e.target.value;
                            setConfig({ ...config, custom_pixels: pixels });
                          }}
                          placeholder="Ex: Pixel Customizado"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Código do Pixel (HTML/JavaScript)</Label>
                        <Textarea
                          value={pixel.code}
                          onChange={(e) => {
                            const pixels = [...(config.custom_pixels || [])];
                            pixels[index].code = e.target.value;
                            setConfig({ ...config, custom_pixels: pixels });
                          }}
                          placeholder="<script>...</script>"
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">💡 Como usar Pixels:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Rastreie visualizações de página e cliques</li>
                  <li>Meça conversões e vendas</li>
                  <li>Crie audiências para remarketing</li>
                  <li>Otimize suas campanhas publicitárias</li>
                  <li>Analise o comportamento dos clientes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckoutEditor;
