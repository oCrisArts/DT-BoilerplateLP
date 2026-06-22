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

export default function Cancel() {
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
            style={{ background: "rgba(239, 68, 68, 0.1)" }}
          >
            <MI icon="cancel" size={48} style={{ color: "#ef4444" }} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">
          Payment Cancelled
        </h1>

        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <MI icon="home" size={16} style={{ color: "#fff" }} />
            Return to Home
          </button>

          <button
            onClick={() => navigate("/#pricing")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <MI icon="shopping_cart" size={16} />
            Try Again
          </button>

          <p className="text-xs text-muted-foreground">
            You will be redirected automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
