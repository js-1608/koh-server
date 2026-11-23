// Typed interfaces for In-Memory and Mongo database store

export interface IStoreFarmer {
  _id: string;
  farmerCode: string;
  name: string;
  village: string;
  district: string;
  phone: string;
  plotAcres: number;
  crops: string[];
  status: 'active' | 'prospect' | 'paused';
  fpoLink: string;
  waterSource?: string;
  waterAvailability?: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreCropMaster {
  _id: string;
  cropName: string;
  category: 'Vegetable' | 'Fruit' | 'Herb' | 'Leafy' | 'Root';
  daysToHarvest: number;
  freshYieldPerAcreKg: number;
  dehydrationYieldPercent: number;
  costPerAcreBreakdown: { seeds: number; inputs: number; labour: number; transport: number };
  totalEstimatedCostPerAcre: number;
  marketRatePerKg: number;
}

export interface IStoreCropCycle {
  _id: string;
  cycleCode: string;
  farmerId: string;
  farmerName: string;
  cropId: string;
  cropName: string;
  plotAcres: number;
  sowingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  estimatedYieldKg: number;
  actualYieldKg?: number;
  status: 'planned' | 'growing' | 'harvested' | 'delayed';
  farmPurchases: { item: string; category: string; amount: number; date: Date }[];
  totalCultivationCost: number;
  notes?: string;
}

export interface IStoreReceipt {
  _id: string;
  rmId: string;
  farmerId: string;
  farmerName: string;
  produce: string;
  initialWeightKg: number;
  receiptDate: Date;
  farmLocation: string;
  modeOfTransport: string;
  transportCost: number;
  ratePerKg: number;
  totalProduceCost: number;
  landedCostTotal: number;
  landedCostPerKg: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  status: 'received' | 'sorted' | 'in_batch' | 'dispatched';
  batchCode?: string;
  notes?: string;
}

export interface IStoreBatch {
  _id: string;
  batchCode: string;
  produce: string;
  rmIds: string[];
  currentStage: 'receiving' | 'sorting' | 'dehydration' | 'powdering' | 'packing' | 'dispatch' | 'completed';
  sorting: {
    rawWeightKg: number;
    sortedWeightKg: number;
    rejectionWeightKg: number;
    rejectionRatePercent: number;
    sortedAt?: Date;
    sortedBy?: string;
    notes?: string;
  };
  dehydration: {
    dryerId: string;
    shift: string;
    tempC: number;
    fanSpeed: string;
    preProcessSteps: string[];
    preDryWeightKg: number;
    postDryWeightKg: number;
    yieldPercent: number;
    labourCost: number;
    utilityCost?: number;
    startedAt?: Date;
    completedAt?: Date;
    operator?: string;
    notes?: string;
  };
  powdering: {
    isPowdered: boolean;
    preSievedWeightKg: number;
    powderedWeightKg: number;
    meshSize: string;
    lossWeightKg: number;
    claimedForPowdering?: boolean;
    sievingStartedAt?: Date;
    powderedAt?: Date;
    operator?: string;
    notes?: string;
  };
  packing: {
    outputId: string;
    skuId?: string;
    skuName: string;
    packWeightGm: number;
    channel: string;
    totalPacksProduced: number;
    totalFinishedKg: number;
    packagingCost: number;
    packedAt?: Date;
    packedBy?: string;
    lotNumber: string;
    bestBefore?: Date;
    notes?: string;
  };
  dispatch: {
    destination: string;
    vehicleNo?: string;
    qualitySignOff: boolean;
    qcInspector?: string;
    qcInspectionDate?: Date;
    dispatchDate?: Date;
    dispatchedPacks: number;
    status: string;
    channel?: string;
    dispatched?: boolean;
    notes?: string;
  };
  totalRawKg: number;
  totalFinishedKg: number;
  remainingKg?: number;
  totalBatchCost: number;
  status: 'active' | 'stalled' | 'completed';
  createdAt: Date;
}

export interface IStorePackage {
  _id: string;
  outputId: string; // e.g. OP-20261015-01
  productId: string; // e.g. OP-20261015-01
  skuId?: string;
  skuName: string;
  skuSize: string; // '2kg' | '4kg' | '6kg' | ...
  skuSizeKg: number;
  channel: string;
  totalPacksProduced: number;
  totalFinishedKg: number;
  weightReturnedKg: number;
  lotNumber: string;
  expiryDate: Date | string;
  packedAt: Date | string;
  packedBy: string;
  sourceBatches: {
    batchId?: string;
    batchCode: string;
    produce: string;
    quantityUsedKg: number;
    isPowdered: boolean;
    remainingKg: number;
  }[];
  dispatch?: {
    destination: string;
    vehicleNo?: string;
    dispatchedBy?: string;
    qcInspector?: string;
    qcInspectionDate?: Date | string;
    dispatchDate?: Date | string;
    status: 'pending_qc' | 'qc_approved' | 'dispatched' | 'delivered';
    gatePassNo?: string;
    invoiceNo?: string;
  };
  notes?: string;
  createdAt: Date;
}

export interface IStoreSKU {
  _id: string;
  skuCode: string;
  name: string;
  category: string;
  produceSource: string;
  packWeightGm: number;
  mrp: number;
  sellingPrice: number;
  rawMaterialCost: number;
  labourCost: number;
  packagingCost: number;
  cogs: number;
  grossMarginPercent: number;
  currentStock: number;
  reorderThreshold: number;
  platforms: {
    amazon: boolean;
    blinkit: boolean;
    d2c: boolean;
    b2b: boolean;
    instamart?: boolean;
    zepto?: boolean;
  };
  fssaiLicenseNumber: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

export interface IStoreCompliance {
  _id: string;
  skuId: string;
  skuName: string;
  testType: string;
  batchCode?: string;
  labName: string;
  testDate: Date;
  expiryDate: Date;
  retestFrequencyMonths: number;
  reportUrl: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  parameterResults: { parameter: string; value: string; standardLimit: string; passed: boolean }[];
  verifiedBy: string;
  notes?: string;
}

export interface IStoreContent {
  _id: string;
  title: string;
  pillar: string;
  stage: string;
  format: string;
  targetSkuId?: string;
  targetSkuName?: string;
  clipIds: string[];
  hookText: string;
  scriptText?: string;
  assignedTo: string;
  channel: string;
  scheduledDate?: Date;
  publishedDate?: Date;
  postUrl?: string;
  boostCandidate: boolean;
  performance: { views: number; likes: number; shares: number; comments: number; roas?: number };
  createdAt: Date;
}

export interface IStoreCalendarPost {
  _id: string;
  title: string;
  caption: string;
  platform: 'LinkedIn' | 'Instagram Reel' | 'Instagram Post' | 'Instagram Story' | 'Facebook' | 'YouTube Short' | 'YouTube Long';
  channelGroup: 'LinkedIn' | 'Meta' | 'YouTube';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  status: 'draft' | 'scheduled' | 'published' | 'needs_shoot' | 'failed';
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaType?: 'video' | 'image' | 'carousel';
  mediaAssets?: { url: string; type: 'image' | 'video'; name?: string; thumbnail?: string }[];
  hashtags?: string[];
  pillar: string;
  targetSku?: string;
  owner?: string;
  publishedUrl?: string;
  publishError?: string;
  publishedAt?: Date;
  youtubeDetails?: {
    title?: string;
    description?: string;
    tags?: string[];
    privacy?: 'public' | 'unlisted' | 'private';
    categoryId?: string;
  };
  performance?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    impressions: number;
    engagementRate: number;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreShootSession {
  _id: string;
  title: string;
  type: 'Factory' | 'Founder' | 'Recipe' | 'Workshop' | 'Testimonial' | 'Other';
  status: 'planned' | 'shot' | 'logged' | 'archived';
  shootDate: string;
  location: string;
  cameraOperator: string;
  equipmentUsed?: string;
  thumbnailUrl?: string;
  rawAssetLink?: string;
  notes?: string;
  clipsCount?: number;
  clips?: string[];
  linkedPieces?: string[];
  createdAt: Date;
}

export interface IStoreShoot {
  _id: string;
  clipId: string;
  title: string;
  location: string;
  cropOrProduce: string;
  durationSeconds: number;
  tags: string[];
  videoUrl: string;
  thumbnailUrl: string;
  resolution: string;
  shootDate?: Date | string;
  cameraOperator: string;
  usageCount: number;
  status: 'raw' | 'edited' | 'archived';
  relatedBatchCode?: string;
  relatedCropCycleId?: string;
  attachedPieces?: { id: string; title: string; type: string }[];
}

export interface IStoreOrganicPost {
  _id: string;
  postId: string;
  title: string;
  caption: string;
  platform: 'Instagram Reel' | 'Instagram Post' | 'Instagram Carousel' | 'Instagram Story' | 'YouTube Short' | 'YouTube Video' | 'Facebook Post' | 'Facebook Reel' | 'Facebook Video' | 'LinkedIn' | string;
  channel: 'Instagram' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'Meta' | string;
  channelHandle?: string;
  postUrl: string;
  publishedDate: string;
  thumbnailUrl: string;
  theme: string;
  hookType: string;
  views: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
  isBoostCandidate: boolean;
  watchTimeHours?: number;
  videoDurationSeconds?: number;
  retentionPercent?: number;
}

export interface IStoreInfluencer {
  _id: string;
  name: string;
  handle: string;
  profileUrl?: string;
  profilePicUrl?: string;
  igHandle?: string;
  ytHandle?: string;
  liHandle?: string;
  platform: string;
  followers: number;
  engagementRate?: number;
  totalReels?: number;
  tier?: 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | string;
  niche: string;
  gender?: 'Female' | 'Male' | 'Non-binary' | 'Other' | string;
  age?: string | number;
  geographicalData?: {
    country?: string;
    state?: string;
    city?: string;
    audienceGeo?: string;
  };
  status: string;
  collaborations: any[];
  totalSpent: number;
  totalRevenue: number;
  overallRoas: number;
  contactEmail: string;
  contactPhone: string;
  city?: string;
  notes?: string;
  createdAt: Date;
}

export interface IStorePaymentInstallment {
  _id: string;
  amount: number;
  paidAt: string;
  utrNumber: string;
  paymentMethod: string;
  notes?: string;
  createdAt?: Date | string;
}

export interface IStoreCollab {
  _id: string;
  influencerId: string;
  influencerName: string;
  handle: string;
  platform?: string;
  deliverable: string;
  type: 'Reel' | 'YouTube Short' | 'Dedicated Video' | 'Carousel' | 'Story Set' | 'LinkedIn Post' | string;
  stage: 'outreach' | 'sample_sent' | 'brief_agreed' | 'script_review' | 'content_live' | 'completed' | 'dropped' | string;
  dealType?: 'barter' | 'paid' | 'rev_share' | 'hybrid' | string;
  barterDetails?: {
    productSent?: string;
    productCost?: number;
    dispatchStatus?: string;
    trackingNumber?: string;
  };
  productSent: string;
  productCost: number;
  fee: number;
  revenueSharePercent?: number;
  paymentStatus?: 'unpaid' | 'advance_paid' | 'fully_paid' | 'barter_delivered' | string;
  utrNumber?: string;
  paymentMethod?: string;
  paymentDate?: string;
  paymentInstallments?: IStorePaymentInstallment[];
  totalPaid?: number;
  advanceStatus?: 'pending' | 'paid' | 'not_applicable' | string;
  finalPaymentStatus?: 'pending' | 'cleared' | 'overdue' | string;
  paymentDueDate?: string;
  invoiceNumber?: string;
  dueDate?: string;
  liveDate?: string;
  postUrl?: string;
  promoCode?: string;
  views: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  engagementRate?: number;
  ordersTracked: number;
  revenue: number;
  roi: number;
  approachRecommendation?: 'partnership_ad' | 'paid_ad_ugc' | 'organic_only' | string;
  lastRefreshedAt?: Date | string;
  shopifyLastSyncedAt?: Date | string;
  shopifyOrders?: Array<{
    orderId: string;
    orderNumber: string;
    createdAt: string;
    totalPrice: number;
    discountAmount?: number;
    currency?: string;
    financialStatus: string;
    customerName?: string;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreNPD {
  _id: string;
  title: string;
  concept: string;
  category: string;
  surplusCrop: string;
  originatingSignal: string;
  stage: string;
  demandValidation: {
    marketSizeEstimate: string;
    competitorBrands: string[];
    recommendedPriceRange: string;
    consumerTarget: string;
    isApproved: boolean;
  };
  labTrial: {
    formulationNotes: string;
    dehydrationTempC: number;
    tasteScore: number;
    textureScore: number;
    yieldObservedPercent: number;
    recipeLocked: boolean;
  };
  commercialTrial: {
    batchTrialCode?: string;
    trialYieldKg: number;
    pilotPacksProduced: number;
    fssaiReportUrl?: string;
    compliancePassed: boolean;
  };
  targetMrp: number;
  estimatedCogs: number;
  estimatedGrossMarginPercent: number;
  createdSkuCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStorePnL {
  _id: string;
  month: string;
  revenue: {
    d2c: number;
    amazon: number;
    blinkit: number;
    b2b: number;
    exports: number;
    totalRevenue: number;
  };
  cogs: {
    rawMaterialProcurement: number;
    processingLabour: number;
    packagingCost: number;
    factoryUtilities: number;
    totalCogs: number;
  };
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: {
    marketingAdsMeta: number;
    marketingAdsGoogle: number;
    marketingAdsAmazon: number;
    influencerCollabs: number;
    contentProduction: number;
    teamSalaries: number;
    factoryRent: number;
    logisticsAndShipping: number;
    paymentGatewayFees: number;
    fbaAndQuickCommerceFees: number;
    rtoAndDamageCost: number;
    softwareAndCloud: number;
    legalAndInsurance: number;
    travelAndAdmin: number;
    depreciation: number;
    interestAndFinance: number;
    totalOpex: number;
  };
  ebitda: number;
  ebitdaMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  notes?: string;
  isLocked: boolean;
}

export interface IStoreUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  modules: string[];
  avatar: string;
  isActive: boolean;
  lastLogin: Date;
}

export interface IStoreActivityLog {
  _id: string;
  module: string;
  action: string;
  title: string;
  description: string;
  entityId?: string;
  userName: string;
  timestamp: Date;
}

export interface IStoreWorker {
  _id: string;
  name: string;
  role: string;
  dailyRate: number;
  otMultiplier: number;
  active: boolean;
  createdAt: Date;
}

export interface IStoreAttendance {
  _id: string;
  workerId: string;
  workerName: string;
  date: string;
  shift: string;
  checkIn: Date | string | null;
  checkOut: Date | string | null;
  hoursWorked: number | null;
  status: 'present' | 'absent' | 'half_day';
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreUtilityStock {
  _id: string;
  name: string;
  category: string; // 'Packaging' | 'Utilities' | 'Raw Materials' | 'Consumables' | 'Chemicals / Cleaning'
  unit: string; // 'pcs' | 'kg' | 'liters' | 'boxes' | 'rolls' | 'units' | 'kWh' | 'hours'
  unitCost: number;
  currentStock: number;
  reorderLevel: number;
  preferredVendor?: string;
  preferredVendorName?: string;
  notes?: string;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreVendor {
  _id: string;
  vendorCode: string;
  name: string;
  gstNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms: string; // 'Net 30' | 'Net 15' | 'Net 45' | 'Immediate / Advance' | '50% Advance' | 'COD'
  leadTimeDays: number;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStorePurchaseOrder {
  _id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  itemId?: string;
  itemName: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  orderDate: string;
  expectedDelivery?: string;
  invoiceNumber?: string;
  status: 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
  notes?: string;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreEquipment {
  _id: string;
  code: string;
  name: string;
  category: string;
  status: 'active' | 'idle' | 'maintenance' | 'calibrating';
  powerKw: number;
  capacityPerHrKg: number;
  tempC?: number;
  airflowLevel?: number;
  healthScorePercent: number;
  activeLoadKg: number;
  currentBatch?: string;
  notes?: string;
  updatedAt?: Date;
}

export interface IStoreCropProcessing {
  _id: string;
  cropName: string;
  washTimeMin: number;
  sliceThicknessMm: string;
  blanchingTempC: number;
  dehydrationTempC: number;
  dehydrationDurationHours: number;
  targetMoisturePercent: number;
  yieldPercent: number;
  millingMeshSize: string;
  laborHoursPerTon: number;
  notes?: string;
}

export interface IStoreShiftSchedule {
  _id: string;
  shiftCode: string;
  shiftName: string;
  shiftDate: string;
  supervisorName: string;
  assignedOperators: string[];
  assignedEquipment: string[];
  scheduledBatches: string[];
  targetProcessingKg: number;
  actualProcessingKg: number;
  targetOutputKg: number;
  actualOutputKg: number;
  status: 'active' | 'scheduled' | 'completed';
  notes?: string;
}

export interface IStoreShiftSetup {
  _id: string;
  name: string;
  hours: string;
  durationHours: number;
  breakDurationMin: number;
  equipmentLines: string[];
  manpowerCount: number;
  skilledRoles: string[];
  maxIntakeCapacityKg: number;
  targetOEEPercent: number;
  airflowLevelTarget: number;
  tempTargetC: number;
}

export interface IStorePayment {
  _id: string;
  referenceId: string;
  recipientType: 'farmer' | 'vendor' | 'influencer' | 'worker' | 'reimbursement' | 'other';
  recipientName: string;
  category: string;
  detail: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMode?: 'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'Cash' | 'Cheque';
  utrRef?: string;
  status: 'pending' | 'processing' | 'paid' | 'overdue';
  ageDays: number;
  notes?: string;
  createdAt: Date;
}

export interface IStoreExpense {
  _id: string;
  voucherNo: string;
  person: string;
  submittedBy?: string;
  date: string;
  category: 'Travel' | 'Materials' | 'Food' | 'Transport' | 'Office supplies' | 'Miscellaneous';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  reimbursementStatus: 'pending' | 'processing' | 'complete';
  billImageKey?: string;
  createdAt: Date;
}

export interface IStorePackaging {
  _id: string;
  skuName: string;
  skuCode?: string;
  country: string;
  version: string;
  status: 'draft' | 'review' | 'approved';
  packagingType: string;
  fssaiNumber?: string;
  netWeight?: string;
  regulatoryStandard?: string;
  barcode?: string;
  artworkUrl?: string;
  nutritionPanelVerified: boolean;
  allergensDeclared: string;
  shelfLifeMonths: number;
  notes?: string;
  updatedAt: Date;
}

export interface IStoreB2BLead {
  _id: string;
  name: string;
  type: string;
  stage: 'lead' | 'contacted' | 'sample_sent' | 'negotiation' | 'won' | 'lost';
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
  gst?: string;
  address?: string;
  estimatedValue: number;
  creditLimit: number;
  paymentTerms: string;
  samplesSent: { item: string; date: string; feedback?: string }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreB2BOrder {
  _id: string;
  clientId: string;
  clientName: string;
  orderNumber: string;
  items: { skuName: string; quantityKg: number; ratePerKg: number; total: number }[];
  totalAmount: number;
  orderDate: string;
  deliveryDueDate: string;
  status: 'draft' | 'confirmed' | 'processing' | 'dispatched' | 'delivered';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface IStoreStatic {
  _id: string;
  title: string;
  stage: 'brief' | 'design' | 'review' | 'approved' | 'live';
  type: string;
  platform: string;
  owner: string;
  dueDate: string;
  assetLink?: string;
  dimensions?: string;
  notes?: string;
  createdAt: Date;
}

export interface IStoreAdCreative {
  _id: string;
  creativeId?: string;
  name?: string;
  title: string;
  platform: 'Meta' | 'Google' | 'Amazon';
  subType?: 'Meta Ad' | 'Google Performance Max' | 'Google Search';
  stage?: 'request' | 'script' | 'sourcing' | 'edit' | 'ready' | 'pushed';
  channel?: 'Meta' | 'Google' | 'Amazon';
  creativeType?: 'Video' | 'Static' | 'Carousel' | 'Responsive Search' | 'Asset Group';
  productSku?: string;
  hook?: string;
  hookType?: string;
  adFormat?: string;
  owner: string;
  plannedLaunchDate?: string;
  dueDate?: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Live' | 'Paused';
  landingPageUrl?: string;
  utmLink?: string;
  scriptSnippet?: string;
  assetUrl?: string;
  notes?: string;
  
  // Meta (Facebook / Instagram) specifics
  metaDetails?: {
    campaignName?: string;
    adSetName?: string;
    adName?: string;
    objective?: string;
    audience?: string;
    placements?: string[]; // 'Feed' | 'Reels' | 'Stories'
    primaryTexts?: string[]; // up to 5 variants (125 chars)
    headlines?: string[]; // up to 5 variants (40 chars)
    descriptions?: string[]; // up to 5 variants (30 chars)
    callToAction?: string; // 'Shop Now' | 'Learn More' | 'Order Now' etc.
    destinationUrl?: string;
    displayLink?: string;
    format?: 'image' | 'video' | 'carousel';
    mediaRatios?: { ratio: string; url: string }[];
    videoLengthSeconds?: number;
    carouselCards?: { image: string; headline: string; link: string }[];
  };

  // Google Performance Max specifics
  pmaxDetails?: {
    campaignName?: string;
    assetGroupName?: string;
    headlines?: string[]; // 3-15 (30 chars)
    longHeadlines?: string[]; // 1-5 (90 chars)
    descriptions?: string[]; // 2-5 (90 chars, one <= 60)
    businessName?: string; // 25 chars
    logos?: { square?: string; landscape?: string }; // 1:1 and 4:1
    images?: { landscape?: string; square?: string; portrait?: string }; // 1.91:1, 1:1, 4:5
    videoUrls?: string[]; // YouTube links
    finalUrl?: string;
    displayPaths?: string[]; // 2 x 15 chars
    callToAction?: string;
    audienceSignals?: string;
    searchThemes?: string[];
  };

  // Google Search specifics
  searchDetails?: {
    campaignName?: string;
    adGroupName?: string;
    keywords?: { keyword: string; matchType: 'broad' | 'phrase' | 'exact' }[];
    headlines?: string[]; // 3-15 (30 chars)
    descriptions?: string[]; // 2-4 (90 chars)
    finalUrl?: string;
    displayPaths?: string[]; // 2 x 15 chars
    sitelinks?: { text: string; url: string }[];
    callouts?: string[];
    structuredSnippets?: { header: string; values: string[] };
  };

  // Results automatically pulled from API
  results?: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    purchases: number;
    roas: number;
    cpa: number;
    lastUpdated?: Date;
  };

  externalId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStorePaidAd {
  _id: string;
  campaignName: string;
  channel: 'Meta' | 'Google' | 'Amazon';
  status: 'Active' | 'Paused' | 'Testing' | 'Completed';
  dailyBudget: number;
  totalSpend: number;
  roas: number;
  clicks: number;
  conversions: number;
  cpa: number;
  cpc: number;
  startDate: string;
}

export interface IStoreFarmPartner {
  _id: string;
  name: string;
  type: 'FPO' | 'Mandi' | 'Trader' | 'Other';
  contact: string;
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreFarmerPlot {
  _id: string;
  farmerId: string;
  name: string;
  acres: number;
  soilType: string;
  irrigation: string;
  createdAt: Date;
}

export interface IStoreSoilWaterTest {
  _id: string;
  farmerId: string;
  testType: 'soil' | 'water';
  plotId?: string;
  date: string;
  lab: string;
  results: Record<string, string | number>;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreFarmActivity {
  _id: string;
  farmerId: string;
  cycleId?: string;
  plotId?: string;
  activityType: string;
  date: string;
  description: string;
  product?: string;
  qty?: string | number;
  unit?: string;
  cost?: number;
  variety?: string;
  cycleStage?: string;
  remarks?: string;
  media?: { url: string; name: string; type: string; size?: number }[];
  flagContent?: boolean;
  crop?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IStoreCropDiagnosis {
  _id: string;
  farmerId: string;
  crop: string;
  stage: string;
  symptoms: string;
  photoUrl?: string;
  diagnosis: string;
  createdAt: Date;
}

export interface IMemoryStore {
  farmers: IStoreFarmer[];
  cropMasters: IStoreCropMaster[];
  cropCycles: IStoreCropCycle[];
  receipts: IStoreReceipt[];
  farmPartners: IStoreFarmPartner[];
  farmerPlots: IStoreFarmerPlot[];
  soilWaterTests: IStoreSoilWaterTest[];
  farmActivities: IStoreFarmActivity[];
  cropDiagnoses: IStoreCropDiagnosis[];
  batches: IStoreBatch[];
  skus: IStoreSKU[];
  complianceTests: IStoreCompliance[];
  contentItems: IStoreContent[];
  shootClips: IStoreShoot[];
  shoots: IStoreShootSession[];
  calendarPosts: IStoreCalendarPost[];
  organicPosts: IStoreOrganicPost[];
  influencers: IStoreInfluencer[];
  collabs: IStoreCollab[];
  npdProducts: IStoreNPD[];
  pnlEntries: IStorePnL[];
  users: IStoreUser[];
  activityLogs: IStoreActivityLog[];
  workers: IStoreWorker[];
  attendanceLogs: IStoreAttendance[];
  utilityStock: IStoreUtilityStock[];
  vendors: IStoreVendor[];
  purchaseOrders: IStorePurchaseOrder[];
  equipment: IStoreEquipment[];
  cropProcessing: IStoreCropProcessing[];
  shiftSchedules: IStoreShiftSchedule[];
  shiftSetups: IStoreShiftSetup[];
  payments: IStorePayment[];
  expenses: IStoreExpense[];
  packaging: IStorePackaging[];
  b2bLeads: IStoreB2BLead[];
  b2bOrders: IStoreB2BOrder[];
  statics: IStoreStatic[];
  adCreatives: IStoreAdCreative[];
  paidAds: IStorePaidAd[];
  packages: IStorePackage[];
  planningScenarios?: any[];
  demandPlans?: any[];
  channelCustomStats?: {
    instagram?: { followers: number; following?: number; postsCount?: number; reach30d?: number; er?: string };
    youtube?: { subs: number; videosCount?: number; totalViews?: number; watchHours?: number; er?: string };
    facebook?: { followers: number; likes?: number; postsCount?: number; reach30d?: number; er?: string };
  };
}


export const ALL_SYSTEM_MODULES = [
  'dashboard',
  'board',
  'calendar',
  'shoots',
  'ads',
  'statics',
  'influencers',
  'analytics',
  'skus',
  'farmers',
  'procurement',
  'factory',
  'batches',
  'production',
  'planning',
  'npd',
  'inventory',
  'pnl',
  'finance',
  'users',
  'flowchart'
];

export const memoryStore: IMemoryStore = {
  farmers: [],
  cropMasters: [],
  cropCycles: [],
  receipts: [],
  farmPartners: [],
  farmerPlots: [],
  soilWaterTests: [],
  farmActivities: [],
  cropDiagnoses: [],
  users: [
    {
      _id: 'usr_admin',
      name: 'Admin',
      email: 'admin@koh.in',
      password: 'admin@123',
      role: 'Admin',
      modules: ALL_SYSTEM_MODULES,
      avatar: '👑',
      isActive: true,
      lastLogin: new Date()
    },
    {
      _id: 'usr_shivam',
      name: 'Shivam Singh',
      email: 'shivam953647@gmail.com',
      password: 'password123456',
      role: 'Batch Staff',
      modules: ['production', 'factory', 'batches', 'receiving', 'sorting', 'dehydration', 'powdering', 'packing', 'dispatch', 'farmers', 'procurement', 'inventory', 'dashboard', 'skus'],
      avatar: '👨‍🏭',
      isActive: true,
      lastLogin: new Date()
    },
    {
      _id: '6ab160aa9e3ee5bac6048928',
      name: 'test',
      email: 'test@gmail.com',
      password: '123456',
      role: 'Finance & Accounting',
      modules: ['finance', 'attendance'],
      avatar: '💰',
      isActive: true,
      lastLogin: new Date()
    }
  ],
  batches: [],
  skus: [],
  complianceTests: [],
  contentItems: [],
  shootClips: [],
  influencers: [],
  npdProducts: [],
  pnlEntries: [],
  activityLogs: [],
  workers: [],
  attendanceLogs: [],
  utilityStock: [],
  vendors: [],
  purchaseOrders: [],
  equipment: [],
  cropProcessing: [],
  shiftSchedules: [],
  shiftSetups: [],
  payments: [],
  expenses: [],
  packaging: [],
  b2bLeads: [],
  b2bOrders: [],
  statics: [],
  adCreatives: [],
  paidAds: [],
  calendarPosts: [],
  shoots: [],
  organicPosts: [],
  collabs: [],
  packages: [],
  planningScenarios: [],
  demandPlans: []
};

// Static marketing dummy data removed: all data is user-entered
export const seedMarketingDataIfEmpty = () => {
  // Intentionally empty
};

// ==========================================
// DIRECT DATABASE PERSISTENCE LAYER (MONGODB)
// Direct persistence to MongoDB; file-system storage completely eliminated
// ==========================================

let dbSyncHandler: ((collectionName?: keyof IMemoryStore) => Promise<void>) | null = null;
export const registerDbSyncHandler = (fn: (collectionName?: keyof IMemoryStore) => Promise<void>) => {
  dbSyncHandler = fn;
};

// Debounce timer for MongoDB persist to batch rapid mutations cleanly
let syncTimeout: NodeJS.Timeout | null = null;
const pendingCollections = new Set<keyof IMemoryStore>();

export const saveStore = (collectionName?: keyof IMemoryStore) => {
  try {
    if (!dbSyncHandler) return;

    if (collectionName) {
      pendingCollections.add(collectionName);
    }

    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(() => {
      syncTimeout = null;
      if (!dbSyncHandler) return;

      if (pendingCollections.size > 0 && pendingCollections.size <= 5) {
        const toSync = Array.from(pendingCollections);
        pendingCollections.clear();
        toSync.forEach(col => {
          dbSyncHandler!(col).catch(e => console.warn(`[MongoDB Sync Warning for ${String(col)}]:`, e.message));
        });
      } else {
        pendingCollections.clear();
        dbSyncHandler().catch(e => console.warn('[MongoDB Sync Warning]:', e.message));
      }
    }, 150);
  } catch (err) {
    console.error('[DataStore] Failed to trigger MongoDB sync:', err);
  }
};

// Pure DB mode: File system loading eliminated.
// Direct MongoDB loading is handled on startup via initDatabaseSync().
export const loadStore = () => {
  // Direct MongoDB loading is handled on startup via initDatabaseSync()
};

// Graceful exit handlers to flush any pending mutations to MongoDB before shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (dbSyncHandler) {
      try {
        await dbSyncHandler();
      } catch (e) {}
    }
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    if (dbSyncHandler) {
      try {
        await dbSyncHandler();
      } catch (e) {}
    }
    process.exit(0);
  });
}


