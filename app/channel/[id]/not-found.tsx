import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Channel Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The channel you&apos;re looking for doesn&apos;t exist or is unavailable.
          This could be because:
        </p>
        <ul className="text-left text-gray-600 max-w-md mx-auto mb-8 space-y-2">
          <li>• The channel ID is incorrect</li>
          <li>• The channel has been deleted or made private</li>
          <li>• There was an error accessing the YouTube API</li>
        </ul>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 