'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCount } from '@/app/utils/youtube';

interface Channel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
    };
  };
  statistics: {
    subscriberCount: string;
    viewCount: string;
    videoCount: string;
  };
}

interface PopularChannelsProps {
  channels: Channel[];
}

export default function PopularChannels({ channels }: PopularChannelsProps) {
  const router = useRouter();

  const handleChannelClick = (channelId: string) => {
    router.push(`/channel/${channelId}`);
  };

  if (!channels?.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Popular Channels</h2>
        <p className="text-gray-500">No channels available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Popular Channels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
            onClick={() => handleChannelClick(channel.id)}
          >
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={channel.snippet.thumbnails.default.url}
                alt={channel.snippet.title}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2 line-clamp-1">
              {channel.snippet.title}
            </h3>
            <div className="flex flex-col items-center text-sm text-gray-600 space-y-1">
              <p>{formatCount(channel.statistics.subscriberCount)} subscribers</p>
              <p>{formatCount(channel.statistics.videoCount)} videos</p>
              <p>{formatCount(channel.statistics.viewCount)} views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 