import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare, Play, Trash2, X } from 'lucide-react';
import { Video } from '@/context/VideoContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVideos } from '@/context/VideoContext';
import { useToast } from '@/components/ui/use-toast';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const formattedDate = new Date(video.addedAt).toLocaleDateString();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { deleteVideo } = useVideos();
  const { toast } = useToast();

  const handlePlayClick = () => {
    setIsPlaying(true);
    setIsExpanded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      });
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    // Keep the video playing status if user just wants to minimize
    // If you want to stop the video on close, uncomment the next line
    // setIsPlaying(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVideo(video.id);
      toast({
        title: "Video deleted",
        description: "Video was successfully deleted from your library and Telegram channel.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting video",
        description: error.message || "An error occurred while deleting the video.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Extract video ID from URL to create embeddable links
  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    
    // Return original URL if not a known video platform
    return url;
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden group">
          {isPlaying && !isExpanded ? (
            <div className="w-full h-full">
              <iframe
                src={getEmbedUrl(video.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            </div>
          ) : (
            <>
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black hover:bg-opacity-25"
                  onClick={handlePlayClick}
                >
                  <Play className="h-12 w-12 fill-white" />
                </Button>
              </div>
            </>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 text-sm h-10">{video.title}</h3>
          <p className="text-xs text-muted-foreground mt-2">Added on {formattedDate}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-telegram hover:bg-telegram hover:text-white"
                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(video.url)}`, '_blank')}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Telegram</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in Telegram</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(video.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:inline-block">Open Link</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Original Link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Video</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>

      {/* Expanded video dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-background/95 backdrop-blur-md border-none shadow-2xl">
          <div className="relative aspect-video w-full">
            <iframe
              src={getEmbedUrl(video.url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
            <DialogClose 
              className="absolute top-2 right-2 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 focus:outline-none"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the video from your library and from the Telegram channel.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VideoCard;