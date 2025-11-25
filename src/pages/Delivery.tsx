import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface DeliveryConfig {
  title: string;
  description: string;
  emptyMessage: string;
  emptySubMessage: string;
  infoTitle: string;
  infoText: string;
  backgroundColor: string;
}

export default function Delivery() {
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

  useEffect(() => {
    const saved = localStorage.getItem("deliveryConfig");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: config.backgroundColor, padding: "30px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ padding: "10px", backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
          >
            ← Voltar
          </button>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>{config.title}</h1>
            <p style={{ color: "#666" }}>{config.description}</p>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "25px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px" }}>Histórico de Entregas</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Aqui você pode acompanhar todas as entregas de produtos para seus clientes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{config.emptyMessage}</p>
                  <p style={{ fontSize: "14px", color: "#666" }}>{config.emptySubMessage}</p>
                </div>
                <span style={{ fontSize: "32px" }}>📦</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "30px", backgroundColor: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "6px", padding: "20px" }}>
          <h3 style={{ fontWeight: "bold", color: "#1e3a8a", marginBottom: "10px" }}>{config.infoTitle}</h3>
          <p style={{ fontSize: "14px", color: "#1e40af" }}>
            {config.infoText}
          </p>
        </div>
      </div>
    </div>
  );
}
