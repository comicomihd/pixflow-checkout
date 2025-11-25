import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Tablet, Monitor } from "lucide-react";

interface CheckoutPreviewProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

type DeviceType = "mobile" | "tablet" | "desktop";

const CheckoutPreview = ({ title, description, children }: CheckoutPreviewProps) => {
  const [device, setDevice] = useState<DeviceType>("desktop");

  const getContainerWidth = () => {
    switch (device) {
      case "mobile":
        return "w-full max-w-sm"; // 384px
      case "tablet":
        return "w-full max-w-2xl"; // 672px
      case "desktop":
        return "w-full";
      default:
        return "w-full";
    }
  };

  const getContainerHeight = () => {
    switch (device) {
      case "mobile":
        return "h-screen max-h-[812px]"; // iPhone height
      case "tablet":
        return "h-screen max-h-[1024px]"; // iPad height
      case "desktop":
        return "h-auto";
      default:
        return "h-auto";
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex gap-2 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant={device === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("mobile")}
            className="gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </Button>
          <Button
            variant={device === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("tablet")}
            className="gap-2"
          >
            <Tablet className="h-4 w-4" />
            Tablet
          </Button>
          <Button
            variant={device === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("desktop")}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <Card className="overflow-hidden bg-slate-100">
        <div className="flex items-start justify-center p-4 min-h-96">
          <div
            className={`${getContainerWidth()} ${getContainerHeight()} bg-white rounded-lg shadow-lg overflow-auto border border-slate-200`}
          >
            {children}
          </div>
        </div>
      </Card>

      {/* Device Info */}
      <div className="text-xs text-muted-foreground text-center">
        {device === "mobile" && "Visualizando em: iPhone (375px × 812px)"}
        {device === "tablet" && "Visualizando em: iPad (768px × 1024px)"}
        {device === "desktop" && "Visualizando em: Desktop (1920px+)"}
      </div>
    </div>
  );
};

export default CheckoutPreview;
