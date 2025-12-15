import React from "react";
import AdBanner from "@/components/AdBanner";

function page() {
  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-bold text-center m-5">Privacy Policy</h1>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: December 14, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how we collect, use, and protect
              your information when you use our website and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as when
              you contact us or use our services. We also automatically collect
              certain information about your device and usage of our site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              How We Use Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to provide, maintain, and
              improve our services, communicate with you, and comply with legal
              obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following third-party services on our website:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">
                  Google Analytics 4 (GA4):
                </strong>{" "}
                <span className="text-muted-foreground">
                  We use GA4 to analyze website traffic and user behavior. GA4
                  collects information about your device, browser, and
                  interactions with our site.
                </span>
              </li>
              <li>
                <strong className="text-foreground">PostHog:</strong>{" "}
                <span className="text-muted-foreground">
                  We use PostHog for product analytics to understand how users
                  interact with our features.
                </span>
              </li>
              <li>
                <strong className="text-foreground">Adstera:</strong>{" "}
                <span className="text-muted-foreground">
                  We display advertisements through Adstera on some of our sites
                  to support them. (not parcoil.com) Adstera may collect
                  information about your browsing habits.
                </span>
              </li>
              <li>
                <strong className="text-foreground">Google AdSense:</strong>{" "}
                <span className="text-muted-foreground">
                  We use Google AdSense to display relevant advertisements.
                  Google AdSense may use cookies to serve ads based on your
                  interests.
                </span>
              </li>
              <li>
                <strong className="text-foreground">
                  Google Login (on hub.parcoil.com):
                </strong>{" "}
                <span className="text-muted-foreground">
                  On our hub.parcoil.com subdomain, we offer login with Google.
                  This allows you to sign in using your Google account, and we
                  may receive basic profile information from Google.
                </span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your
              experience, analyze usage, and provide personalized content. You
              can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share information
              with service providers who assist us in operating our website, or
              when required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your
              information against unauthorized access, alteration, disclosure,
              or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have rights to access,
              correct, or delete your personal information. Please contact us to
              exercise these rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us through our contact page.
            </p>
          </section>
        </div>

        <div className="mt-8">
          <AdBanner />
        </div>
      </div>
    </div>
  );
}

export default page;
