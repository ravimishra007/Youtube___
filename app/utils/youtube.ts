interface YouTubeChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  country?: string;
}

export interface YouTubeChannel {
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
    publishedAt: string;
  };
  statistics: YouTubeChannelStats;
  brandingSettings?: {
    image?: {
      bannerExternalUrl?: string;
    };
  };
}

 export interface YouTubeVideo { 
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium?: { url: string };
      high?: { url: string };
      maxres?: { url: string };
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
  topicDetails?: {
    relevantTopicIds: string[];
  };
}

export interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
  contentDetails?: {
    itemCount: number;
  };
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

const BASE_URL = process.env.YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3';

// Helper function to format large numbers
export const formatCount = (count: number | string): string => {
  const num = typeof count === 'string' ? parseInt(count) : count;
  if (isNaN(num)) return '0';
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Helper function to format duration
export const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [];
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes.padStart(2, '0')}:`;
  result += seconds.padStart(2, '0');
  return result;
};

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url: string) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured. Please add your API key to the .env.local file.');
  }

  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `YouTube API error: ${response.status} ${response.statusText}. ${data.error?.message || ''}`
      );
    }

    cache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching from YouTube API:', error);
    throw error;
  }
}

interface YouTubeApiResponse {
  items: any[];
  nextPageToken?: string;
}

// Get trending videos
export async function getTrendingVideos(maxResults = 100, categoryId?: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    console.log(`Fetching up to ${maxResults} trending videos${categoryId ? ` for category ${categoryId}` : ''}...`);
    const requests: YouTubeApiResponse[] = [];
    const pageSize = 50;
    const numRequests = Math.ceil(maxResults / pageSize);

    for (let i = 0; i < numRequests; i++) {
      const pageToken: string = i === 0 ? '' : `&pageToken=${requests[i - 1].nextPageToken}`;
      const videoCategoryId = categoryId && categoryId !== 'all' ? `&videoCategoryId=${categoryId}` : '';
      const url: string = `${BASE_URL}/videos?part=snippet,statistics,topicDetails&chart=mostPopular&regionCode=US&maxResults=${pageSize}${videoCategoryId}${pageToken}&key=${YOUTUBE_API_KEY}`;
      
      console.log(`Fetching page ${i + 1} of ${numRequests}...`);
      const data: YouTubeApiResponse = await fetchWithCache(url);
      console.log(`Received ${data.items?.length || 0} videos for page ${i + 1}`);
      
      requests.push(data);

      if (!data.nextPageToken) {
        console.log('No more pages available');
        break;
      }
    }

    const allVideos = requests.flatMap(data => data.items || []);
    console.log(`Total videos fetched: ${allVideos.length}`);
    
    if (!allVideos.length) {
      throw new Error(`No trending videos available${categoryId ? ` for category ${categoryId}` : ''}`);
    }

    const videos = allVideos.slice(0, maxResults).map((item: any) => ({
      id: item.id,
      snippet: {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId
      },
      statistics: {
        viewCount: item.statistics?.viewCount || '0',
        likeCount: item.statistics?.likeCount || '0',
        commentCount: item.statistics?.commentCount || '0'
      },
      topicDetails: item.topicDetails ? {
        relevantTopicIds: item.topicDetails.relevantTopicIds || []
      } : undefined
    }));

    console.log(`Returning ${videos.length} videos`);
    return videos;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
}

// Get popular channels
export async function getPopularChannels(maxResults = 10): Promise<YouTubeChannel[]> {
  try {
    // List of known popular channel IDs
    const popularChannelIds = [
      'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
      'UCq-Fj5jknLsUf-MWSy4_brA', // T-Series
      'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie
      'UCFFbwnve3yF62-tVXkTyHqg', // Markiplier
      'UCfM3zsQsOnfWNUppiycmBuw', // Dude Perfect
      'UCY30JRSgfhYXA6i6xX1erWg', // Ninja
      'UCBR8-60-B28hp2BmDPdntcQ', // YouTube Spotlight
      'UCpEhnqL0y41EpW2TvWAHD7Q', // SET India
      'UCbCmjCuTUZos6Inko4u57UQ', // Cocomelon
      'UCJ5v_MCY6GNUBTO8-D3XoAg'  // WWE
    ];

    const selectedIds = popularChannelIds
      .sort(() => Math.random() - 0.5)
      .slice(0, maxResults)
      .join(',');

    const url = `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${selectedIds}&key=${YOUTUBE_API_KEY}`;
    const data = await fetchWithCache(url);
    
    if (data.items?.length) {
      return data.items.sort((a: YouTubeChannel, b: YouTubeChannel) => {
        const aCount = parseInt(a.statistics?.subscriberCount || '0');
        const bCount = parseInt(b.statistics?.subscriberCount || '0');
        return bCount - aCount;
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching popular channels:', error);
    return [];
  }
}

// Search channels
export async function searchChannels(query: string, maxResults = 10): Promise<YouTubeChannel[]> {
  if (!query?.trim()) {
    console.log('Empty query provided');
    return [];
  }

  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is missing');
    throw new Error('YouTube API key is not configured');
  }

  try {
    // First search for channels
    const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query.trim())}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    console.log('Fetching search results...');
    const searchData = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Search API error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    });
    
    console.log('Search response:', searchData);
    
    if (!searchData?.items?.length) {
      console.log('No search results found');
      return [];
    }

    // Extract channel IDs
    const channelIds = searchData.items
      .map((item: any) => item.id?.channelId)
      .filter(Boolean);

    if (!channelIds.length) {
      console.log('No valid channel IDs found');
      return [];
    }

    console.log('Found channel IDs:', channelIds);

    // Get detailed channel information
    const channelsUrl = `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelIds.join(',')}&key=${YOUTUBE_API_KEY}`;
    const channelsData = await fetch(channelsUrl, {
      headers: {
        'Accept': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Channels API error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    });

    console.log('Channels response:', channelsData);

    if (!channelsData?.items?.length) {
      console.log('No channel details found');
      return [];
    }

    return channelsData.items.map((channel: any) => ({
      id: channel.id,
      snippet: {
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        thumbnails: channel.snippet.thumbnails,
        publishedAt: channel.snippet.publishedAt
      },
      statistics: {
        subscriberCount: channel.statistics?.subscriberCount || '0',
        viewCount: channel.statistics?.viewCount || '0',
        videoCount: channel.statistics?.videoCount || '0'
      },
      brandingSettings: channel.brandingSettings
    }));
  } catch (error) {
    console.error('Error searching channels:', error);
    throw error;
  }
}

// Get channel details
export async function getChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
  if (!channelId) {
    return null;
  }

  try {
    const url = `${BASE_URL}/channels?part=snippet,statistics,brandingSettings,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const data = await fetchWithCache(url);
    return data.items?.[0] || null;
  } catch (error) {
    console.error('Error fetching channel details:', error);
    return null;
  }
}

// Get channel videos
export async function getChannelVideos(channelId: string, maxResults = 12): Promise<YouTubeVideo[]> {
  if (!channelId) {
    return [];
  }

  try {
    const playlistUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const playlistData = await fetchWithCache(playlistUrl);
    
    const uploadsPlaylistId = playlistData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return [];
    }

    const videosUrl = `${BASE_URL}/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`;
    const videosData = await fetchWithCache(videosUrl);

    if (!videosData.items?.length) {
      return [];
    }

    const videoIds = videosData.items
      .map((item: any) => item.snippet?.resourceId?.videoId)
      .filter(Boolean)
      .join(',');

    const statsUrl = `${BASE_URL}/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const statsData = await fetchWithCache(statsUrl);

    return videosData.items.map((item: any, index: number) => ({
      id: item.snippet?.resourceId?.videoId,
      snippet: item.snippet,
      statistics: statsData.items?.[index]?.statistics || {
        viewCount: '0',
        likeCount: '0',
        commentCount: '0'
      }
    }));
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

// Get channel playlists
export async function getChannelPlaylists(channelId: string, maxResults = 10) {
  try {
    const url = `${BASE_URL}/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const data = await fetchWithCache(url);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching channel playlists:', error);
    return [];
  }
}

// Get similar channels
export async function getSimilarChannels(channelId: string, maxResults = 10) {
  try {
    const channel = await getChannelDetails(channelId);
    if (!channel?.snippet?.title) {
      return [];
    }

    // Use channel's title to find similar channels
    const query = channel.snippet.title.split(/[\s-]+/).slice(0, 2).join(' ');
    const url = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults + 1}&key=${YOUTUBE_API_KEY}`;
    const data = await fetchWithCache(url);
    
    if (!data.items?.length) {
      return [];
    }

    // Filter out the original channel and get detailed information
    const similarChannels = data.items
      .filter((item: any) => item.snippet?.channelId !== channelId)
      .slice(0, maxResults);

    if (!similarChannels.length) {
      return [];
    }

    const channelIds = similarChannels.map((item: any) => item.snippet.channelId).join(',');
    const channelsUrl = `${BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelIds}&key=${YOUTUBE_API_KEY}`;
    const channelsData = await fetchWithCache(channelsUrl);
    return channelsData.items || [];
  } catch (error) {
    console.error('Error fetching similar channels:', error);
    return [];
  }
}

// Get video categories
export async function getVideoCategories(regionCode = 'US') {
  const url = `${BASE_URL}/videoCategories?part=snippet&regionCode=${regionCode}&key=${YOUTUBE_API_KEY}`;
  const data = await fetchWithCache(url);
  return data.items || [];
} 