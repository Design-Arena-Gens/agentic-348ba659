import Link from 'next/link';
import { FileText, Table, RefreshCw, Shield, Zap, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DocProcess</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          All Your Document Tools<br />
          <span className="text-blue-600">In One Place</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Process PDFs, Excel, Word, and images with our comprehensive suite of tools.
          Merge, split, convert, and edit documents effortlessly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
            Start Free Trial
          </Link>
          <Link href="/dashboard" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50">
            Try Demo
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="w-12 h-12 text-blue-600" />}
            title="PDF Tools"
            description="Merge, split, compress, edit, sign, and protect PDF documents with ease."
          />
          <FeatureCard
            icon={<Table className="w-12 h-12 text-green-600" />}
            title="Excel & CSV"
            description="Manage spreadsheets, clean data, and convert between formats effortlessly."
          />
          <FeatureCard
            icon={<RefreshCw className="w-12 h-12 text-purple-600" />}
            title="File Converters"
            description="Convert between PDF, Word, Excel, PPT, JPG, and TXT formats seamlessly."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-red-600" />}
            title="Secure Processing"
            description="Your files are encrypted and automatically deleted after 24 hours."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-600" />}
            title="Fast & Reliable"
            description="Process documents quickly with our optimized cloud infrastructure."
          />
          <FeatureCard
            icon={<Users className="w-12 h-12 text-indigo-600" />}
            title="Team Collaboration"
            description="Share and collaborate on documents with your team members."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            features={[
              'Basic PDF tools',
              'Up to 5MB file size',
              '10 files per day',
              'Standard processing',
            ]}
            ctaText="Get Started"
            ctaLink="/auth/register"
          />
          <PricingCard
            name="Pro"
            price="$9.99"
            features={[
              'All document tools',
              'Up to 100MB file size',
              'Unlimited files',
              'Priority processing',
              'Batch processing',
              'No watermarks',
            ]}
            ctaText="Start Free Trial"
            ctaLink="/auth/register"
            highlighted
          />
          <PricingCard
            name="Enterprise"
            price="$49.99"
            features={[
              'All Pro features',
              'Up to 500MB file size',
              'API access',
              'Custom branding',
              'SLA support',
              'Team collaboration',
            ]}
            ctaText="Contact Sales"
            ctaLink="/auth/register"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-6 h-6" />
            <span className="text-xl font-bold">DocProcess</span>
          </div>
          <p className="text-gray-400">© 2024 DocProcess. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  ctaText,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`bg-white p-8 rounded-xl shadow-lg ${highlighted ? 'ring-2 ring-blue-600 transform scale-105' : ''}`}>
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="text-4xl font-bold mb-6">
        {price}
        <span className="text-lg text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block text-center py-3 px-6 rounded-lg font-semibold ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
