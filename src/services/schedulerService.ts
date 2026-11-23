import { memoryStore, saveStore } from './storeService';
import { dispatchSocialPost } from './socialPublisherService';

let schedulerTimer: NodeJS.Timeout | null = null;
let isProcessing = false;

/**
 * Checks all scheduled posts and auto-publishes if their scheduled time has arrived.
 */
export const checkAndPublishScheduledPosts = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const posts = memoryStore.calendarPosts || [];
    if (posts.length === 0) {
      isProcessing = false;
      return;
    }

    const now = new Date();
    // Current date in YYYY-MM-DD format
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${curYear}-${curMonth}-${curDay}`;

    // Current time in HH:mm format
    const curHours = String(now.getHours()).padStart(2, '0');
    const curMinutes = String(now.getMinutes()).padStart(2, '0');
    const nowTimeStr = `${curHours}:${curMinutes}`;

    for (const post of posts) {
      if (post.status !== 'scheduled') continue;
      if (!post.scheduledDate) continue;

      const postDate = post.scheduledDate; // YYYY-MM-DD
      const postTime = post.scheduledTime || '00:00'; // HH:mm

      // Check if scheduled datetime is now or has passed
      const isPastDate = postDate < todayStr;
      const isTodayAndPastTime = postDate === todayStr && postTime <= nowTimeStr;

      if (isPastDate || isTodayAndPastTime) {
        console.log(`[Auto-Scheduler] ⏰ Due post detected: "${post.title}" (${post.platform}) scheduled for ${postDate} ${postTime}`);
        
        try {
          const result = await dispatchSocialPost(post);
          post.status = 'published';
          post.publishedUrl = result.url;
          post.publishedAt = new Date();
          post.publishError = undefined;
          post.updatedAt = new Date();
          console.log(`[Auto-Scheduler] ✅ Successfully published post "${post.title}" -> ${result.url}`);
        } catch (err: any) {
          console.error(`[Auto-Scheduler] ❌ Failed to auto-publish post "${post.title}":`, err.message);
          post.status = 'failed';
          post.publishError = err.message || 'Auto-publishing failed';
          post.updatedAt = new Date();
        }

        saveStore();
      }
    }
  } catch (err: any) {
    console.error('[Auto-Scheduler Error]:', err.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Start the background scheduler (checks every 30 seconds)
 */
export const startSocialScheduler = (intervalMs = 30000) => {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  console.log(`[Auto-Scheduler] 🕒 Background social scheduler started (interval: ${intervalMs / 1000}s)`);
  
  // Initial run after short delay
  setTimeout(() => {
    checkAndPublishScheduledPosts();
  }, 5000);

  schedulerTimer = setInterval(() => {
    checkAndPublishScheduledPosts();
  }, intervalMs);
};

export const stopSocialScheduler = () => {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[Auto-Scheduler] ⏹ Scheduler stopped');
  }
};
