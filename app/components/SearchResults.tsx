'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiExternalLink, FiUsers, FiVideo, FiEye, FiAlertCircle } from 'react-icons/fi';
import { searchChannels, formatCount } from '@/app/utils/youtube';
import type { YouTubeChannel } from '@/app/utils/youtube';
import Loading from './Loading';

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchResults() {
      if (!query.trim()) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setChannels([]);
      
      try {
        console.log('Searching for:', query);
        const results = await searchChannels(query);
        console.log('Search results:', results);
        
        if (isMounted) {
          setChannels(results);
        }
      } catch (err: any) {
        console.error('Search error:', err);
        if (isMounted) {
          setError(
            err?.message || 'Failed to fetch search results. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
          <FiAlertCircle className="h-6 w-6" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <p className="text-gray-600 mb-6">
          This could be due to:
          <ul className="mt-2 list-disc list-inside">
            <li>API key configuration issues</li>
            <li>Network connectivity problems</li>
            <li>YouTube API service disruption</li>
          </ul>
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No channels found for &quot;{query}&quot;</p>
        <p className="text-gray-500 mt-2">
          Suggestions:
          <ul className="mt-2 list-disc list-inside">
            <li>Check the spelling of your search term</li>
            <li>Try using fewer or different keywords</li>
            <li>Try searching for a more general term</li>
          </ul>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {channels.map((channel) => (
        <Link
          key={channel.id}
          href={`/channel/${channel.id}`}
          className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
        >
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={channel.snippet.thumbnails.default.url}
                  alt={channel.snippet.title}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                  {channel.snippet.title}
                  <FiExternalLink className="text-blue-500 h-5 w-5" />
                </h2>
                <p className="text-gray-700 line-clamp-2 mb-4">{channel.snippet.description}</p>
                
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-blue-500" />
                    <span className="font-semibold">{formatCount(channel.statistics.subscriberCount)}</span> subscribers
                  </div>
                  <div className="flex items-center gap-2">
                    <FiVideo className="text-green-500" />
                    <span className="font-semibold">{formatCount(channel.statistics.videoCount)}</span> videos
                  </div>
                  <div className="flex items-center gap-2">
                    <FiEye className="text-purple-500" />
                    <span className="font-semibold">{formatCount(channel.statistics.viewCount)}</span> views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 