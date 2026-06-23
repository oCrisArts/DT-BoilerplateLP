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

export default function Contact() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
    >
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-foreground tracking-[-0.02em] mb-6">
              Contact Us
            </h1>
            <p className="text-base text-muted-foreground mb-12 leading-relaxed">
              Have questions or feedback? We'd love to hear from you.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Get in Touch
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  For support, inquiries, or feedback, please reach out to us via email. 
                  We typically respond within 24-48 hours.
                </p>
                
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/50">
                  <MI icon="email" size={24} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <a 
                      href="mailto:support@dsboilerplate.com" 
                      className="text-base font-medium text-foreground hover:text-accent transition-colors"
                    >
                      support@dsboilerplate.com
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Figma Community
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                  Join our Figma Community to connect with other users, share your design systems, 
                  and get tips and tricks.
                </p>
                
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <MI icon="groups" size={16} style={{ color: "#fff" }} />
                  Join Community
                </a>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Bug Reports & Feature Requests
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Found a bug or have a feature idea? Let us know! We're constantly improving 
                  DS Boilerplate based on user feedback.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Business Inquiries
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  For partnership opportunities, enterprise solutions, or other business inquiries, 
                  please contact us at the email above with "Business" in the subject line.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
