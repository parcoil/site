import React from "react";
import AdBanner from "@/components/AdBanner";

function page() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-accent-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: August 25, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Introduction
            </h2>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our analytics tools collect simple info such as your state,
              country, and device details, including your operating system.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              How We Use Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use analytics to understand how users use our products and to
              identify errors. We serve ads to cover hosting and domain costs
              and help fund development. We do not collect data directly.
            </p>
            {/* We use analytics to figure out how users are using our products
            and catch errors. we serve ads to cover hosting and domain cost, and
            help fund develpment */}
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Third Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following third party services on our websites/apps:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">
                  (Analytics) Google Analytics 4
                </strong>
              </li>
              <li>
                <strong className="text-foreground">(Analytics) PostHog</strong>
              </li>
              <li>
                <strong className="text-foreground">(Analytics) Umami</strong>
              </li>
              <li>
                <strong className="text-foreground">(Ads) Adsterra</strong>
              </li>
              <li>
                <strong className="text-foreground">
                  (Analytics) Google AdSense
                </strong>
              </li>
              <li>
                <strong className="text-foreground">
                  Google Login (on hub.parcoil.com)
                </strong>{" "}
              </li>
            </ul>
            <p>
              <strong>We do not display ads in our desktop apps.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Cookies and Tracking
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies support Google logins or other logins in the
              future. Our analytics are used only to track user counts and
              identify errors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Data Sharing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. You can view
              the history of this on GitHub.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-accent-foreground">
              Contact Us
            </h2>
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
