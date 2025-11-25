import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface UpsellConfig {
  name: string;
  description: string;
  price: number;
  buttonText: string;
  backgroundColor: string;
  imageUrl: string;
}

export default function Upsell() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<UpsellConfig>({
    name: "Bônus Exclusivo - Acesso VIP",
    description: "Acesso completo a todos os conteúdos premium e exclusivos",
    price: 97,
    buttonText: "✓ Sim, Quero Adicionar",
    backgroundColor: "#fef3c7",
    imageUrl: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("upsellConfig");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "20px", backgroundColor: config.backgroundColor }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>Oferta Especial! ⚡</h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            Aproveite esta oportunidade única disponível apenas agora
          </p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: "30px", marginBottom: "30px" }}>
          {config.imageUrl && (
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <img
                src={config.imageUrl}
                alt={config.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "250px",
                  borderRadius: "8px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>{config.name}</h2>
            <p style={{ color: "#666" }}>{config.description}</p>
          </div>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Investimento</p>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#d97706", marginBottom: "10px" }}>R$ {config.price.toFixed(2)}</div>
            <p style={{ fontSize: "14px", color: "#666" }}>Pagamento único - sem mensalidades</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ fontWeight: "bold" }}>Acesso Imediato</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>Receba tudo em segundos</p>
            </div>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ fontWeight: "bold" }}>Oferta Limitada</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>Disponível apenas agora</p>
            </div>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ fontWeight: "bold" }}>Garantia</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>Satisfação garantida</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px", marginBottom: "30px" }}>
            <h3 style={{ fontWeight: "bold", marginBottom: "15px" }}>O que você vai receber:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
                <span style={{ color: "#16a34a", marginRight: "10px" }}>✓</span>
                <span>Acesso completo ao Bônus Exclusivo</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
                <span style={{ color: "#16a34a", marginRight: "10px" }}>✓</span>
                <span>Suporte por email e WhatsApp</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
                <span style={{ color: "#16a34a", marginRight: "10px" }}>✓</span>
                <span>Atualizações futuras incluídas</span>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start" }}>
                <span style={{ color: "#16a34a", marginRight: "10px" }}>✓</span>
                <span>Entrega imediata após confirmação</span>
              </li>
            </ul>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate("/obrigado")}
              style={{ width: "100%", backgroundColor: "#b45309", color: "white", fontWeight: "bold", padding: "15px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#92400e"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#b45309"}
            >
              {config.buttonText} - R$ {config.price.toFixed(2)}
            </button>
            <button
              onClick={() => navigate("/obrigado")}
              style={{ width: "100%", backgroundColor: "#d1d5db", color: "#1f2937", fontWeight: "bold", padding: "15px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#9ca3af"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#d1d5db"}
            >
              Não, Obrigado - Continuar Sem Esta Oferta
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
          <p>🔒 Pagamento seguro | 📧 Confirmação por email | ⚡ Acesso imediato</p>
        </div>
      </div>
    </div>
  );
}
