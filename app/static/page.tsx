import Link from 'next/link';

export default function StaticPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Static Page</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-700 mb-4">
            This is a completely static version of the home page. It doesn&apos;t rely on any dynamic data
            or complex components, making it a reliable fallback when there are issues with the main application.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-700">
              The main application is currently experiencing technical difficulties. Our team is working to resolve the issue.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sample News</h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg">Global Tech Summit Announces Breakthrough in AI Research</h3>
              <p className="text-sm text-gray-500 mb-2">May 15, 2023 • Technology</p>
              <p className="text-gray-700">
                Scientists announce major AI breakthrough at Global Tech Summit with potential to transform multiple industries.
              </p>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-medium text-lg">New Climate Policy Receives Bipartisan Support</h3>
              <p className="text-sm text-gray-500 mb-2">May 14, 2023 • Politics</p>
              <p className="text-gray-700">
                Lawmakers unite across party lines to back ambitious climate legislation targeting 50% emissions reduction by 2030.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg">Local Community Garden Project Expands</h3>
              <p className="text-sm text-gray-500 mb-2">May 13, 2023 • Community</p>
              <p className="text-gray-700">
                Neighborhood initiative doubles in size, providing fresh produce and educational opportunities for residents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Main Page
          </Link>

          <Link
            href="/minimal"
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600"
          >
            Try Minimal Page
          </Link>
        </div>
      </div>
    </div>
  );
}
