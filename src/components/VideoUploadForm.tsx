import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, Settings2Icon } from 'lucide-react';
import { useVideos } from '@/context/VideoContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { sendVideoToTelegram, saveTelegramConfig, getTelegramConfig } from '@/utils/telegramUtils';
import { Label } from '@/components/ui/label';

const VideoUploadForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addVideo } = useVideos();
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [configOpen, setConfigOpen] = useState(false);

  // Load saved Telegram configuration on component mount
  useEffect(() => {
    const config = getTelegramConfig();
    setBotToken(config.botToken);
    setChannelId(config.channelId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid video URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (err) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    if (!botToken || !channelId) {
      toast({
        title: "Telegram Configuration Missing",
        description: "Please configure your Telegram bot token and channel ID first",
        variant: "destructive",
      });
      setConfigOpen(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First try to send to Telegram
      const { messageId } = await sendVideoToTelegram(url, botToken, channelId);
      
      // If successful, add to local library with Telegram message ID
      await addVideo(url, messageId);
      
      toast({
        title: "Video Added Successfully!",
        description: "Your video has been sent to Telegram and added to your library.",
      });
      
      setUrl('');
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add video. Please check your Telegram configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    saveTelegramConfig(botToken, channelId);
    setConfigOpen(false);
    toast({
      title: "Configuration Saved",
      description: "Your Telegram bot token and channel ID have been saved.",
    });
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Upload Video to Telegram</CardTitle>
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2Icon className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Telegram Configuration</DialogTitle>
                  <DialogDescription>
                    Enter your Telegram bot token and channel ID to send videos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="botToken" className="text-right">
                      Bot Token
                    </Label>
                    <Input
                      id="botToken"
                      placeholder="Enter your bot token"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="channelId" className="text-right">
                      Channel ID
                    </Label>
                    <Input
                      id="channelId"
                      placeholder="@channelname or -100123456789"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveConfig}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Enter a video URL to share it via Telegram and add it to your library.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="videoUrl"
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-telegram hover:bg-telegram-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Send to Telegram
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
};

export default VideoUploadForm;
