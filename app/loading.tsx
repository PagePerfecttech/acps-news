export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading FlipNEWS</h2>
        <p className="text-gray-500">Please wait while we load the latest news...</p>
      </div>
    </div>
  );
}
