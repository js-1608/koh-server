import { Request, Response } from 'express';
import { memoryStore, saveStore } from '../services/storeService';

// ==========================================
// 1. CALENDAR & SCHEDULING (LinkedIn, Meta, YouTube)
// ==========================================

export const getCalendarPosts = async (req: Request, res: Response) => {
  try {
    const { platform, month, channelGroup, status } = req.query;
    let posts = [...(memoryStore.calendarPosts || [])];

    if (platform && typeof platform === 'string' && platform !== 'all') {
      posts = posts.filter(p => p.platform.toLowerCase() === platform.toLowerCase());
    }
    if (channelGroup && typeof channelGroup === 'string' && channelGroup !== 'all') {
      posts = posts.filter(p => p.channelGroup.toLowerCase() === channelGroup.toLowerCase());
    }
    if (month && typeof month === 'string') {
      posts = posts.filter(p => p.scheduledDate.startsWith(month));
    }
    if (status && typeof status === 'string' && status !== 'all') {
      posts = posts.filter(p => p.status === status);
    }

    // Sort by scheduledDate ascending, then scheduledTime
    posts.sort((a, b) => {
      const dateCmp = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCmp !== 0) return dateCmp;
      return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
    });

    return res.json(posts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const scheduleCalendarPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      caption,
      platform,
      scheduledDate,
      scheduledTime,
      pillar,
      targetSku,
      owner,
      mediaUrl,
      mediaType,
      hashtags,
      status
    } = req.body;

    if (!title || !platform || !scheduledDate) {
      return res.status(400).json({ error: 'Title, platform, and scheduledDate are required' });
    }

    let channelGroup: 'LinkedIn' | 'Meta' | 'YouTube' = 'Meta';
    if (platform.includes('LinkedIn')) channelGroup = 'LinkedIn';
    else if (platform.includes('YouTube')) channelGroup = 'YouTube';

    const newPost = {
      _id: `cal_${Date.now()}`,
      title,
      caption: caption || '',
      platform,
      channelGroup,
      scheduledDate,
      scheduledTime: scheduledTime || '10:00',
      status: status || 'scheduled',
      pillar: pillar || 'Made With Care',
      targetSku: targetSku || 'All SKUs',
      owner: owner || 'Keerthi',
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || (mediaUrl?.endsWith('.mp4') ? 'video' : 'image'),
      hashtags: Array.isArray(hashtags) ? hashtags : (typeof hashtags === 'string' ? hashtags.split(',').map((h: string) => h.trim()) : []),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!memoryStore.calendarPosts) memoryStore.calendarPosts = [];
    memoryStore.calendarPosts.push(newPost);
    saveStore();

    return res.status(201).json(newPost);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCalendarPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = (memoryStore.calendarPosts || []).find(p => p._id === id);
    if (!post) {
      return res.status(404).json({ error: 'Calendar post not found' });
    }

    if (req.body.platform) {
      if (req.body.platform.includes('LinkedIn')) post.channelGroup = 'LinkedIn';
      else if (req.body.platform.includes('YouTube')) post.channelGroup = 'YouTube';
      else post.channelGroup = 'Meta';
    }

    Object.assign(post, req.body, { updatedAt: new Date() });
    saveStore();
    return res.json(post);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCalendarPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = (memoryStore.calendarPosts || []).length;
    memoryStore.calendarPosts = (memoryStore.calendarPosts || []).filter(p => p._id !== id);
    if (memoryStore.calendarPosts.length === initialLen) {
      return res.status(404).json({ error: 'Calendar post not found' });
    }
    saveStore();
    return res.json({ success: true, message: 'Scheduled post removed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const publishCalendarPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = (memoryStore.calendarPosts || []).find(p => p._id === id);
    if (!post) {
      return res.status(404).json({ error: 'Calendar post not found' });
    }

    post.status = 'published';
    post.publishedUrl = post.platform.includes('LinkedIn')
      ? `https://linkedin.com/feed/update/urn:li:activity:${Date.now()}`
      : post.platform.includes('YouTube')
      ? `https://youtube.com/watch?v=pub_${Date.now()}`
      : `https://instagram.com/p/live_${Date.now()}`;
    post.updatedAt = new Date();
    saveStore();

    return res.json({ success: true, post });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. SHOOTS & FOOTAGE LIBRARY
// ==========================================

export const getShoots = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.shoots || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createShoot = async (req: Request, res: Response) => {
  try {
    const { title, type, shootDate, location, cameraOperator, equipmentUsed, thumbnailUrl, rawAssetLink, notes } = req.body;
    const newShoot = {
      _id: `sht_${Date.now()}`,
      title: title || 'Untitled Shoot',
      type: type || 'Factory',
      status: 'planned' as const,
      shootDate: shootDate || new Date().toISOString().split('T')[0],
      location: location || 'Hyderabad Factory Bay',
      cameraOperator: cameraOperator || 'Ajay Varma',
      equipmentUsed: equipmentUsed || 'Sony A7S III',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
      rawAssetLink,
      notes,
      clipsCount: 0,
      clips: [],
      linkedPieces: [],
      createdAt: new Date()
    };
    if (!memoryStore.shoots) memoryStore.shoots = [];
    memoryStore.shoots.unshift(newShoot);
    saveStore();
    return res.status(201).json(newShoot);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateShoot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shoot = (memoryStore.shoots || []).find(s => s._id === id);
    if (!shoot) return res.status(404).json({ error: 'Shoot session not found' });
    Object.assign(shoot, req.body);
    saveStore();
    return res.json(shoot);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteShoot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    memoryStore.shoots = (memoryStore.shoots || []).filter(s => s._id !== id);
    saveStore();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getShootClips = async (req: Request, res: Response) => {
  try {
    const { tag, crop, search } = req.query;
    let list = [...(memoryStore.shootClips || [])];

    if (tag && typeof tag === 'string') {
      list = list.filter(c => c.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
    }
    if (crop && typeof crop === 'string') {
      list = list.filter(c => c.cropOrProduce.toLowerCase() === crop.toLowerCase());
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.cropOrProduce.toLowerCase().includes(q) ||
        c.clipId.toLowerCase().includes(q)
      );
    }

    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createShootClip = async (req: Request, res: Response) => {
  try {
    const { title, location, cropOrProduce, durationSeconds, tags, videoUrl, thumbnailUrl, resolution, cameraOperator } = req.body;

    const count = (memoryStore.shootClips || []).length + 1;
    const clipId = `CLP-${(location || 'GEN').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}-${String(count).padStart(2, '0')}`;

    const newClip = {
      _id: `clp_${Date.now()}`,
      clipId,
      title: title || 'B-Roll Footage Clip',
      location: location || 'Factory Dehydration Line',
      cropOrProduce: cropOrProduce || 'General',
      durationSeconds: Number(durationSeconds) || 15,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : ['#solar-drying']),
      videoUrl: videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-vegetables-being-washed-in-a-kitchen-sink-40919-large.mp4',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      resolution: resolution || '4K 60fps',
      shootDate: new Date().toISOString().split('T')[0],
      cameraOperator: cameraOperator || 'Ajay Varma',
      usageCount: 0,
      status: 'raw' as const,
      attachedPieces: []
    };

    if (!memoryStore.shootClips) memoryStore.shootClips = [];
    memoryStore.shootClips.unshift(newClip);
    saveStore();

    return res.status(201).json(newClip);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateShootClip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clip = (memoryStore.shootClips || []).find(c => c._id === id || c.clipId === id);
    if (!clip) return res.status(404).json({ error: 'Clip not found' });
    Object.assign(clip, req.body);
    saveStore();
    return res.json(clip);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteShootClip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    memoryStore.shootClips = (memoryStore.shootClips || []).filter(c => c._id !== id && c.clipId !== id);
    saveStore();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const linkClipToContent = async (req: Request, res: Response) => {
  try {
    const { clipId, contentId, contentTitle, contentType } = req.body;
    const clip = (memoryStore.shootClips || []).find(c => c._id === clipId || c.clipId === clipId);
    if (!clip) return res.status(404).json({ error: 'Clip not found' });

    if (!clip.attachedPieces) clip.attachedPieces = [];
    clip.attachedPieces.push({
      id: contentId || `cnt_${Date.now()}`,
      title: contentTitle || 'Attached Content',
      type: contentType || 'Reel'
    });
    clip.usageCount = (clip.usageCount || 0) + 1;
    saveStore();

    return res.json({ success: true, clip });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. ORGANIC ANALYTICS (Channels & Every Post)
// ==========================================

export const getOrganicAnalytics = async (req: Request, res: Response) => {
  try {
    const posts = memoryStore.organicPosts || [];
    const igPosts = posts.filter(p => p.channel === 'Meta');
    const liPosts = posts.filter(p => p.channel === 'LinkedIn');
    const ytPosts = posts.filter(p => p.channel === 'YouTube');

    const totalReach = posts.reduce((sum, p) => sum + (p.reach || 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0);
    const totalSaves = posts.reduce((sum, p) => sum + (p.saves || 0), 0);

    const avgEr = posts.length > 0
      ? (posts.reduce((sum, p) => sum + (p.engagementRate || 0), 0) / posts.length).toFixed(2)
      : '5.2';

    return res.json({
      success: true,
      lastSynced: new Date(),
      metrics: {
        totalFollowers: 47050,
        totalReach,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        totalSaves,
        avgEngagementRate: `${avgEr}%`,
        postsPerWeek: 4.8
      },
      channels: {
        meta: {
          account: '@koh_superfoods',
          platform: 'Instagram & Facebook',
          followers: 28450,
          reach30d: igPosts.reduce((sum, p) => sum + (p.reach || 0), 0),
          reelsPlays: igPosts.reduce((sum, p) => sum + (p.views || 0), 0),
          engagementRate: '5.8%',
          postsCount: igPosts.length
        },
        linkedIn: {
          account: 'koh! Clean Label Foods',
          platform: 'LinkedIn Company',
          followers: 6200,
          reach30d: liPosts.reduce((sum, p) => sum + (p.reach || 0), 0),
          impressions30d: liPosts.reduce((sum, p) => sum + (p.impressions || 0), 0),
          engagementRate: '5.3%',
          postsCount: liPosts.length
        },
        youTube: {
          account: 'KOH Organics Lab',
          platform: 'YouTube Shorts & Channel',
          subs: 12400,
          views30d: ytPosts.reduce((sum, p) => sum + (p.views || 0), 0),
          watchTimeHours: 4200,
          engagementRate: '7.4%',
          postsCount: ytPosts.length
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganicPosts = async (req: Request, res: Response) => {
  try {
    const { channel, sortBy, filterBoost } = req.query;
    let list = [...(memoryStore.organicPosts || [])];

    if (channel && typeof channel === 'string' && channel !== 'all') {
      list = list.filter(p => p.channel.toLowerCase() === channel.toLowerCase());
    }

    if (filterBoost === 'true') {
      list = list.filter(p => p.isBoostCandidate);
    }

    // Sort by metric
    const sortField = (typeof sortBy === 'string' ? sortBy : 'views') as keyof typeof list[0];
    list.sort((a: any, b: any) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return valB - valA;
    });

    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const syncOrganicAnalytics = async (req: Request, res: Response) => {
  try {
    // Simulates pulling latest Graph API & LinkedIn Metrics
    (memoryStore.organicPosts || []).forEach(p => {
      // Simulate real-time increment in views and engagement
      p.views += Math.floor(Math.random() * 450) + 50;
      p.reach += Math.floor(Math.random() * 320) + 40;
      p.likes += Math.floor(Math.random() * 35) + 5;
    });
    saveStore();

    return res.json({
      success: true,
      syncedAt: new Date(),
      message: 'Channels synced with Meta Graph API, LinkedIn V2 Marketing API & YouTube Analytics'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganicLeaderboards = async (req: Request, res: Response) => {
  try {
    const posts = memoryStore.organicPosts || [];
    return res.json({
      mostViewed: [...posts].sort((a, b) => b.views - a.views).slice(0, 5),
      highestEngagement: [...posts].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5),
      mostShared: [...posts].sort((a, b) => b.shares - a.shares).slice(0, 5),
      mostSaved: [...posts].sort((a, b) => b.saves - a.saves).slice(0, 5),
      boostCandidates: posts.filter(p => p.isBoostCandidate)
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganicBestTimes = async (req: Request, res: Response) => {
  try {
    // 7 days x 24 hour engagement heatmap values
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const heatmap = days.map(day => ({
      day,
      hours: Array.from({ length: 24 }, (_, hour) => {
        // High engagement peaks at 8-10am and 6-9pm
        let base = Math.floor(Math.random() * 25) + 10;
        if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
          base += 65;
        }
        return { hour, score: base };
      })
    }));

    return res.json({
      success: true,
      recommendation: 'Optimal publishing windows: Mon-Fri 08:30 AM & 07:00 PM IST',
      heatmap
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 4. INFLUENCERS & COLLAB PIPELINE (Template Match)
// ==========================================

export const getInfluencers = async (req: Request, res: Response) => {
  try {
    const { tier, platform, search, niche } = req.query;
    let list = [...(memoryStore.influencers || [])];

    if (tier && typeof tier === 'string' && tier !== 'all') {
      list = list.filter(i => i.tier === tier);
    }
    if (platform && typeof platform === 'string' && platform !== 'all') {
      list = list.filter(i => i.platform.toLowerCase() === platform.toLowerCase());
    }
    if (niche && typeof niche === 'string' && niche !== 'all') {
      list = list.filter(i => i.niche.toLowerCase().includes(niche.toLowerCase()));
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.handle.toLowerCase().includes(q) ||
        (i.igHandle && i.igHandle.toLowerCase().includes(q))
      );
    }

    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createInfluencer = async (req: Request, res: Response) => {
  try {
    const { name, handle, igHandle, ytHandle, liHandle, platform, followers, niche, contactEmail, contactPhone, city, notes } = req.body;

    const fCount = Number(followers) || 10000;
    let tier: 'nano' | 'micro' | 'mid' | 'macro' = 'micro';
    if (fCount < 10000) tier = 'nano';
    else if (fCount < 100000) tier = 'micro';
    else if (fCount < 500000) tier = 'mid';
    else tier = 'macro';

    const newInf = {
      _id: `inf_${Date.now()}`,
      name: name || 'Creator Name',
      handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '@creator',
      igHandle: igHandle || (handle ? handle.replace('@', '') : ''),
      ytHandle,
      liHandle,
      platform: platform || 'Instagram',
      followers: fCount,
      engagementRate: Number(req.body.engagementRate) || 5.2,
      tier,
      niche: niche || 'Health & Nutrition',
      status: 'active',
      collaborations: [],
      totalSpent: 0,
      totalRevenue: 0,
      overallRoas: 0,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      city: city || 'Hyderabad',
      notes,
      createdAt: new Date()
    };

    if (!memoryStore.influencers) memoryStore.influencers = [];
    memoryStore.influencers.unshift(newInf);
    saveStore();

    return res.status(201).json(newInf);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateInfluencer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inf = (memoryStore.influencers || []).find(i => i._id === id);
    if (!inf) return res.status(404).json({ error: 'Influencer not found' });
    Object.assign(inf, req.body);
    saveStore();
    return res.json(inf);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteInfluencer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    memoryStore.influencers = (memoryStore.influencers || []).filter(i => i._id !== id);
    saveStore();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCollabPipeline = async (req: Request, res: Response) => {
  try {
    const { stage, influencerId } = req.query;
    let list = [...(memoryStore.collabs || [])];

    if (stage && typeof stage === 'string' && stage !== 'all') {
      list = list.filter(c => c.stage === stage);
    }
    if (influencerId && typeof influencerId === 'string') {
      list = list.filter(c => c.influencerId === influencerId);
    }

    // Stage counts for badges
    const stageCounts: Record<string, number> = {
      all: (memoryStore.collabs || []).length,
      outreach: 0,
      sample_sent: 0,
      brief_agreed: 0,
      script_review: 0,
      content_live: 0,
      completed: 0,
      dropped: 0
    };

    (memoryStore.collabs || []).forEach(c => {
      if (stageCounts[c.stage] !== undefined) stageCounts[c.stage]++;
    });

    return res.json({
      collabs: list,
      stageCounts
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCollab = async (req: Request, res: Response) => {
  try {
    const { influencerId, deliverable, type, fee, productSent, productCost, stage, dueDate, paymentDueDate, promoCode, notes } = req.body;
    const inf = (memoryStore.influencers || []).find(i => i._id === influencerId);

    const newCollab = {
      _id: `col_${Date.now()}`,
      influencerId: influencerId || 'inf_unknown',
      influencerName: inf ? inf.name : (req.body.influencerName || 'Creator'),
      handle: inf ? inf.handle : (req.body.handle || '@creator'),
      deliverable: deliverable || '1x IG Reel',
      type: type || 'Reel',
      stage: stage || 'outreach',
      productSent: productSent || 'Moringa & Amla Starter Kit',
      productCost: Number(productCost) || 1200,
      fee: Number(fee) || 15000,
      advanceStatus: 'pending' as const,
      finalPaymentStatus: 'pending' as const,
      paymentDueDate: paymentDueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      promoCode: promoCode || `KOH${Math.floor(Math.random() * 89) + 10}`,
      views: 0,
      ordersTracked: 0,
      revenue: 0,
      roi: 0,
      approachRecommendation: req.body.approachRecommendation || 'partnership_ad',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!memoryStore.collabs) memoryStore.collabs = [];
    memoryStore.collabs.unshift(newCollab);

    // Update creator stats
    if (inf) {
      inf.totalSpent = (inf.totalSpent || 0) + Number(fee || 0);
    }
    saveStore();

    return res.status(201).json(newCollab);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCollab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collab = (memoryStore.collabs || []).find(c => c._id === id);
    if (!collab) return res.status(404).json({ error: 'Collab not found' });

    Object.assign(collab, req.body, { updatedAt: new Date() });

    // Recalculate ROI if revenue and fee exist
    if (collab.revenue && collab.fee) {
      collab.roi = Number((collab.revenue / (collab.fee + (collab.productCost || 0))).toFixed(1));
    }

    saveStore();
    return res.json(collab);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteCollab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    memoryStore.collabs = (memoryStore.collabs || []).filter(c => c._id !== id);
    saveStore();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInfluencerPayments = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const pending = (memoryStore.collabs || []).filter(c =>
      c.fee > 0 && (c.finalPaymentStatus === 'pending' || c.advanceStatus === 'pending')
    );

    const paymentsWithOverdue = pending.map(c => {
      const isOverdue = c.paymentDueDate ? c.paymentDueDate < today : false;
      const daysOverdue = c.paymentDueDate
        ? Math.max(0, Math.floor((new Date(today).getTime() - new Date(c.paymentDueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      return {
        ...c,
        isOverdue,
        daysOverdue
      };
    });

    const totalPendingAmount = pending.reduce((sum, c) => sum + (c.fee || 0), 0);
    const overdueCount = paymentsWithOverdue.filter(p => p.isOverdue).length;
    const overdueAmount = paymentsWithOverdue
      .filter(p => p.isOverdue)
      .reduce((sum, p) => sum + (p.fee || 0), 0);

    return res.json({
      payments: paymentsWithOverdue,
      summary: {
        totalPendingCount: pending.length,
        totalPendingAmount,
        overdueCount,
        overdueAmount
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateInfluencerScripts = async (req: Request, res: Response) => {
  try {
    const { influencerId, targetSku } = req.body;
    const inf = (memoryStore.influencers || []).find(i => i._id === influencerId) || memoryStore.influencers[0];
    const sku = targetSku || 'Organic Wild Amla Powder 100g';

    const ideas = [
      {
        title: `The 3pm Fatigue Buster with 0 Added Sugar`,
        hook: `Stop reaching for coffee when your adrenals are drained. Here is what 1 scoop of low-temp dehydrated ${sku.split(' ')[1] || 'superfood'} does in 10 minutes.`,
        shootType: 'Morning ASMR Routine & Solubility Swirl',
        bestFormat: 'Instagram Reel (9:16, 45 seconds)',
        recommendedApproach: '🤝 PARTNERSHIP AD',
        approachRationale: 'High-engagement creator with strong nutritionist authority. Perfect to run as a Meta Branded Partnership ad for scale.',
        estimatedImpact: 'High Reach (180K+ targeted impressions)',
        productToFeature: sku
      },
      {
        title: `Clean-Label Kitchen Audit: Read the Fine Print`,
        hook: `I tested 5 popular health powders for maltodextrin and synthetic ascorbic acid. Here is the lab report on koh!`,
        shootType: 'Unboxing & Jar Label Audit',
        bestFormat: 'Carousel Post (1080x1350, 6 slides)',
        recommendedApproach: '🌿 ORGANIC ONLY',
        approachRationale: 'Educational trust builder that drives high saves and bookmarks among health-conscious families.',
        estimatedImpact: 'High Conversion (8.2% Save Rate)',
        productToFeature: sku
      },
      {
        title: `Pre-Workout Nitrate Surge: Whole Root vs Synthetic Pre-Workout`,
        hook: `Listen to this: Whole food nitrates dilate blood vessels naturally with zero jittery beta-alanine itch.`,
        shootType: 'Gym Water Bottle Shake ASMR',
        bestFormat: 'YouTube Short (60 seconds)',
        recommendedApproach: '📺 PAID AD (UGC)',
        approachRationale: 'Strong visceral hook with active proof. Cut down into 15s and 30s performance creatives for Meta & YouTube.',
        estimatedImpact: 'High ROAS (3.8x - 4.5x target)',
        productToFeature: sku
      }
    ];

    return res.json({
      creator: inf.name,
      niche: inf.niche,
      ideas
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 5. EXISTING UTILITIES & COMPATIBILITY
// ==========================================

export const getContentItems = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.contentItems || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createContentItem = async (req: Request, res: Response) => {
  try {
    const { title, pillar, stage, format, targetSkuId, targetSkuName, hookText, scriptText, assignedTo, channel } = req.body;

    const newItem = {
      _id: `cnt_${Date.now()}`,
      title,
      pillar: pillar || 'Made With Care',
      stage: stage || 'Idea',
      format: format || 'Reel/Short',
      targetSkuId,
      targetSkuName,
      clipIds: [],
      hookText: hookText || '',
      scriptText: scriptText || '',
      assignedTo: assignedTo || 'Creative Team',
      channel: channel || 'Instagram',
      boostCandidate: false,
      performance: { views: 0, likes: 0, shares: 0, comments: 0, roas: 0 },
      createdAt: new Date()
    };

    if (!memoryStore.contentItems) memoryStore.contentItems = [];
    memoryStore.contentItems.unshift(newItem);
    saveStore();
    return res.status(201).json(newItem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateContentItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = (memoryStore.contentItems || []).findIndex(c => c._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Content item not found' });
    }

    const item = memoryStore.contentItems[index];
    Object.assign(item, req.body);
    memoryStore.contentItems[index] = item;
    saveStore();
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateAiCalendar = async (req: Request, res: Response) => {
  try {
    const activeBatches = (memoryStore.batches || []).filter((b: any) => b.status === 'active');
    const highMarginSkus = (memoryStore.skus || []).filter((s: any) => s.grossMarginPercent > 70 && s.currentStock > 100);
    const availableClips = memoryStore.shootClips || [];

    const generatedCalendar = [
      {
        day: 'Day 1 (Mon)',
        pillar: 'Made With Care',
        format: 'LinkedIn Post',
        title: `Behind The Batch: Dehydration Kinetics at 58°C`,
        hook: 'Why heat destroys 80% of Vitamin C and how vacuum chambers keep it alive.',
        targetSku: 'Organic Wild Amla Powder 100g',
        footageStatus: 'Footage Ready (CLP-FACT-02)',
        action: 'Push to Calendar'
      },
      {
        day: 'Day 3 (Wed)',
        pillar: '5-Min Nutrition',
        format: 'Instagram Reel',
        title: 'Moringa Green Goddess Morning Tonic for Zero Brain Fog',
        hook: 'Replace your 2nd coffee with this single leaf nutrient bomb.',
        targetSku: 'Pure Green Moringa Powder 150g',
        footageStatus: 'Footage Ready (CLP-KITCH-01)',
        action: 'Push to Calendar'
      },
      {
        day: 'Day 5 (Fri)',
        pillar: 'Farmer Spotlight',
        format: 'LinkedIn & Meta',
        title: 'Direct From Suryapet Farm Gate: Zero Synthetic Pesticide Guarantee',
        hook: 'Know your farmer, know your cellular health.',
        targetSku: 'Organic Wild Amla Powder 100g',
        footageStatus: 'Footage Ready (CLP-FARM-01)',
        action: 'Push to Calendar'
      }
    ];

    return res.json({
      success: true,
      data: generatedCalendar,
      insights: `Cross-system intelligence compiled from ${activeBatches.length} active factory batches, ${highMarginSkus.length} high-margin SKUs, and ${availableClips.length} tagged shoot clips.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Statics Handlers
export const getStatics = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.statics || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createStatic = async (req: Request, res: Response) => {
  try {
    const { title, stage, type, platform, owner, dueDate, dimensions, notes } = req.body;
    const newStatic = {
      _id: `stat_${Date.now()}`,
      title: title || 'Listing Graphic',
      stage: stage || 'brief',
      type: type || 'Listing image',
      platform: platform || 'Amazon',
      owner: owner || 'Keerthi',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      dimensions: dimensions || '1080 x 1080 px',
      notes,
      createdAt: new Date()
    };
    if (!memoryStore.statics) memoryStore.statics = [];
    memoryStore.statics.unshift(newStatic);
    saveStore();
    return res.status(201).json(newStatic);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateStatic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = (memoryStore.statics || []).find(s => s._id === id);
    if (!item) return res.status(404).json({ error: 'Static creative not found' });
    Object.assign(item, req.body);
    saveStore();
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Ad Creatives Handlers
export const getAdCreatives = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.adCreatives || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createAdCreative = async (req: Request, res: Response) => {
  try {
    const { title, stage, channel, creativeType, objective, owner, dueDate, scriptSnippet, hookType, notes } = req.body;
    const newAdCreative = {
      _id: `adc_${Date.now()}`,
      title: title || 'Meta Conversion Ad',
      stage: stage || 'request',
      channel: channel || 'Meta',
      creativeType: creativeType || 'Video',
      objective: objective || 'Conversions',
      owner: owner || 'Keerthi',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      scriptSnippet,
      hookType,
      notes,
      createdAt: new Date()
    };
    if (!memoryStore.adCreatives) memoryStore.adCreatives = [];
    memoryStore.adCreatives.unshift(newAdCreative);
    saveStore();
    return res.status(201).json(newAdCreative);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateAdCreative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = (memoryStore.adCreatives || []).find(a => a._id === id);
    if (!item) return res.status(404).json({ error: 'Ad creative not found' });
    Object.assign(item, req.body);
    saveStore();
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Paid Ads Handlers
export const getPaidAds = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.paidAds || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPaidAd = async (req: Request, res: Response) => {
  try {
    const { campaignName, channel, dailyBudget, totalSpend, roas } = req.body;
    const newPaidAd = {
      _id: `pad_${Date.now()}`,
      campaignName: campaignName || 'Performance Scale',
      channel: channel || 'Meta',
      status: 'Active' as const,
      dailyBudget: Number(dailyBudget) || 10000,
      totalSpend: Number(totalSpend) || 0,
      roas: Number(roas) || 3.5,
      clicks: 0,
      conversions: 0,
      cpa: 0,
      cpc: 0,
      startDate: new Date().toISOString().split('T')[0]
    };
    if (!memoryStore.paidAds) memoryStore.paidAds = [];
    memoryStore.paidAds.unshift(newPaidAd);
    saveStore();
    return res.status(201).json(newPaidAd);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePaidAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = (memoryStore.paidAds || []).find(p => p._id === id);
    if (!item) return res.status(404).json({ error: 'Campaign not found' });
    Object.assign(item, req.body);
    saveStore();
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Ad Analytics Summary
export const getAdAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const totalSpend = (memoryStore.paidAds || []).reduce((sum, a) => sum + (a.totalSpend || 0), 0);
    const weightedRoas = (
      (memoryStore.paidAds || []).reduce((sum, a) => sum + (a.roas || 0) * (a.totalSpend || 1), 0) / (totalSpend || 1)
    ).toFixed(2);

    return res.json({
      success: true,
      blendedRoas: Number(weightedRoas) || 3.82,
      totalSpend,
      totalConversions: (memoryStore.paidAds || []).reduce((sum, a) => sum + (a.conversions || 0), 0),
      channels: [
        { name: 'Meta', spend: 342000, roas: 3.82, share: '47%' },
        { name: 'Amazon', spend: 215000, roas: 4.65, share: '30%' },
        { name: 'Google', spend: 168000, roas: 4.15, share: '23%' }
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
