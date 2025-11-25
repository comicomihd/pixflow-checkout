import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CheckoutTimerProps {
  minutes?: number;
  message?: string;
}

const CheckoutTimer = ({ minutes = 15, message = "Realize o pagamento em:" }: CheckoutTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
  }>({ minutes: 0, seconds: 0 });

  // Inicializa e atualiza o timer quando o prop 'minutes' muda
  useEffect(() => {
    setTimeLeft({ minutes, seconds: 0 });
  }, [minutes]);

  // Timer que faz a contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          return { minutes: 0, seconds: 0 };
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }

        return { minutes: prev.minutes, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isLowTime = timeLeft.minutes === 0 && timeLeft.seconds <= 30;
  const isExpired = timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className={`w-full py-4 px-6 rounded-lg border-2 flex items-center justify-center gap-4 font-bold ${
      isExpired
        ? "bg-red-600 border-red-700 shadow-lg shadow-red-600/50"
        : isLowTime
        ? "bg-gradient-to-r from-red-600 to-orange-600 border-red-700 animate-pulse shadow-lg shadow-red-600/50"
        : "bg-gradient-to-r from-orange-500 to-red-600 border-red-700 shadow-lg shadow-orange-500/50"
    }`}>
      <Clock className={`h-8 w-8 ${
        isExpired
          ? "text-white"
          : isLowTime
          ? "text-white animate-spin"
          : "text-white"
      }`} />
      
      <div className="text-center">
        <p className={`text-sm font-bold ${
          isExpired
            ? "text-white"
            : isLowTime
            ? "text-white"
            : "text-white"
        }`}>
          {message}
        </p>
        <p className={`text-4xl font-bold tabular-nums ${
          isExpired
            ? "text-white"
            : isLowTime
            ? "text-white"
            : "text-white"
        }`}>
          {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
        </p>
      </div>

      {isExpired && (
        <div className="ml-4">
          <p className="text-sm font-bold text-white">Oferta expirada!</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutTimer;
