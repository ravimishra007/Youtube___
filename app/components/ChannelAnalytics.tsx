'use client';

import { useState, useRef } from 'react';
import { FiUsers, FiEye, FiTrendingUp, FiGlobe, FiCalendar, FiAward, FiDollarSign, 
  FiMessageSquare, FiThumbsUp, FiTwitter, FiInstagram, FiFacebook, FiYoutube, FiHash, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import { formatCount, formatDuration } from '@/app/utils/youtube';
import Loading from './Loading';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChannelAnalyticsProps {
  channel: any;
  videos: any[];
  playlists: any[];
  competitors: any[];
}

export default function ChannelAnalytics({ channel, videos = [], playlists = [], competitors = [] }: ChannelAnalyticsProps) {
  

  const [timeRange, setTimeRange] = useState('28D');
  
  // Add refs for scrolling
  const competitorsRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);
  const playlistsRef = useRef<HTMLDivElement>(null);

  if (!channel || !channel.snippet) {
    return <Loading />;
  }

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Format channel data
  const channelStats = {
    name: channel.snippet.title,
    description: channel.snippet.description,
    subscribers: formatCount(channel.statistics.subscriberCount),
    views: formatCount(channel.statistics.viewCount),
    country: channel.snippet.country || 'Global',
    category: channel.snippet.categoryId,
    socialMedia: {
      youtube: `https://youtube.com/channel/${channel.id}`,
      // Note: These would need to be fetched from channel.brandingSettings if available
      twitter: channel.brandingSettings?.channel?.unsubscribedTrailer || '',
      instagram: '',
      facebook: ''
    },
    keywords: channel.brandingSettings?.channel?.keywords?.split('|') || [],
    rank: {
      global: "#347", // This would need a separate API or service
      category: "#72",
      country: "#7"
    }
  };

  // Format video data
  const formattedVideos = videos.map((video: any) => ({
    id: video.id,
    thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
    title: video.snippet.title,
    views: formatCount(video.statistics.viewCount),
    likes: formatCount(video.statistics.likeCount),
    comments: formatCount(video.statistics.commentCount),
    duration: formatDuration(video.contentDetails.duration),
    publishedAt: new Date(video.snippet.publishedAt).toLocaleDateString()
  }));

  // Format playlist data
  const formattedPlaylists = playlists.map((playlist: any) => ({
    id: playlist.id,
    thumbnail: playlist.snippet.thumbnails.maxres?.url || playlist.snippet.thumbnails.high?.url || playlist.snippet.thumbnails.default.url,
    title: playlist.snippet.title,
    videoCount: playlist.contentDetails.itemCount,
    totalViews: 'N/A', // This would need additional API calls
    lastUpdated: new Date(playlist.snippet.publishedAt).toLocaleDateString()
  }));

  // Format competitor data
  const formattedCompetitors = competitors.map((competitor: any) => ({
    name: competitor.snippet.title,
    subscribers: formatCount(competitor.statistics.subscriberCount),
    views: formatCount(competitor.statistics.viewCount),
    category: competitor.snippet.categoryId,
    avatar: competitor.snippet.thumbnails.default.url
  }));

  const viewsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Views',
        data: [65, 59, 80, 81, 56, 55],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const subscriberData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Subscribers',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Channel Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <img
              src={channel.snippet.thumbnails.maxres?.url || channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default.url}
              alt={channel.snippet.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{channel.snippet.title}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {channel.snippet.categoryId}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FiUsers className="w-5 h-5" />
                  <span>Subscribers</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCount(channel.statistics.subscriberCount)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FiEye className="w-5 h-5" />
                  <span>Total Views</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCount(channel.statistics.viewCount)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FiGlobe className="w-5 h-5" />
                  <span>Country Rank</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">#{channel.snippet.country || 'Global'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FiAward className="w-5 h-5" />
                  <span>Category Rank</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">#{channel.snippet.categoryId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Description and Social Links */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-700">About Channel</h3>
          <p className="text-gray-600">{channel.snippet.description}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <a href={`https://youtube.com/channel/${channel.id}`} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-red-600 transition-colors">
              <FiYoutube className="w-6 h-6" />
            </a>
            <a href={channel.brandingSettings?.channel?.unsubscribedTrailer} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-400 transition-colors">
              <FiTwitter className="w-6 h-6" />
            </a>
            <a href={channel.brandingSettings?.channel?.unsubscribedTrailer} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition-colors">
              <FiInstagram className="w-6 h-6" />
            </a>
            <a href={channel.brandingSettings?.channel?.unsubscribedTrailer} target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors">
              <FiFacebook className="w-6 h-6" />
            </a>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {channel.brandingSettings?.channel?.keywords?.split('|').map((keyword: string) => (
                <span key={keyword} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
                  <FiHash className="w-3 h-3" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Avg. Views</h3>
            <FiEye className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCount(channel.statistics.viewCount) || 'N/A'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Avg. Likes</h3>
            <FiThumbsUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCount(channel.statistics.likeCount) || 'N/A'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Avg. Comments</h3>
            <FiMessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCount(channel.statistics.commentCount) || 'N/A'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Engagement Rate</h3>
            <FiTrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{channel.statistics.likeCount ? `${((channel.statistics.likeCount / channel.statistics.viewCount) * 100).toFixed(2)}%` : 'N/A'}</div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {['7D', '28D', '90D', '1Y'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Views</h3>
            <FiEye className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCount(channel.statistics.viewCount) || 'N/A'}
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <FiTrendingUp />
            <span>+12.5% vs last period</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Subscribers Gained</h3>
            <FiUsers className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCount(channel.statistics.subscriberCount) || 'N/A'}
          </div>
          <div className="text-sm text-red-600 flex items-center gap-1">
            <FiTrendingUp className="transform rotate-180" />
            <span>-5.2% vs last period</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Estimated Revenue</h3>
            <FiDollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {channel.statistics.estimatedRevenue ? `$${channel.statistics.estimatedRevenue.amount} ${channel.statistics.estimatedRevenue.currency}` : 'N/A'}
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <FiTrendingUp />
            <span>+8.3% vs last period</span>
          </div>
        </div>
      </div>

      {/* Top Videos */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Top Videos</h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(videosRef, 'left')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(videosRef, 'right')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div 
          ref={videosRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {formattedVideos.map((video) => (
            <div key={video.id} className="flex-none w-80">
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiThumbsUp className="w-4 h-4" />
                      {video.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMessageSquare className="w-4 h-4" />
                      {video.comments}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{video.publishedAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Playlists */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Top Playlists</h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(playlistsRef, 'left')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(playlistsRef, 'right')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div 
          ref={playlistsRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {formattedPlaylists.map((playlist) => (
            <div key={playlist.id} className="flex-none w-80">
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="relative">
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                    <FiList className="w-4 h-4" />
                    {playlist.videoCount} videos
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{playlist.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      {playlist.totalViews}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {playlist.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Channels - Modified for horizontal scroll */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Similar Channels</h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(competitorsRef, 'left')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(competitorsRef, 'right')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div 
          ref={competitorsRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {formattedCompetitors.map((competitor) => (
            <div key={competitor.name} className="flex-none w-72 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={competitor.avatar}
                    alt={competitor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                  <p className="text-sm text-gray-600">{competitor.category}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Subscribers</p>
                  <p className="font-semibold text-gray-900">{competitor.subscribers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Views</p>
                  <p className="font-semibold text-gray-900">{competitor.views}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Views Trend</h3>
          <Line data={viewsData} options={{ responsive: true }} />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Subscriber Growth</h3>
          <Bar data={subscriberData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Age Distribution</h3>
          <div className="space-y-4">
            {channel.statistics.ageGroups?.map((group: any) => (
              <div key={group.age}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{group.age}</span>
                  <span>{group.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Countries</h3>
          <div className="space-y-4">
            {channel.statistics.topCountries?.map((country: any) => (
              <div key={country.country}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{country.country}</span>
                  <span>{country.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 