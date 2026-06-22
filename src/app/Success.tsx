import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MI({
  icon,
  size = 20,
  fill = 0,
  className = "",
  style = {},
}: {
  icon: string;
  size?: number;
  fill?: 0 | 1;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-background text-foreground flex items-center justify-center"
      style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
    >
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34, 197, 94, 0.1)" }}
          >
            <MI icon="check_circle" size={48} style={{ color: "#22c55e" }} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">
          Payment Successful!
        </h1>

        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Thank you for your purchase! Your Design System generation access has been activated.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <MI icon="arrow_forward" size={16} style={{ color: "#fff" }} />
            Return to Home
          </button>

          <p className="text-xs text-muted-foreground">
            You will be redirected automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
