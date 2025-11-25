import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

export default function Downsell() {
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

  useEffect(() => {
    const saved = localStorage.getItem("downsellConfig");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "20px", backgroundColor: config.backgroundColor }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>Espere! 🛑 Última Chance</h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            Temos uma oferta especial mais acessível para você
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
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Preço Original</p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <div style={{ fontSize: "20px", textDecoration: "line-through", color: "#666" }}>R$ {config.originalPrice.toFixed(2)}</div>
              <div style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "5px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>-{config.discount}%</div>
            </div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#dc2626", marginBottom: "10px" }}>R$ {config.price.toFixed(2)}</div>
            <p style={{ fontSize: "14px", color: "#666" }}>Apenas nesta página - Oferta limitada</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ fontWeight: "bold" }}>Preço Especial</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>Exclusivo para você</p>
            </div>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ fontWeight: "bold" }}>Acesso Imediato</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>Em segundos</p>
            </div>
            <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
              <p style={{ fontWeight: "bold" }}>Última Chance</p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>Válida agora</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px", marginBottom: "30px" }}>
            <h3 style={{ fontWeight: "bold", marginBottom: "15px" }}>O que você vai receber:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px" }}>
                <span style={{ color: "#16a34a", marginRight: "10px" }}>✓</span>
                <span>Acesso completo ao conteúdo</span>
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

          <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", padding: "15px", marginBottom: "30px" }}>
            <p style={{ fontSize: "14px", color: "#991b1b", fontWeight: "bold" }}>
              ⚠️ Esta oferta desaparece quando você sair desta página!
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate("/obrigado")}
              style={{ width: "100%", backgroundColor: "#dc2626", color: "white", fontWeight: "bold", padding: "15px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#b91c1c"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
            >
              {config.buttonText} - R$ {config.price.toFixed(2)}
            </button>
            <button
              onClick={() => navigate("/obrigado")}
              style={{ width: "100%", backgroundColor: "#d1d5db", color: "#1f2937", fontWeight: "bold", padding: "15px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "16px" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#9ca3af"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#d1d5db"}
            >
              Não, Obrigado - Ir para Confirmação
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
