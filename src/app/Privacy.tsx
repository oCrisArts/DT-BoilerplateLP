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

export default function Privacy() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
    >
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-foreground tracking-[-0.02em] mb-6">
              Privacy Policy
            </h1>
            <p className="text-base text-muted-foreground mb-12 leading-relaxed">
              Last updated: January 2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Information We Collect
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or communicate with us. This may include your name, email address, 
                  and payment information processed through Stripe.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, 
                  process transactions, send you technical notices and support messages, and respond 
                  to your comments and questions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Information Sharing
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share your information with 
                  third-party service providers who perform services on our behalf, such as payment 
                  processing (Stripe) and data hosting (Supabase).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Data Security
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Your Rights
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal information. 
                  You may also opt out of certain communications from us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Contact Us
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us through 
                  our contact page.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
