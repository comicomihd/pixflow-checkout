import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface DownsellConfig {
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  discount: number;
  buttonText: string;
  backgroundColor: string;
  imageUrl: string;
}

const DownsellConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<DownsellConfig>({
    name: "Oferta Especial - Downsell",
    description: "Acesso com desconto especial",
    originalPrice: 197,
    price: 97,
    discount: 50,
    buttonText: "✓ Sim, Quero Aproveitar",
    backgroundColor: "#fef2f2",
    imageUrl: "",
  });

  const handleChange = (field: keyof DownsellConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSave = () => {
    localStorage.setItem("downsellConfig", JSON.stringify(config));
    toast.success("Configuração de Downsell salva com sucesso!");
  };

  const handlePreview = () => {
    localStorage.setItem("downsellConfig", JSON.stringify(config));
    navigate("/downsell");
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
          <h1 className="text-4xl font-bold">Configurar Downsell</h1>
          <p className="text-muted-foreground mt-2">
            Personalize a oferta de downsell que será exibida aos clientes
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Edite os dados da sua oferta de downsell
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Oferta</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ex: Oferta Especial"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Preço Original (R$)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={config.originalPrice}
                    onChange={(e) => handleChange("originalPrice", parseFloat(e.target.value))}
                    placeholder="197"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço com Desconto (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={config.price}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                    placeholder="97"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={config.discount}
                  onChange={(e) => handleChange("discount", parseFloat(e.target.value))}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonText">Texto do Botão</Label>
                <Input
                  id="buttonText"
                  value={config.buttonText}
                  onChange={(e) => handleChange("buttonText", e.target.value)}
                  placeholder="✓ Sim, Quero Aproveitar"
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
                    placeholder="#fef2f2"
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
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                    <div style={{ fontSize: "18px", textDecoration: "line-through", color: "#666" }}>
                      R$ {config.originalPrice.toFixed(2)}
                    </div>
                    <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "5px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                      -{config.discount}%
                    </div>
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "bold", color: "#dc2626" }}>
                    R$ {config.price.toFixed(2)}
                  </div>
                </div>

                <button
                  style={{
                    width: "100%",
                    backgroundColor: "#dc2626",
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

export default DownsellConfig;
