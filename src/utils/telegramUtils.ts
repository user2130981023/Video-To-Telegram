/**
 * Utility functions for interacting with the Telegram API
 */

/**
 * Formats a URL to extract domain name for display purposes
 */
const formatDomainName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname
      .replace('www.', '')
      .replace('.com', '')
      .replace('.org', '')
      .replace('.net', '');
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch (error) {
    return 'Unknown Source';
  }
};

/**
 * Sends a video URL to a Telegram channel using a Telegram bot
 * @param videoUrl The URL of the video to send
 * @param botToken Your Telegram bot token
 * @param channelId Your Telegram channel ID (e.g., "@yourchannelname" or "-100123456789")
 * @returns Promise resolving to the API response and message ID
 */
export const sendVideoToTelegram = async (
  videoUrl: string,
  botToken: string,
  channelId: string
): Promise<{response: Response, messageId: number}> => {
  if (!botToken || !channelId) {
    throw new Error('Telegram bot token and channel ID are required');
  }

  // Extract video information for a better formatted message
  const source = formatDomainName(videoUrl);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  // Create a nicely formatted message with emojis and markdown
  const message = `🎬 *New Video Added*\n\n` +
    `🔗 [Watch Video](${videoUrl})\n` +
    `📺 Source: ${source}\n` +
    `📅 Added: ${currentDate}\n\n` +
    `#video #${source.toLowerCase().replace(/\s+/g, '')}`;
  
  // Telegram Bot API endpoint for sending messages
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    // Send the message to the Telegram channel
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false, // Keep this false to show link preview
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description}`);
    }
    
    const data = await response.json();
    const messageId = data.result.message_id;
    
    return { response, messageId };
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    throw error;
  }
};

/**
 * Deletes a message from a Telegram channel
 * @param messageId The ID of the message to delete
 * @param botToken Your Telegram bot token
 * @param channelId Your Telegram channel ID
 * @returns Promise resolving to the API response
 */
export const deleteFromTelegram = async (
  messageId: number,
  botToken: string,
  channelId: string
): Promise<Response> => {
  if (!botToken || !channelId) {
    throw new Error('Telegram bot token and channel ID are required');
  }

  if (!messageId) {
    throw new Error('Message ID is required to delete a message');
  }
  
  // Telegram Bot API endpoint for deleting messages
  const apiUrl = `https://api.telegram.org/bot${botToken}/deleteMessage`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        message_id: messageId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error deleting from Telegram:', error);
    throw error;
  }
};

/**
 * Saves Telegram configuration to localStorage
 */
export const saveTelegramConfig = (botToken: string, channelId: string): void => {
  localStorage.setItem('telegramBotToken', botToken);
  localStorage.setItem('telegramChannelId', channelId);
};

/**
 * Gets Telegram configuration from localStorage
 */
export const getTelegramConfig = (): { botToken: string, channelId: string } => {
  return {
    botToken: localStorage.getItem('telegramBotToken') || '',
    channelId: localStorage.getItem('telegramChannelId') || '',
  };
};
