export default function LandingPage() {
  return (
    <>
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tighter mb-6">
              6th Agent Platform
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Modern SaaS platform for ROSTR-powered agent orchestration with JWT authentication, multi-tenant workspaces, and usage-based billing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Sign In to Dashboard
              </a>
              <a
                href="https://6th-agent-platform.vercel.app/api/v2/free-test"
                target="_blank"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                View API Documentation
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-emerald-600 text-2xl mb-4">✓</div>
                <h3 className="text-xl font-semibold mb-3">Modern Authentication</h3>
                <p className="text-gray-600">
                  Full JWT authentication with login/signup flows, token verification, and secure endpoints.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-emerald-600 text-2xl mb-4">✓</div>
                <h3 className="text-xl font-semibold mb-3">Multi-Tenant Workspaces</h3>
                <p className="text-gray-600">
                  Team-based workspace management with role-based access and collaboration features.
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-emerald-600 text-2xl mb-4">✓</div>
                <h3 className="text-xl font-semibold mb-3">Usage Analytics</h3>
                <p className="text-gray-600">
                  Comprehensive analytics dashboard with cost tracking and performance monitoring.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">🚀 Live Demo</h2>
              <p className="text-gray-600 mb-6">
                The platform is fully deployed and working on Vercel with real authentication.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Test Account:</h3>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-mono text-gray-800">Email: patrick.diamitani@gmail.com</p>
                    <p className="font-mono text-gray-800">Password: test123</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">API Endpoint:</h3>
                  <div className="bg-white p-4 rounded-lg border font-mono text-sm text-emerald-600 break-all">
                    https://6th-agent-platform.vercel.app/api/v2/free-test
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500">
              <p>
                Backend: FastAPI + Vercel • Frontend: Next.js • Authentication: JWT • Database: Supabase
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}