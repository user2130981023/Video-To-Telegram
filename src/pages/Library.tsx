
import React from 'react';
import { useVideos } from '@/context/VideoContext';
import VideoCard from '@/components/VideoCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';

const Library = () => {
  const { videos } = useVideos();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Video Library</h1>
          <Button asChild className="bg-telegram hover:bg-telegram-dark">
            <Link to="/">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Video
            </Link>
          </Button>
        </div>
        
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500 mb-4">Your library is empty</p>
            <Button asChild className="bg-telegram hover:bg-telegram-dark">
              <Link to="/">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Video
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
