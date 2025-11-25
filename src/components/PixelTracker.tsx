import { useEffect } from "react";

interface PixelConfig {
  facebook_pixel_id?: string;
  google_analytics_id?: string;
  google_ads_id?: string;
  tiktok_pixel_id?: string;
  custom_pixels?: Array<{ name: string; code: string }>;
}

interface PixelTrackerProps {
  config: PixelConfig;
  eventType?: "pageview" | "purchase" | "add_to_cart" | "view_content" | "initiate_checkout";
  eventData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_type?: string;
    [key: string]: any;
  };
}

export const PixelTracker = ({ config, eventType = "pageview", eventData = {} }: PixelTrackerProps) => {
  useEffect(() => {
    // Facebook Pixel
    if (config.facebook_pixel_id) {
      injectFacebookPixel(config.facebook_pixel_id, eventType, eventData);
    }

    // Google Analytics
    if (config.google_analytics_id) {
      injectGoogleAnalytics(config.google_analytics_id, eventType, eventData);
    }

    // Google Ads
    if (config.google_ads_id) {
      injectGoogleAds(config.google_ads_id, eventType, eventData);
    }

    // TikTok Pixel
    if (config.tiktok_pixel_id) {
      injectTikTokPixel(config.tiktok_pixel_id, eventType, eventData);
    }

    // Custom Pixels
    if (config.custom_pixels && config.custom_pixels.length > 0) {
      config.custom_pixels.forEach((pixel) => {
        injectCustomPixel(pixel.code);
      });
    }
  }, [config, eventType, eventData]);

  return null;
};

// Facebook Pixel
const injectFacebookPixel = (pixelId: string, eventType: string, eventData: any) => {
  if (typeof window === "undefined") return;

  // Injetar script do Facebook Pixel
  if (!window.fbq) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://connect.facebook.net/en_US/fbevents.js`;
    document.head.appendChild(script);

    window.fbq = function () {
      (window.fbq as any).callMethod
        ? (window.fbq as any).callMethod.apply(window.fbq, arguments as any)
        : (window.fbq as any).queue.push(arguments);
    };
    (window.fbq as any).push = window.fbq;
    (window.fbq as any).loaded = true;
    (window.fbq as any).version = "2.0";
    (window.fbq as any).queue = [];
  }

  // Inicializar pixel
  window.fbq("init", pixelId);

  // Rastrear evento
  const eventMap: Record<string, string> = {
    pageview: "PageView",
    purchase: "Purchase",
    add_to_cart: "AddToCart",
    view_content: "ViewContent",
    initiate_checkout: "InitiateCheckout",
  };

  const fbEvent = eventMap[eventType] || "PageView";
  window.fbq("track", fbEvent, eventData);
};

// Google Analytics
const injectGoogleAnalytics = (gaId: string, eventType: string, eventData: any) => {
  if (typeof window === "undefined") return;

  // Injetar script do Google Analytics
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window.dataLayer as any).push(arguments);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", gaId);

  // Rastrear evento
  const eventMap: Record<string, string> = {
    pageview: "page_view",
    purchase: "purchase",
    add_to_cart: "add_to_cart",
    view_content: "view_item",
    initiate_checkout: "begin_checkout",
  };

  const gaEvent = eventMap[eventType] || "page_view";
  gtag("event", gaEvent, eventData);
};

// Google Ads
const injectGoogleAds = (googleAdsId: string, eventType: string, eventData: any) => {
  if (typeof window === "undefined") return;

  // Injetar script do Google Ads
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window.dataLayer as any).push(arguments);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", googleAdsId);

  // Rastrear conversão
  if (eventType === "purchase") {
    gtag("event", "conversion", {
      send_to: googleAdsId,
      value: eventData.value || 0,
      currency: eventData.currency || "BRL",
    });
  }
};

// TikTok Pixel
const injectTikTokPixel = (tiktokPixelId: string, eventType: string, eventData: any) => {
  if (typeof window === "undefined") return;

  // Injetar script do TikTok Pixel
  if (!(window as any).ttq) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js`;
    document.head.appendChild(script);

    (window as any).ttq = {
      track: (event: string, data: any) => {
        // Será preenchido pelo script
      },
    };
  }

  // Rastrear evento
  const eventMap: Record<string, string> = {
    pageview: "PageView",
    purchase: "Purchase",
    add_to_cart: "AddToCart",
    view_content: "ViewContent",
    initiate_checkout: "InitiateCheckout",
  };

  const tiktokEvent = eventMap[eventType] || "PageView";

  // Usar gtag para TikTok (via Google Tag Manager)
  if ((window as any).gtag) {
    (window as any).gtag("event", tiktokEvent, {
      send_to: `ttq_${tiktokPixelId}`,
      ...eventData,
    });
  }
};

// Custom Pixel
const injectCustomPixel = (code: string) => {
  if (typeof window === "undefined") return;

  try {
    // Executar código customizado
    const script = document.createElement("script");
    script.innerHTML = code;
    document.head.appendChild(script);
  } catch (error) {
    console.error("Erro ao injetar pixel customizado:", error);
  }
};

// Extensão de tipos globais
declare global {
  interface Window {
    fbq?: any;
    dataLayer?: any;
    gtag?: any;
    ttq?: any;
  }
}

export default PixelTracker;
