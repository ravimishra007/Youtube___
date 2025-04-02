import SearchBar from '@/app/components/SearchBar';
import SearchResults from '@/app/components/SearchResults';
import Loading from '@/app/components/Loading';
import { Suspense } from 'react';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() || '';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar initialQuery={query} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {query ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Search Results for &quot;{query}&quot;
              </h1>
              <Suspense fallback={<Loading />}>
                <SearchResults query={query} />
              </Suspense>
            </>
          ) : (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Search for YouTube Channels
              </h1>
              <p className="text-gray-600">
                Enter a search term above to find channels
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 