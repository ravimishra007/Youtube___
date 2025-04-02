import { Suspense } from 'react';
import { getTrendingVideos, getPopularChannels } from './utils/youtube';
import SearchBar from './components/SearchBar';
import PopularChannelsStrip from './components/PopularChannelsStrip';
import TrendingVideos from '@/app/components/TrendingVideos';
import Loading from './components/Loading';
import { FiTrendingUp, FiBarChart2, FiPieChart } from 'react-icons/fi';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour as a number

async function fetchHomePageData() {
  try {
    const [trendingVideos, popularChannels] = await Promise.allSettled([
      getTrendingVideos(12),
      getPopularChannels(10)
    ]);

    return {
      videos: trendingVideos.status === 'fulfilled' ? trendingVideos.value : [],
      channels: popularChannels.status === 'fulfilled' ? popularChannels.value : []
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return { videos: [], channels: [] };
  }
}

export default async function HomePage() {
  const { videos, channels } = await fetchHomePageData();

  return (
    <main className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        {/* Navbar */}
        <div className="border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                YTAnalytics
              </Link>
              <div className="flex space-x-8">
                <Link href="/" className="text-blue-100 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/#trending" className="text-blue-100 hover:text-white transition-colors">
                  Trending
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative pt-12 pb-20 sm:pt-16 sm:pb-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                YouTube Analytics Hub
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-blue-100">
                Discover trending content, analyze performance, and gain valuable insights
              </p>
              <div className="mt-10 max-w-xl mx-auto">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Channels Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Channels</h2>
          </div>
          <Suspense fallback={<Loading />}>
            <PopularChannelsStrip channels={channels} />
          </Suspense>
        </div>
      </section>

      {/* Trending Videos Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trending Videos</h2>
          </div>
          <Suspense fallback={<Loading />}>
            <TrendingVideos videos={videos} />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl">
                  <FiTrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-900">Real-time Trends</h3>
              </div>
              <p className="text-gray-600">Track trending videos and channels with live metrics and analytics</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl">
                  <FiBarChart2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-900">Deep Analytics</h3>
              </div>
              <p className="text-gray-600">Comprehensive analytics and insights for channel performance</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl">
                  <FiPieChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-900">Audience Insights</h3>
              </div>
              <p className="text-gray-600">Detailed audience demographics and engagement metrics</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
