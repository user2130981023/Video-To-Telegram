
import React from 'react';
import VideoUploadForm from '@/components/VideoUploadForm';
import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { videos } = useVideos();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4 text-telegram">VidTo<span className="text-black">Telegram</span></h1>
          <p className="text-lg text-gray-600 mb-8">
            Share videos to Telegram and build your own curated video library
          </p>
        </div>
        
        <VideoUploadForm />
        
        {videos.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">
              You have {videos.length} video{videos.length !== 1 ? 's' : ''} in your library
            </p>
            <Button variant="outline" asChild>
              <Link to="/library">View Library</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
