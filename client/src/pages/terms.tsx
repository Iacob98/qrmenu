import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsOfUse() {
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

        <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
        <p className="text-gray-500 mb-8">Last updated: March 14, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using QRMenu ("the Service"), you agree to be bound by these
              Terms of Use. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              QRMenu is a SaaS platform that allows restaurant owners to create and manage
              digital menus accessible via QR codes. The Service includes menu management,
              QR code generation, AI-powered features, and analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>One person or entity may not maintain more than one free account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Upload content that infringes on intellectual property rights of others.</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Use automated tools to scrape or extract data from the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Content Ownership</h2>
            <p className="text-gray-700 leading-relaxed">
              You retain ownership of the content you upload to the Service (menu items,
              images, descriptions, etc.). By uploading content, you grant us a license
              to host, display, and distribute it as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. AI-Generated Content</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service may offer AI-powered features for generating menu descriptions
              or translations. AI-generated content is provided "as is" and you are
              responsible for reviewing and approving any such content before publication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted
              access to the Service. We may perform maintenance, updates, or modifications
              that temporarily affect availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, QRMenu shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages resulting
              from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate
              these Terms. You may delete your account at any time. Upon termination,
              your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms from time to time. We will notify registered users
              of material changes via email or in-app notification. Continued use of the
              Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, please contact us at:{" "}
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
