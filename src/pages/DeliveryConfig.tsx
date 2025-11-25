import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DeliveryConfig {
  title: string;
  description: string;
  emptyMessage: string;
  emptySubMessage: string;
  infoTitle: string;
  infoText: string;
  backgroundColor: string;
}

const DeliveryConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<DeliveryConfig>({
    title: "Entregas",
    description: "Histórico de entregas automáticas",
    emptyMessage: "Nenhuma entrega registrada",
    emptySubMessage: "Quando houver entregas, elas aparecerão aqui",
    infoTitle: "ℹ️ Como funciona",
    infoText: "Quando um cliente faz uma compra, o produto é entregue automaticamente via email. Você pode acompanhar o status de cada entrega nesta página.",
    backgroundColor: "#f9fafb",
  });

  const handleChange = (field: keyof DeliveryConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSave = () => {
    localStorage.setItem("deliveryConfig", JSON.stringify(config));
    toast.success("Configuração de Entregas salva com sucesso!");
  };

  const handlePreview = () => {
    localStorage.setItem("deliveryConfig", JSON.stringify(config));
    navigate("/delivery");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:underline mb-4"
          >
            ← Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold">Configurar Entregas</h1>
          <p className="text-muted-foreground mt-2">
            Personalize a página de entregas automáticas
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Edite os textos da página de entregas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Página</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Entregas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Subtítulo</Label>
                <Input
                  id="description"
                  value={config.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Histórico de entregas automáticas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emptyMessage">Mensagem quando vazio</Label>
                <Input
                  id="emptyMessage"
                  value={config.emptyMessage}
                  onChange={(e) => handleChange("emptyMessage", e.target.value)}
                  placeholder="Nenhuma entrega registrada"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emptySubMessage">Submensagem quando vazio</Label>
                <Input
                  id="emptySubMessage"
                  value={config.emptySubMessage}
                  onChange={(e) => handleChange("emptySubMessage", e.target.value)}
                  placeholder="Quando houver entregas, elas aparecerão aqui"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="infoTitle">Título da Seção de Informações</Label>
                <Input
                  id="infoTitle"
                  value={config.infoTitle}
                  onChange={(e) => handleChange("infoTitle", e.target.value)}
                  placeholder="ℹ️ Como funciona"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="infoText">Texto de Informações</Label>
                <Textarea
                  id="infoText"
                  value={config.infoText}
                  onChange={(e) => handleChange("infoText", e.target.value)}
                  placeholder="Descreva como funciona o sistema de entregas"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    placeholder="#f9fafb"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Salvar Configuração
                </Button>
                <Button onClick={handlePreview} variant="outline" className="flex-1">
                  Visualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Visualização</CardTitle>
              <CardDescription>
                Assim aparecerá para seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  backgroundColor: config.backgroundColor,
                  padding: "20px",
                  borderRadius: "8px",
                  minHeight: "400px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "5px" }}>
                    {config.title}
                  </h1>
                  <p style={{ color: "#666", marginBottom: "15px" }}>
                    {config.description}
                  </p>
                </div>

                <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "15px", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
                    Histórico de Entregas
                  </h2>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "15px", textAlign: "center" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                      {config.emptyMessage}
                    </p>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                      {config.emptySubMessage}
                    </p>
                  </div>
                </div>

                <div style={{ backgroundColor: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "6px", padding: "15px" }}>
                  <h3 style={{ fontWeight: "bold", color: "#1e3a8a", marginBottom: "8px" }}>
                    {config.infoTitle}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#1e40af" }}>
                    {config.infoText}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryConfig;
