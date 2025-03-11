import React, { createContext, useContext, useState, useEffect } from 'react';
import { deleteFromTelegram, getTelegramConfig } from '@/utils/telegramUtils';

export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  addedAt: string;
  telegramMessageId?: number; // Store the Telegram message ID for deletion
}

interface VideoContextType {
  videos: Video[];
  addVideo: (videoUrl: string, telegramMessageId?: number) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>(() => {
    const savedVideos = localStorage.getItem('telegramVideos');
    return savedVideos ? JSON.parse(savedVideos) : [];
  });

  useEffect(() => {
    localStorage.setItem('telegramVideos', JSON.stringify(videos));
  }, [videos]);

  // Function to extract video ID from various video platforms
  const extractVideoId = (url: string) => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return { id: youtubeMatch[1], platform: 'youtube' };
    }
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return { id: vimeoMatch[1], platform: 'vimeo' };
    }
    
    // Default - just use the URL as ID
    return { id: Math.random().toString(36).substring(2, 11), platform: 'unknown' };
  };

  // Function to get video information
  const getVideoInfo = async (url: string, telegramMessageId?: number) => {
    const { id, platform } = extractVideoId(url);
    
    // For this demo, we'll generate mock data
    // In a real app, you would fetch actual metadata from an API
    let title, thumbnailUrl;
    
    if (platform === 'youtube') {
      title = `YouTube Video ${id}`;
      thumbnailUrl = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    } else if (platform === 'vimeo') {
      title = `Vimeo Video ${id}`;
      thumbnailUrl = 'https://i.vimeocdn.com/video/default.jpg';
    } else {
      title = `Video from ${new URL(url).hostname}`;
      thumbnailUrl = 'https://via.placeholder.com/320x180?text=Video';
    }
    
    return {
      id,
      url,
      title,
      thumbnailUrl,
      addedAt: new Date().toISOString(),
      telegramMessageId
    };
  };

  const addVideo = async (videoUrl: string, telegramMessageId?: number) => {
    try {
      const videoInfo = await getVideoInfo(videoUrl, telegramMessageId);
      setVideos(prevVideos => [videoInfo, ...prevVideos]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding video:", error);
      return Promise.reject(error);
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const videoToDelete = videos.find(v => v.id === videoId);
      
      if (!videoToDelete) {
        throw new Error("Video not found");
      }
      
      // Delete from Telegram if message ID exists
      if (videoToDelete.telegramMessageId) {
        const { botToken, channelId } = getTelegramConfig();
        await deleteFromTelegram(
          videoToDelete.telegramMessageId, 
          botToken, 
          channelId
        );
      }
      
      // Remove from local storage
      setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting video:", error);
      return Promise.reject(error);
    }
  };

  return (
    <VideoContext.Provider value={{ videos, addVideo, deleteVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};
