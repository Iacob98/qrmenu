import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: March 14, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              QRMenu ("we", "our", or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our web application and related services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Account Information:</strong> email address, name, and password when you register.</li>
              <li><strong>Restaurant Data:</strong> restaurant name, city, phone number, menu items, and related content you provide.</li>
              <li><strong>Usage Data:</strong> pages visited, features used, timestamps, browser type, and device information.</li>
              <li><strong>Analytics Data:</strong> aggregated and anonymized data collected via Google Analytics to improve our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>To provide, maintain, and improve our services.</li>
              <li>To create and manage your account.</li>
              <li>To process your restaurant menu data and generate QR codes.</li>
              <li>To send you service-related communications.</li>
              <li>To analyze usage patterns and improve user experience.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal data. We may share information with third-party
              service providers who assist us in operating our platform (e.g., hosting,
              analytics, AI services). These providers are contractually obligated to protect
              your data and use it only for the purposes we specify.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your data, including
              encryption in transit (HTTPS), secure password hashing, and access controls.
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data for as long as your account is active or as
              needed to provide you services. You may request deletion of your account
              and associated data at any time by contacting us.
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We use cookies and similar technologies for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Essential Cookies:</strong> required for authentication and core functionality.</li>
              <li><strong>Analytics Cookies:</strong> help us understand how visitors interact with our platform (Google Analytics).</li>
              <li><strong>Preference Cookies:</strong> store your language and display preferences.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              You can control cookies through your browser settings. Disabling essential cookies
              may affect the functionality of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              Depending on your jurisdiction, you may have the right to access, correct,
              delete, or export your personal data. To exercise these rights, please
              contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:support@qrmenu.app" className="text-blue-600 hover:underline">
                support@qrmenu.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
