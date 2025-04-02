'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {  FiTag, FiEye, FiThumbsUp, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatCount, type YouTubeVideo } from '@/app/utils/youtube';
import { getTrendingVideos } from '@/app/utils/youtube';

interface Video {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    tags?: string[];
    categoryId?: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface Category {
  id: string;
  snippet: {
    title: string;
  };
}

const VIDEO_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: '20', name: 'Gaming' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News' },
  { id: '17', name: 'Sports' },
  { id: '23', name: 'Comedy' },
  { id: '10', name: 'Music' },
  { id: '28', name: 'Science & Tech' },
  { id: '22', name: 'People & Blogs' },
  { id: '27', name: 'Education' },
  { id: '2', name: 'Cars & Vehicles' },
  { id: '15', name: 'Pets & Animals' },
  { id: '26', name: 'How-to & Style' },
  { id: '19', name: 'Travel & Events' },
];

// Add topic mapping
const TOPIC_NAMES: { [key: string]: string } = {
  '/m/04rlf': 'Music',
  '/m/02mscn': 'Christian music',
  '/m/0glt670': 'Hip hop music',
  '/m/06by7': 'Rock music',
  '/m/03_d0': 'Jazz',
  '/m/0g293': 'Pop music',
  '/m/064t9': 'Pop rock',
  '/m/0gywn': 'Classical music',
  '/m/0bzvm2': 'Gaming',
  '/m/02jjt': 'Entertainment',
  '/m/098wr': 'Society',
  '/m/09s1f': 'Politics',
  '/m/01k8wb': 'Knowledge',
  '/m/01h6rj': 'Lifestyle',
  '/m/07c1v': 'Technology',
  '/m/019_rr': 'Vehicles',
  '/m/07bxq': 'Tourism',
  '/m/032tl': 'Fashion',
  '/m/027x7n': 'Fitness',
  '/m/02wbm': 'Food',
  '/m/0f2f9': 'Pets',
  '/m/068hy': 'Religion',
  '/m/041xxh': 'Comedy',
  '/m/05qjc': 'Nature',
  // '/m/019_rr': 'Automobiles',
  // '/m/07c1v': 'Technology',
  // '/m/01k8wb': 'Education'
};

interface TrendingVideosProps {
  videos?: YouTubeVideo[];
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

const VIDEOS_PER_PAGE = 12;

export default function TrendingVideos({ videos: initialVideos = [] }: TrendingVideosProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(initialVideos);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const trendingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset page when category changes
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    // Scroll to trending section if URL has #trending
    if (window.location.hash === '#trending' && trendingSectionRef.current) {
      trendingSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching trending videos for category: ${selectedCategory}`);
        const videosData = await getTrendingVideos(100, selectedCategory);
        console.log(`Received ${videosData.length} videos`);
        setVideos(videosData);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to fetch trending videos');
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch if we don't have initial videos or if a category is selected
    if (initialVideos.length === 0 || selectedCategory !== 'all') {
      fetchVideos();
    } else {
      console.log(`Using ${initialVideos.length} initial videos`);
      setVideos(initialVideos);
      setIsLoading(false);
    }
  }, [initialVideos, selectedCategory]);

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const handleChannelClick = (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/channel/${channelId}`, '_blank');
  };

  console.log(`Total videos: ${videos.length}`);
  console.log(`Current page: ${currentPage}`);
  
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  console.log(`Total pages: ${totalPages}`);
  
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const paginatedVideos = videos.slice(startIndex, endIndex);
  console.log(`Showing videos ${startIndex + 1} to ${endIndex}`);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of videos section
    trendingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div ref={trendingSectionRef} className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {VIDEO_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedVideos.map((video) => {
          const category = categories.find(c => c.id === video.snippet.categoryId);
          const topics = video.topicDetails?.relevantTopicIds
            ?.map((id: string) => TOPIC_NAMES[id])
            .filter(Boolean)
            .slice(0, 3) || [];
          
          return (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video.id)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative aspect-video rounded-t-xl overflow-hidden">
                <Image
                  src={video.snippet.thumbnails.maxres?.url || 
                       video.snippet.thumbnails.high?.url || 
                       video.snippet.thumbnails.medium?.url || 
                       video.snippet.thumbnails.default?.url || 
                       '/placeholder-thumbnail.jpg'}
                  alt={video.snippet.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600">
                  {video.snippet.title}
                </h3>
                <button
                  onClick={(e) => handleChannelClick(video.snippet.channelId, e)}
                  className="text-blue-600 text-sm mb-3 hover:text-blue-800"
                >
                  {video.snippet.channelTitle}
                </button>

                {/* Display topics if available */}
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {topics.map((topic: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1"
                      >
                        <FiTag className="w-3 h-3" />
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Display tags if available */}
                {video.snippet.tags && video.snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {video.snippet.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {category && (
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mb-2">
                    {category.snippet.title}
                  </span>
                )}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FiEye className="text-gray-400" />
                      {formatCount(video.statistics.viewCount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiThumbsUp className="text-gray-400" />
                      {formatCount(video.statistics.likeCount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMessageSquare className="text-gray-400" />
                      {formatCount(video.statistics.commentCount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const isCurrentPage = pageNumber === currentPage;
            const isNearCurrentPage = Math.abs(pageNumber - currentPage) <= 1;
            const isFirstOrLast = pageNumber === 1 || pageNumber === totalPages;

            if (!isNearCurrentPage && !isFirstOrLast) {
              if (pageNumber === 2 || pageNumber === totalPages - 1) {
                return <span key={pageNumber} className="text-gray-400">...</span>;
              }
              return null;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`w-10 h-10 rounded-lg ${
                  isCurrentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
} 