'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiUsers, FiVideo } from 'react-icons/fi';
// import { formatCount } from '@/app/utils/youtube';

interface Channel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails: {
      default: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
  statistics: {
    subscriberCount: string;
    viewCount: string;
    videoCount: string;
  };
}

interface PopularChannelsStripProps {
  channels: Channel[];
}

export default function PopularChannelsStrip({ channels }: PopularChannelsStripProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    scrollContainerRef.current?.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      scrollContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleChannelClick = (channelId: string) => {
    router.push(`/channel/${channelId}`);
  };

  if (!channels?.length) return null;

  return (
    <div className="relative group">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-6"
        >
          <FiChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      )}
      
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => handleChannelClick(channel.id)}
            className="flex-none w-[300px] bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="relative h-40 rounded-t-2xl overflow-hidden">
              <Image
                src={channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default.url}
                alt={channel.snippet.title}
                fill
                className="object-cover"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg line-clamp-1">{channel.snippet.title}</h3>
                {channel.snippet.customUrl && (
                  <p className="text-blue-200 text-sm">@{channel.snippet.customUrl}</p>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <FiUsers className="text-blue-500" />
                  <span>{parseInt(channel.statistics.subscriberCount).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiVideo className="text-green-500" />
                  <span>{parseInt(channel.statistics.videoCount).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{channel.snippet.description}</p>
            </div>
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-6"
        >
          <FiChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      )}
    </div>
  );
} 