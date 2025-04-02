import { notFound } from 'next/navigation';
import { getChannelDetails, getChannelVideos, getSimilarChannels, getChannelPlaylists, type YouTubeChannel, type YouTubePlaylist } from '@/app/utils/youtube';
import Image from 'next/image';
import { FiUsers, FiEye, FiVideo, FiHome, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

// interface PageParams {
//   params: {
//     id: string;
//   };
// }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { 
  const id = (await params).id;

  const channel = await getChannelDetails(id); 
  if (!channel) return { title: 'Channel Not Found' };
  return {
    title: `${channel.snippet.title} - YouTube Analytics`,
    description: channel.snippet.description,
  };
}

async function fetchChannelData(channelId: string) {
  const [channelDetails, videos, playlists, similarChannels] = await Promise.allSettled([
    getChannelDetails(channelId),
    getChannelVideos(channelId, 8),
    getChannelPlaylists(channelId, 6),
    getSimilarChannels(channelId, 5)
  ]);

  return {
    channel: channelDetails.status === 'fulfilled' ? channelDetails.value : null,
    videos: videos.status === 'fulfilled' ? videos.value : [],
    playlists: playlists.status === 'fulfilled' ? playlists.value : [],
    similarChannels: similarChannels.status === 'fulfilled' ? similarChannels.value : []
  };
}

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  const { channel, videos, playlists, similarChannels } = await fetchChannelData(id); 
  
  if (!channel) {
    notFound();
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                YTAnalytics
              </Link>
              <div className="flex space-x-8">
                <Link href="/" className="text-blue-100 hover:text-white transition-colors flex items-center gap-2">
                  <FiHome className="h-5 w-5" />
                  Home
                </Link>
                <Link href="/trending" className="text-blue-100 hover:text-white transition-colors flex items-center gap-2">
                  <FiTrendingUp className="h-5 w-5" />
                  Trending
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
              <Image
                src={channel.snippet.thumbnails.default.url}
                alt={channel.snippet.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{channel.snippet.title}</h1>
              <p className="text-blue-100">@{channel.snippet.customUrl || channel.id}</p>
              <p className="text-blue-100 mt-2">Joined {formatDate(channel.snippet.publishedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(parseInt(channel.statistics.subscriberCount))}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg">
                <FiEye className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(parseInt(channel.statistics.viewCount))}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg">
                <FiVideo className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Videos</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(parseInt(channel.statistics.videoCount))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{channel.snippet.description}</p>
            </div>

            {/* Similar Channels */}
            {similarChannels.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Channels</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarChannels.map((similar: YouTubeChannel) => (
                    <Link
                      key={similar.id}
                      href={`/channel/${similar.id}`}
                      className="flex items-center gap-4 group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={similar.snippet.thumbnails.medium?.url || similar.snippet.thumbnails.default.url}
                          alt={similar.snippet.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                          {similar.snippet.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatNumber(parseInt(similar.statistics.subscriberCount))} subscribers
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Videos */}
            {videos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {videos.map((video) => (
                    <a
                      key={video.id}
                      href={`https://youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        <Image
                          src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url}
                          alt={video.snippet.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                        {video.snippet.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatNumber(parseInt(video.statistics?.viewCount || '0'))} views
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Playlists */}
            {playlists.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Playlists</h2>
                <div className="space-y-4">
                  {playlists.map((playlist: YouTubePlaylist) => (
                    <a
                      key={playlist.id}
                      href={`https://youtube.com/playlist?list=${playlist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                        <Image
                          src={playlist.snippet.thumbnails.high?.url || playlist.snippet.thumbnails.default.url}
                          alt={playlist.snippet.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                        {playlist.snippet.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {playlist.contentDetails?.itemCount || 0} videos
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 