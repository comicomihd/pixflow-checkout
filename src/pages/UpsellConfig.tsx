import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UpsellConfig {
  name: string;
  description: string;
  price: number;
  buttonText: string;
  backgroundColor: string;
  imageUrl: string;
}

const UpsellConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<UpsellConfig>({
    name: "Bônus Exclusivo - Acesso VIP",
    description: "Acesso completo a todos os conteúdos premium e exclusivos",
    price: 97,
    buttonText: "✓ Sim, Quero Adicionar",
    backgroundColor: "#fef3c7",
    imageUrl: "",
  });

  const handleChange = (field: keyof UpsellConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSave = () => {
    localStorage.setItem("upsellConfig", JSON.stringify(config));
    toast.success("Configuração de Upsell salva com sucesso!");
  };

  const handlePreview = () => {
    localStorage.setItem("upsellConfig", JSON.stringify(config));
    navigate("/upsell");
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
          <h1 className="text-4xl font-bold">Configurar Upsell</h1>
          <p className="text-muted-foreground mt-2">
            Personalize a oferta de upsell que será exibida aos clientes
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Edite os dados da sua oferta de upsell
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Oferta</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Bônus Exclusivo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Descreva o que o cliente vai receber"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem do Produto</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={config.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  value={config.price}
                  onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                  placeholder="97"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonText">Texto do Botão</Label>
                <Input
                  id="buttonText"
                  value={config.buttonText}
                  onChange={(e) => handleChange("buttonText", e.target.value)}
                  placeholder="✓ Sim, Quero Adicionar"
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
                    placeholder="#fef3c7"
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
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {config.imageUrl && (
                  <div style={{ marginBottom: "20px", textAlign: "center" }}>
                    <img
                      src={config.imageUrl}
                      alt={config.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
                    {config.name}
                  </h2>
                  <p style={{ color: "#666", marginBottom: "15px" }}>
                    {config.description}
                  </p>
                  <div style={{ fontSize: "36px", fontWeight: "bold", color: "#d97706", marginBottom: "10px" }}>
                    R$ {config.price.toFixed(2)}
                  </div>
                </div>

                <button
                  style={{
                    width: "100%",
                    backgroundColor: "#b45309",
                    color: "white",
                    fontWeight: "bold",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {config.buttonText}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpsellConfig;
