import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

const LAST_UPDATED = "March 1, 2026";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Overview",
      body: `Retro Gigz ("we", "us", or "our") is committed to building software that respects your privacy by design. This Privacy Policy describes how we collect, use, and protect information in connection with our website (retrogigz.com) and our products, including the Solo app.

We keep data collection to an absolute minimum. Where possible, we process data entirely on your device and never transmit it to our servers.`,
    },
    {
      title: "2. Information We Collect",
      body: `Account Data: When you create an account on retrogigz.com, we collect your email address and a securely hashed password. We do not store plaintext passwords.

Usage Data: We do not use third-party analytics. We do not install tracking pixels, fingerprinting scripts, or advertising SDKs.

Community Posts: If you submit a question or review through the Community page, your display name and message are stored on our servers and shown publicly on the site.

Contact Emails: If you contact us via email, we retain that communication for support purposes.`,
    },
    {
      title: "3. Solo App — On-Device Data",
      body: `The Solo app is built offline-first. All personal data you enter — fitness logs, food scans, budget records, and AI interactions — is stored locally on your device. This data is not transmitted to Retro Gigz or any third party unless you explicitly enable a future optional sync feature.

We do not have access to your Solo app data.`,
    },
    {
      title: "4. How We Use Your Information",
      body: `We use the information we collect only to:
• Operate and secure your account on retrogigz.com
• Respond to support and contact requests
• Display community posts you choose to submit publicly
• Protect the security of our systems (e.g., rate-limiting failed login attempts)

We do not sell, rent, or share your personal data with advertisers or data brokers.`,
    },
    {
      title: "5. Data Storage & Security",
      body: `Account data is stored in a secured database. Passwords are hashed using bcrypt with a cost factor of 12 before storage — we cannot recover your plaintext password.

Login attempts are rate-limited by IP address and email to protect against brute-force attacks. Failed login events are logged for security monitoring only.

We use HTTPS on all connections. We do not store payment information — we do not process payments on this site.`,
    },
    {
      title: "6. Cookies & Sessions",
      body: `We use a single session cookie to keep you signed in while you use the site. This cookie is essential for authentication and is not used for tracking or advertising. No third-party cookies are set by our site.`,
    },
    {
      title: "7. Your Rights",
      body: `You may request deletion of your account and associated data at any time by contacting us at support@retrogigz.com. We will process deletion requests within 30 days.

If you are a resident of the European Economic Area (EEA), you have rights under the GDPR including the right to access, correct, or erase your personal data. Contact us to exercise these rights.`,
    },
    {
      title: "8. Third-Party Services",
      body: `Our website is hosted on infrastructure we control. We do not load external fonts, analytics scripts, or advertising networks that would allow third parties to track you across the web.

The community page does not use any third-party comment platforms. All posts are stored on our own servers.`,
    },
    {
      title: "9. Children's Privacy",
      body: `Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.`,
    },
    {
      title: "10. Changes to This Policy",
      body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. Continued use of the site after changes are posted constitutes acceptance of the revised policy.`,
    },
    {
      title: "11. Contact",
      body: `If you have questions about this Privacy Policy or how we handle your data, contact us at:

Email: support@retrogigz.com
Subject: [privacy] Privacy Policy Inquiry`,
    },
  ];

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh", color: "#E6EDF3" }}>
      <PublicNav />
      <main>
        <section className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
              <p className="text-sm mt-2" style={{ color: "#8B949E" }}>
                Last updated: {LAST_UPDATED}
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{ borderColor: "#00F0FF33", color: "#00F0FF", backgroundColor: "#00F0FF0A" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Privacy-First
            </div>
          </div>

          <div className="rounded-2xl border p-6 sm:p-8 mb-8" style={{ backgroundColor: "#161B22", borderColor: "#00F0FF33" }}>
            <p className="text-sm leading-relaxed font-semibold" style={{ color: "#E6EDF3" }}>
              TL;DR: We collect only what we need to run your account. We never sell your data. 
              The Solo app keeps all your personal data on your device. You can request deletion of your account at any time.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <div key={section.title} className="rounded-2xl border p-6 sm:p-8" style={{ backgroundColor: "#161B22", borderColor: "#21262D" }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: "#E6EDF3" }}>
                  {section.title}
                </h2>
                <div className="flex flex-col gap-3">
                  {section.body.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#8B949E" }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
