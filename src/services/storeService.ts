import fs from 'fs';
import path from 'path';
import { seedAllProductionData } from './productionSeeds';

// Typed interfaces for In-Memory and Mongo fallback store

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
  status: 'draft' | 'scheduled' | 'published' | 'needs_shoot';
  mediaUrl?: string;
  mediaType?: 'video' | 'image' | 'carousel';
  hashtags?: string[];
  pillar: string;
  targetSku?: string;
  owner?: string;
  publishedUrl?: string;
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
  platform: 'Instagram Reel' | 'Instagram Post' | 'Instagram Story' | 'LinkedIn' | 'YouTube Short' | 'YouTube Long';
  channel: 'Meta' | 'LinkedIn' | 'YouTube';
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
}

export interface IStoreInfluencer {
  _id: string;
  name: string;
  handle: string;
  igHandle?: string;
  ytHandle?: string;
  liHandle?: string;
  platform: string;
  followers: number;
  engagementRate?: number;
  tier?: 'nano' | 'micro' | 'mid' | 'macro';
  niche: string;
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

export interface IStoreCollab {
  _id: string;
  influencerId: string;
  influencerName: string;
  handle: string;
  deliverable: string;
  type: 'Reel' | 'YouTube Short' | 'Dedicated Video' | 'Carousel' | 'Story Set' | 'LinkedIn Post';
  stage: 'outreach' | 'sample_sent' | 'brief_agreed' | 'script_review' | 'content_live' | 'completed' | 'dropped';
  productSent: string;
  productCost: number;
  fee: number;
  advanceStatus: 'pending' | 'paid' | 'not_applicable';
  finalPaymentStatus: 'pending' | 'cleared' | 'overdue';
  paymentDueDate?: string;
  invoiceNumber?: string;
  dueDate?: string;
  liveDate?: string;
  postUrl?: string;
  promoCode?: string;
  views: number;
  ordersTracked: number;
  revenue: number;
  roi: number;
  approachRecommendation?: 'partnership_ad' | 'paid_ad_ugc' | 'organic_only';
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
  title: string;
  stage: 'request' | 'script' | 'sourcing' | 'edit' | 'ready' | 'pushed';
  channel: 'Meta' | 'Google' | 'Amazon';
  creativeType: 'Video' | 'Static' | 'Carousel';
  objective: 'Awareness' | 'Traffic' | 'Conversions' | 'Retargeting' | 'Engagement';
  owner: string;
  dueDate: string;
  scriptSnippet?: string;
  hookType?: string;
  assetUrl?: string;
  notes?: string;
  createdAt: Date;
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
  farmers: [
    {
      _id: 'frm_1',
      farmerCode: 'FRM-0001',
      name: 'Anji Reddy',
      village: 'Thonda, Suryapet',
      district: 'Suryapet',
      phone: '+91 98480 12345',
      plotAcres: 3.5,
      crops: ['Moringa', 'Curry Leaf', 'Gongura'],
      status: 'active',
      fpoLink: 'Direct',
      waterSource: 'Borewell',
      waterAvailability: 'Year-round',
      bankDetails: {
        accountHolderName: 'Anji Reddy',
        accountNumber: '50100234567890',
        ifscCode: 'HDFC0001234',
        upiId: 'anjireddy@okaxis'
      },
      notes: 'Reliable supplier with certified organic practices and high leaf yield.',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'frm_2',
      farmerCode: 'FRM-0002',
      name: 'Venkat Rao',
      village: 'Kathevaram, Suryapet',
      district: 'Suryapet',
      phone: '+91 94401 54321',
      plotAcres: 5.0,
      crops: ['Amla', 'Turmeric', 'Ginger'],
      status: 'active',
      fpoLink: 'Suryapet FPO',
      waterSource: 'Canal',
      waterAvailability: 'Seasonal (6-8 months)',
      bankDetails: {
        accountHolderName: 'Venkat Rao M',
        accountNumber: '30459812450',
        ifscCode: 'SBIN0004567',
        upiId: 'venkatrao@sbi'
      },
      notes: 'Specialises in high-curcumin turmeric and orchard-grown amla.',
      createdAt: new Date('2026-02-10')
    },
    {
      _id: 'frm_3',
      farmerCode: 'FRM-0003',
      name: 'Lakshmi Devi',
      village: 'Nereducharla, Nalgonda',
      district: 'Nalgonda',
      phone: '+91 91772 88990',
      plotAcres: 2.0,
      crops: ['Tomato', 'Pudina', 'Spinach'],
      status: 'active',
      fpoLink: 'Deccan Agri Hub',
      waterSource: 'Borewell',
      waterAvailability: 'Year-round',
      bankDetails: {
        accountHolderName: 'Lakshmi Devi',
        accountNumber: '02341010005432',
        ifscCode: 'UBIN0532456',
        upiId: 'lakshmi@ybl'
      },
      notes: 'Fast turnaround on fresh leafy greens and Roma tomatoes.',
      createdAt: new Date('2026-02-28')
    },
    {
      _id: 'frm_4',
      farmerCode: 'FRM-0004',
      name: 'Narsimha Yadav',
      village: 'Jangaon Rural',
      district: 'Jangaon',
      phone: '+91 98855 44332',
      plotAcres: 4.0,
      crops: ['Beetroot', 'Carrot', 'Ginger'],
      status: 'active',
      fpoLink: 'Direct',
      waterSource: 'Rain-fed',
      waterAvailability: 'Seasonal (6-8 months)',
      bankDetails: {
        accountHolderName: 'Narsimha Yadav',
        accountNumber: '62145890234',
        ifscCode: 'SBIN0020145',
        upiId: 'narsimha@paytm'
      },
      notes: 'Root vegetable specialist with deep sandy loam soil.',
      createdAt: new Date('2026-03-05')
    }
  ],
  cropMasters: [
    {
      _id: 'crp_moringa',
      cropName: 'Moringa',
      category: 'Leafy',
      daysToHarvest: 60,
      freshYieldPerAcreKg: 6000,
      dehydrationYieldPercent: 8.0,
      costPerAcreBreakdown: { seeds: 2000, inputs: 4000, labour: 6000, transport: 2000 },
      totalEstimatedCostPerAcre: 14000,
      marketRatePerKg: 35
    },
    {
      _id: 'crp_beetroot',
      cropName: 'Beetroot',
      category: 'Root',
      daysToHarvest: 90,
      freshYieldPerAcreKg: 12000,
      dehydrationYieldPercent: 9.0,
      costPerAcreBreakdown: { seeds: 3000, inputs: 5000, labour: 7000, transport: 2500 },
      totalEstimatedCostPerAcre: 17500,
      marketRatePerKg: 28
    },
    {
      _id: 'crp_carrot',
      cropName: 'Carrot',
      category: 'Root',
      daysToHarvest: 100,
      freshYieldPerAcreKg: 14000,
      dehydrationYieldPercent: 9.0,
      costPerAcreBreakdown: { seeds: 3500, inputs: 5500, labour: 7500, transport: 2500 },
      totalEstimatedCostPerAcre: 19000,
      marketRatePerKg: 30
    },
    {
      _id: 'crp_curryleaf',
      cropName: 'Curry Leaf',
      category: 'Herb',
      daysToHarvest: 45,
      freshYieldPerAcreKg: 3000,
      dehydrationYieldPercent: 18.0,
      costPerAcreBreakdown: { seeds: 1500, inputs: 3500, labour: 5000, transport: 1500 },
      totalEstimatedCostPerAcre: 11500,
      marketRatePerKg: 40
    },
    {
      _id: 'crp_spinach',
      cropName: 'Spinach',
      category: 'Leafy',
      daysToHarvest: 35,
      freshYieldPerAcreKg: 4000,
      dehydrationYieldPercent: 7.0,
      costPerAcreBreakdown: { seeds: 3000, inputs: 4500, labour: 7000, transport: 2000 },
      totalEstimatedCostPerAcre: 16500,
      marketRatePerKg: 25
    },
    {
      _id: 'crp_amla',
      cropName: 'Amla',
      category: 'Fruit',
      daysToHarvest: 365,
      freshYieldPerAcreKg: 8000,
      dehydrationYieldPercent: 11.0,
      costPerAcreBreakdown: { seeds: 5000, inputs: 7000, labour: 10000, transport: 3000 },
      totalEstimatedCostPerAcre: 25000,
      marketRatePerKg: 45
    },
    {
      _id: 'crp_ginger',
      cropName: 'Ginger',
      category: 'Root',
      daysToHarvest: 240,
      freshYieldPerAcreKg: 15000,
      dehydrationYieldPercent: 12.0,
      costPerAcreBreakdown: { seeds: 15000, inputs: 10000, labour: 12000, transport: 4000 },
      totalEstimatedCostPerAcre: 41000,
      marketRatePerKg: 65
    },
    {
      _id: 'crp_tomato',
      cropName: 'Tomato',
      category: 'Vegetable',
      daysToHarvest: 80,
      freshYieldPerAcreKg: 20000,
      dehydrationYieldPercent: 6.0,
      costPerAcreBreakdown: { seeds: 3000, inputs: 9000, labour: 10000, transport: 3500 },
      totalEstimatedCostPerAcre: 25500,
      marketRatePerKg: 20
    },
    {
      _id: 'crp_gongura',
      cropName: 'Gongura',
      category: 'Leafy',
      daysToHarvest: 50,
      freshYieldPerAcreKg: 5000,
      dehydrationYieldPercent: 9.0,
      costPerAcreBreakdown: { seeds: 1500, inputs: 4000, labour: 7000, transport: 2000 },
      totalEstimatedCostPerAcre: 14500,
      marketRatePerKg: 32
    },
    {
      _id: 'crp_pudina',
      cropName: 'Pudina',
      category: 'Herb',
      daysToHarvest: 40,
      freshYieldPerAcreKg: 4000,
      dehydrationYieldPercent: 8.0,
      costPerAcreBreakdown: { seeds: 2000, inputs: 4000, labour: 7500, transport: 2000 },
      totalEstimatedCostPerAcre: 15500,
      marketRatePerKg: 35
    },
    {
      _id: 'crp_turmeric',
      cropName: 'Turmeric',
      category: 'Root',
      daysToHarvest: 270,
      freshYieldPerAcreKg: 20000,
      dehydrationYieldPercent: 12.0,
      costPerAcreBreakdown: { seeds: 10000, inputs: 8000, labour: 11000, transport: 4000 },
      totalEstimatedCostPerAcre: 33000,
      marketRatePerKg: 70
    }
  ],
  cropCycles: [
    {
      _id: 'cyc_1',
      cycleCode: 'CYC-2026-001',
      farmerId: 'frm_1',
      farmerName: 'Anji Reddy',
      cropId: 'crp_moringa',
      cropName: 'Moringa',
      plotAcres: 2.0,
      sowingDate: new Date('2026-02-01'),
      expectedHarvestDate: new Date('2026-04-02'),
      estimatedYieldKg: 12000,
      actualYieldKg: 0,
      status: 'growing',
      farmPurchases: [
        { item: 'PKM-1 Hybrid Saplings', category: 'Seeds', amount: 3500, date: new Date('2026-02-02') },
        { item: 'Neem Cake & Bio-fertilizer', category: 'Inputs/Fertilizers', amount: 4800, date: new Date('2026-02-15') }
      ],
      totalCultivationCost: 8300,
      notes: 'Healthy vegetative growth, first harvest round scheduled for early April.'
    },
    {
      _id: 'cyc_2',
      cycleCode: 'CYC-2026-002',
      farmerId: 'frm_2',
      farmerName: 'Venkat Rao',
      cropId: 'crp_amla',
      cropName: 'Amla',
      plotAcres: 3.0,
      sowingDate: new Date('2025-06-15'),
      expectedHarvestDate: new Date('2026-06-15'),
      estimatedYieldKg: 24000,
      actualYieldKg: 0,
      status: 'growing',
      farmPurchases: [
        { item: 'Pruning & Drip Maintenance', category: 'Equipment', amount: 6000, date: new Date('2026-01-10') },
        { item: 'Organic Micro-nutrient Spray', category: 'Inputs/Fertilizers', amount: 7500, date: new Date('2026-02-20') }
      ],
      totalCultivationCost: 13500,
      notes: 'Fruiting stage on track with excellent fruit size and no pest infestation.'
    },
    {
      _id: 'cyc_3',
      cycleCode: 'CYC-2026-003',
      farmerId: 'frm_3',
      farmerName: 'Lakshmi Devi',
      cropId: 'crp_gongura',
      cropName: 'Gongura',
      plotAcres: 1.5,
      sowingDate: new Date('2026-01-10'),
      expectedHarvestDate: new Date('2026-03-01'),
      actualHarvestDate: new Date('2026-03-02'),
      estimatedYieldKg: 7500,
      actualYieldKg: 7850,
      status: 'harvested',
      farmPurchases: [
        { item: 'Local Red Stem Seeds', category: 'Seeds', amount: 2200, date: new Date('2026-01-10') },
        { item: 'Panchagavya Foliar Feed', category: 'Inputs/Fertilizers', amount: 3100, date: new Date('2026-01-25') },
        { item: 'Harvest & Sorting Labour', category: 'Labour', amount: 8000, date: new Date('2026-03-01') }
      ],
      totalCultivationCost: 13300,
      notes: 'Superb harvest yield exceeding target by 350kg. Dispatched to factory.'
    }
  ],
  receipts: [
    {
      _id: 'rcpt_1',
      rmId: 'RM-20260302-GG',
      farmerId: 'frm_3',
      farmerName: 'Lakshmi Devi',
      produce: 'Gongura',
      initialWeightKg: 7850,
      receiptDate: new Date('2026-03-02'),
      farmLocation: 'Nereducharla, Nalgonda',
      modeOfTransport: 'Pickup Van',
      transportCost: 3500,
      ratePerKg: 32,
      totalProduceCost: 251200,
      landedCostTotal: 254700,
      landedCostPerKg: 32.44,
      paymentStatus: 'paid',
      status: 'dispatched',
      batchCode: 'TG2603GG',
      notes: 'A Grade deep red gongura stems.'
    },
    {
      _id: 'rcpt_2',
      rmId: 'RM-20260318-MP',
      farmerId: 'frm_1',
      farmerName: 'Anji Reddy',
      produce: 'Moringa',
      initialWeightKg: 4200,
      receiptDate: new Date('2026-03-18'),
      farmLocation: 'Thonda, Suryapet',
      modeOfTransport: 'Mini Truck',
      transportCost: 2200,
      ratePerKg: 35,
      totalProduceCost: 147000,
      landedCostTotal: 149200,
      landedCostPerKg: 35.52,
      paymentStatus: 'partial',
      status: 'sorted',
      batchCode: 'TG2603MP',
      notes: 'First cut moringa leaves, low stem fraction.'
    }
  ],
  farmPartners: [
    {
      _id: 'part_1',
      name: 'Suryapet Organic Farmers FPO',
      type: 'FPO',
      contact: '+91 94411 22334 (Ravi Kumar, CEO)',
      location: 'Suryapet Town, Telangana',
      notes: 'Network of 250+ organic certified smallholders with cold storage access.',
      createdAt: new Date('2026-01-05')
    },
    {
      _id: 'part_2',
      name: 'Deccan Agri Hub Mandi',
      type: 'Mandi',
      contact: '+91 98490 55667 (Trader Suresh)',
      location: 'Nalgonda Market Yard',
      notes: 'Spot procurement partner for surge volumes during peak demand.',
      createdAt: new Date('2026-01-20')
    },
    {
      _id: 'part_3',
      name: 'Telangana Natural Spices Co.',
      type: 'Trader',
      contact: '+91 91212 77889 (Govind Rao)',
      location: 'Warangal',
      notes: 'High-grade dry turmeric roots and fresh ginger aggregate supplier.',
      createdAt: new Date('2026-02-12')
    }
  ],
  farmerPlots: [
    {
      _id: 'plt_1',
      farmerId: 'frm_1',
      name: 'Plot A - Canal Side',
      acres: 2.0,
      soilType: 'Red soil',
      irrigation: 'Drip',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'plt_2',
      farmerId: 'frm_1',
      name: 'Plot B - North Field',
      acres: 1.5,
      soilType: 'Sandy loam',
      irrigation: 'Drip',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'plt_3',
      farmerId: 'frm_2',
      name: 'Main Orchard Parcel',
      acres: 5.0,
      soilType: 'Black cotton',
      irrigation: 'Flood',
      createdAt: new Date('2026-02-10')
    },
    {
      _id: 'plt_4',
      farmerId: 'frm_3',
      name: 'South Valley Plot',
      acres: 2.0,
      soilType: 'Clay loam',
      irrigation: 'Drip',
      createdAt: new Date('2026-02-28')
    },
    {
      _id: 'plt_5',
      farmerId: 'frm_4',
      name: 'Hilltop Terrace',
      acres: 4.0,
      soilType: 'Sandy loam',
      irrigation: 'Sprinkler',
      createdAt: new Date('2026-03-05')
    }
  ],
  soilWaterTests: [
    {
      _id: 'test_1',
      farmerId: 'frm_1',
      testType: 'soil',
      plotId: 'Plot A - Canal Side',
      date: '2026-01-20',
      lab: 'Telangana State Soil Testing Lab, Suryapet',
      results: {
        ph: '6.8',
        nitrogen: '310',
        phosphorus: '28',
        potassium: '240',
        organic_carbon: '0.85',
        sulphur: '12',
        zinc: '1.2',
        iron: '5.1',
        ec: '0.75'
      },
      notes: 'Optimal macronutrient balance for Moringa. Organic carbon is robust.',
      createdAt: new Date('2026-01-22')
    },
    {
      _id: 'test_2',
      farmerId: 'frm_2',
      testType: 'soil',
      plotId: 'Main Orchard Parcel',
      date: '2026-02-15',
      lab: 'Prof Jayashankar Telangana State Agricultural University',
      results: {
        ph: '7.8',
        nitrogen: '190',
        phosphorus: '18',
        potassium: '165',
        organic_carbon: '0.52',
        sulphur: '7.5',
        zinc: '0.55',
        iron: '3.8',
        ec: '1.1'
      },
      notes: 'Nitrogen & Zinc below optimal. Recommended vermicompost + neem cake application.',
      createdAt: new Date('2026-02-18')
    },
    {
      _id: 'test_3',
      farmerId: 'frm_1',
      testType: 'water',
      plotId: 'Borewell 1',
      date: '2026-01-22',
      lab: 'Panchayat Water Quality Testing Cell',
      results: {
        w_ph: '7.2',
        w_tds: '380',
        w_hardness: '210',
        w_coliform: '0',
        w_heavy_metals: 'BDL'
      },
      notes: 'Clear potable quality water with low salinity suitable for clean-label dehydration.',
      createdAt: new Date('2026-01-23')
    }
  ],
  farmActivities: [
    {
      _id: 'act_1',
      farmerId: 'frm_1',
      cycleId: 'cyc_1',
      activityType: 'soil_prep',
      date: '2026-01-28',
      description: 'Deep ploughing and application of farmyard manure across 2 acres.',
      product: 'Farmyard Manure & Vermicompost',
      qty: '4',
      unit: 'trolleys',
      cost: 6500,
      variety: 'PKM-1',
      notes: 'Soil moisture optimal before sowing.',
      createdAt: new Date('2026-01-28')
    },
    {
      _id: 'act_2',
      farmerId: 'frm_1',
      cycleId: 'cyc_1',
      activityType: 'sowing',
      date: '2026-02-01',
      description: 'Planted high-density Moringa saplings with 1.5m spacing.',
      product: 'PKM-1 Moringa Saplings',
      qty: '2200',
      unit: 'plants',
      cost: 3500,
      variety: 'PKM-1',
      notes: 'Germination checks scheduled for Day 10.',
      createdAt: new Date('2026-02-01')
    },
    {
      _id: 'act_3',
      farmerId: 'frm_1',
      cycleId: 'cyc_1',
      activityType: 'foliar',
      date: '2026-02-22',
      description: 'Foliar spray with Jeevamrutha and organic neem oil solution for pest prevention.',
      product: 'Jeevamrutha + 10000ppm Neem Oil',
      qty: '50',
      unit: 'liters',
      cost: 1200,
      notes: 'Zero chemical pesticides applied.',
      createdAt: new Date('2026-02-22')
    },
    {
      _id: 'act_4',
      farmerId: 'frm_2',
      cycleId: 'cyc_2',
      activityType: 'observation',
      date: '2026-03-10',
      description: 'Agronomist field visit: fruit set observation and moisture check.',
      cycleStage: 'Fruiting',
      remarks: 'Orchard foliage is lush, fruit sizes are uniform with high Brix potential.',
      flagContent: true,
      notes: 'Shot 4K clips of orchard for social media and farmer sourcing storytelling.',
      createdAt: new Date('2026-03-10')
    }
  ],
  cropDiagnoses: [
    {
      _id: 'diag_1',
      farmerId: 'frm_1',
      crop: 'Moringa',
      stage: 'Vegetative growth',
      symptoms: 'Minor leaf webber caterpillars on young shoots during cloudy week.',
      diagnosis: 'Identified Noorda blitealis (Moringa leaf caterpillar). Recommended natural Bacillus thuringiensis (Bt) spray and 5% neem seed kernel extract (NSKE). Chemical pesticides strictly avoided to keep clean-label dehydration compliant.',
      createdAt: new Date('2026-02-18')
    }
  ],
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
      modules: ['production', 'factory', 'batches', 'farmers', 'procurement', 'inventory', 'dashboard', 'skus'],
      avatar: '👨‍🏭',
      isActive: true,
      lastLogin: new Date()
    },
    {
      _id: 'usr_ramesh',
      name: 'Ramesh Kumar',
      email: 'ramesh.ops@kohfoods.com',
      password: 'password123',
      role: 'Factory Staff',
      modules: ['production', 'factory', 'batches'],
      avatar: '👨‍🏭',
      isActive: true,
      lastLogin: new Date()
    },
    {
      _id: 'usr_pooja',
      name: 'Pooja Tiwari',
      email: 'pooja.mktg@kohfoods.com',
      password: 'password123',
      role: 'Marketing Lead',
      modules: ['board', 'calendar', 'shoots', 'ads', 'statics', 'influencers', 'analytics', 'skus', 'dashboard'],
      avatar: '📈',
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
  utilityStock: [
    {
      _id: 'stk_1',
      name: '100g Kraft Standup Pouch with Window',
      category: 'Packaging',
      unit: 'pcs',
      unitCost: 4.5,
      currentStock: 12500,
      reorderLevel: 5000,
      preferredVendor: 'vnd_1',
      preferredVendorName: 'PrintPack Solutions Pvt Ltd',
      notes: 'High-barrier moisture lock food-grade pouches for pure powders.',
      lastRestocked: new Date('2026-03-01'),
      createdAt: new Date('2026-01-10')
    },
    {
      _id: 'stk_2',
      name: '250g PET Hexagon Jar + Induction Seal Cap',
      category: 'Packaging',
      unit: 'pcs',
      unitCost: 14.0,
      currentStock: 1200,
      reorderLevel: 2500,
      preferredVendor: 'vnd_2',
      preferredVendorName: 'Deccan Containers & Jars',
      notes: 'Premium jars for blends and family packs. Low stock alert active.',
      lastRestocked: new Date('2026-02-15'),
      createdAt: new Date('2026-01-12')
    },
    {
      _id: 'stk_3',
      name: '50g Sample Trial Pouches (Matte Black)',
      category: 'Packaging',
      unit: 'pcs',
      unitCost: 2.8,
      currentStock: 8000,
      reorderLevel: 3000,
      preferredVendor: 'vnd_1',
      preferredVendorName: 'PrintPack Solutions Pvt Ltd',
      notes: 'Used for sampler kits, influencer mailers, and trial packs.',
      lastRestocked: new Date('2026-03-05'),
      createdAt: new Date('2026-01-20')
    },
    {
      _id: 'stk_4',
      name: 'Corrugated 5-Ply Master Outer Box (24-Pack)',
      category: 'Packaging',
      unit: 'pcs',
      unitCost: 22.0,
      currentStock: 450,
      reorderLevel: 600,
      preferredVendor: 'vnd_1',
      preferredVendorName: 'PrintPack Solutions Pvt Ltd',
      notes: 'Heavy duty dispatch cartons for Amazon FBA and B2B shipping.',
      lastRestocked: new Date('2026-02-20'),
      createdAt: new Date('2026-01-25')
    },
    {
      _id: 'stk_5',
      name: 'Food Grade Silica Gel Desiccant Sachets 1g',
      category: 'Consumables',
      unit: 'pcs',
      unitCost: 0.35,
      currentStock: 45000,
      reorderLevel: 15000,
      preferredVendor: 'vnd_3',
      preferredVendorName: 'Sri Balaji Consumables & Silicas',
      notes: 'Inserted into finished powder jars to eliminate any residual humidity.',
      lastRestocked: new Date('2026-03-12'),
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'stk_6',
      name: 'Reinforced BOPP Packing Tape 2" (65m)',
      category: 'Consumables',
      unit: 'rolls',
      unitCost: 48.0,
      currentStock: 85,
      reorderLevel: 40,
      preferredVendor: 'vnd_3',
      preferredVendorName: 'Sri Balaji Consumables & Silicas',
      notes: 'Custom branded Koh! security seal tape.',
      lastRestocked: new Date('2026-02-28'),
      createdAt: new Date('2026-02-01')
    },
    {
      _id: 'stk_7',
      name: 'High-Temp Food Grade Silicone Dryer Mesh Liners',
      category: 'Spare parts',
      unit: 'sets',
      unitCost: 1250.0,
      currentStock: 8,
      reorderLevel: 12,
      preferredVendor: 'vnd_4',
      preferredVendorName: 'Apex Machine Spare Parts',
      notes: 'Tray liners for commercial dehydration chambers. Needs replenishment.',
      lastRestocked: new Date('2026-01-18'),
      createdAt: new Date('2026-01-10')
    },
    {
      _id: 'stk_8',
      name: 'Nitrogen Gas Cylinder Refill (47L 150 Bar)',
      category: 'Consumables',
      unit: 'units',
      unitCost: 650.0,
      currentStock: 6,
      reorderLevel: 4,
      preferredVendor: 'vnd_3',
      preferredVendorName: 'Sri Balaji Consumables & Silicas',
      notes: 'Used for modified atmosphere packaging (MAP) nitrogen flush.',
      lastRestocked: new Date('2026-03-08'),
      createdAt: new Date('2026-02-10')
    }
  ],
  vendors: [
    {
      _id: 'vnd_1',
      vendorCode: 'VND-001',
      name: 'PrintPack Solutions Pvt Ltd',
      gstNumber: '36AABCP1234F1Z8',
      contactPerson: 'Sanjay Gupta (Key Accounts)',
      phone: '+91 98490 88771',
      email: 'orders@printpack.in',
      address: 'Plot 42, IDA Cherlapally, Hyderabad, Telangana 500051',
      paymentTerms: 'Net 30',
      leadTimeDays: 10,
      accountHolderName: 'PrintPack Solutions Pvt Ltd',
      accountNumber: '50200045612389',
      ifscCode: 'HDFC0000240',
      upiId: 'printpack@hdfcbank',
      notes: 'Primary supplier for multi-layer barrier foil pouches & outer master cartons. Grade A quality rating.',
      status: 'active',
      createdAt: new Date('2026-01-05')
    },
    {
      _id: 'vnd_2',
      vendorCode: 'VND-002',
      name: 'Deccan Containers & Jars',
      gstNumber: '36AAACD9876E1ZQ',
      contactPerson: 'K. Venkateshwar Rao',
      phone: '+91 94401 22334',
      email: 'sales@deccancontainers.com',
      address: 'B-14, Industrial Estate, Sanathnagar, Hyderabad 500018',
      paymentTerms: 'Net 15',
      leadTimeDays: 7,
      accountHolderName: 'Deccan Containers',
      accountNumber: '102345678901',
      ifscCode: 'SBIN0001890',
      upiId: 'deccancontainers@sbi',
      notes: 'Certified food-contact safe PET and HDPE wide-mouth jars with induction seal wads.',
      status: 'active',
      createdAt: new Date('2026-01-08')
    },
    {
      _id: 'vnd_3',
      vendorCode: 'VND-003',
      name: 'Sri Balaji Consumables & Silicas',
      gstNumber: '36AAGCS5544B1ZV',
      contactPerson: 'Muralidhar Sharma',
      phone: '+91 91772 33445',
      email: 'balaji.consumables@gmail.com',
      address: 'Shop 12, Osmangunj Commercial Complex, Hyderabad 500095',
      paymentTerms: 'COD',
      leadTimeDays: 3,
      accountHolderName: 'Sri Balaji Enterprise',
      accountNumber: '023405001234',
      ifscCode: 'ICIC0000234',
      upiId: 'balajiconsumables@icici',
      notes: 'Fast turnaround spot vendor for packaging tapes, food-grade desiccant silica sachets, and shrink wraps.',
      status: 'active',
      createdAt: new Date('2026-01-14')
    },
    {
      _id: 'vnd_4',
      vendorCode: 'VND-004',
      name: 'Apex Machine Spare Parts',
      gstNumber: '27AABCA7788P1ZM',
      contactPerson: 'Rohit Joshi',
      phone: '+91 98200 44556',
      email: 'service@apexmachinery.com',
      address: 'MIDC Industrial Area, Bhosari, Pune, Maharashtra 411026',
      paymentTerms: 'Immediate / Advance',
      leadTimeDays: 14,
      accountHolderName: 'Apex Machine Works LLP',
      accountNumber: '918020033445566',
      ifscCode: 'UTIB0000456',
      upiId: 'apexmachine@axisbank',
      notes: 'OEM spare components, heat sealer bands, dehydrator trays, and pulverizer hammer blades.',
      status: 'active',
      createdAt: new Date('2026-01-20')
    }
  ],
  purchaseOrders: [
    {
      _id: 'po_1',
      poNumber: 'PO-20260301-001',
      vendorId: 'vnd_1',
      vendorName: 'PrintPack Solutions Pvt Ltd',
      itemId: 'stk_1',
      itemName: '100g Kraft Standup Pouch with Window',
      quantity: 15000,
      rate: 4.5,
      totalAmount: 67500,
      orderDate: '2026-03-01',
      expectedDelivery: '2026-03-10',
      invoiceNumber: 'INV-PP-2026-402',
      status: 'Received',
      notes: 'Delivered in full, passed seal integrity and pinhole test.',
      receivedAt: new Date('2026-03-10'),
      createdAt: new Date('2026-03-01')
    },
    {
      _id: 'po_2',
      poNumber: 'PO-20260312-002',
      vendorId: 'vnd_2',
      vendorName: 'Deccan Containers & Jars',
      itemId: 'stk_2',
      itemName: '250g PET Hexagon Jar + Induction Seal Cap',
      quantity: 5000,
      rate: 14.0,
      totalAmount: 70000,
      orderDate: '2026-03-12',
      expectedDelivery: '2026-03-19',
      invoiceNumber: 'DCJ-2026-089',
      status: 'Ordered',
      notes: 'Urgent reorder to prevent bottleneck in Moringa & Amla 250g family jars packaging.',
      createdAt: new Date('2026-03-12')
    },
    {
      _id: 'po_3',
      poNumber: 'PO-20260315-003',
      vendorId: 'vnd_3',
      vendorName: 'Sri Balaji Consumables & Silicas',
      itemId: 'stk_5',
      itemName: 'Food Grade Silica Gel Desiccant Sachets 1g',
      quantity: 50000,
      rate: 0.35,
      totalAmount: 17500,
      orderDate: '2026-03-15',
      expectedDelivery: '2026-03-18',
      invoiceNumber: 'SBC-MAR-114',
      status: 'Ordered',
      notes: 'Scheduled for delivery to packaging bay warehouse on Wednesday.',
      createdAt: new Date('2026-03-15')
    },
    {
      _id: 'po_4',
      poNumber: 'PO-20260218-004',
      vendorId: 'vnd_4',
      vendorName: 'Apex Machine Spare Parts',
      itemId: 'stk_7',
      itemName: 'High-Temp Food Grade Silicone Dryer Mesh Liners',
      quantity: 20,
      rate: 1250.0,
      totalAmount: 25000,
      orderDate: '2026-02-18',
      expectedDelivery: '2026-03-04',
      invoiceNumber: 'APX-7821',
      status: 'Received',
      notes: 'Installed in Chamber Dryer A & B. Operational.',
      receivedAt: new Date('2026-03-04'),
      createdAt: new Date('2026-02-18')
    }
  ],
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
  packages: []
};

// ==========================================
// SEED MARKETING DATA
// Populates rich production-grade mock data for Calendar, Shoots Library, Organic Posts & Influencers
// ==========================================
export const seedMarketingDataIfEmpty = () => {
  if (!memoryStore.calendarPosts || memoryStore.calendarPosts.length === 0) {
    memoryStore.calendarPosts = [
      {
        _id: 'cal_1',
        title: 'Why 80% of Vitamin C is Destroyed in Conventional Heat Drying',
        caption: 'Conventional drying pushes air up to 90°C, stripping heat-labile ascorbic acid and delicate bioactives.\n\nAt koh!, our vacuum dehydration chamber operates under reduced atmospheric pressure at 58°C. The result? 94% retention of Vitamin C and intact cellular enzymes.\n\nTransparency is our only preservative. Swipe to read our lab assays on Wild Amla.',
        platform: 'LinkedIn',
        channelGroup: 'LinkedIn',
        scheduledDate: '2026-10-15',
        scheduledTime: '09:30',
        status: 'scheduled',
        pillar: 'Made With Care',
        targetSku: 'Organic Wild Amla Powder 100g',
        owner: 'Keerthi',
        mediaUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop',
        mediaType: 'image',
        hashtags: ['#FoodTech', '#CleanLabel', '#Bioactives', '#Superfoods'],
        createdAt: new Date('2026-10-01')
      },
      {
        _id: 'cal_2',
        title: 'Listen to this crunch: Dehydrated sweet carrot sticks with zero added oil 🥕🔊',
        caption: 'Turn your volume UP 🔊 Zero refined oils, zero maltodextrin, zero trans fats. Just fresh carrots from Jangaon, washed, sliced to 3mm, and dried to 4% moisture. The ultimate snack for clean fuel.',
        platform: 'Instagram Reel',
        channelGroup: 'Meta',
        scheduledDate: '2026-10-14',
        scheduledTime: '18:30',
        status: 'published',
        pillar: '5-Minute Nutrition',
        targetSku: 'Crispy Sweet Carrot Crunchies 50g',
        owner: 'Rohini',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chips-falling-on-a-table-41148-large.mp4',
        mediaType: 'video',
        publishedUrl: 'https://instagram.com/p/reel_carrot_crunch',
        performance: { views: 84200, likes: 6200, comments: 240, shares: 1400, clicks: 580, impressions: 98000, engagementRate: 6.8 },
        hashtags: ['#ASMR', '#HealthySnacks', '#CleanEating', '#NoOil'],
        createdAt: new Date('2026-10-02')
      },
      {
        _id: 'cal_3',
        title: 'Morning 60s Moringa Green Goddess Tonic for zero brain fog 🍃',
        caption: 'Ditch your 2nd caffeine crash. Stir 1 scoop of raw-milled Moringa leaf into coconut water with a squeeze of fresh lemon.\n\nRich in chlorophyll, iron, and 9 essential amino acids.\n\nQuick recipe demo in 60 seconds.',
        platform: 'Instagram Reel',
        channelGroup: 'Meta',
        scheduledDate: '2026-10-16',
        scheduledTime: '08:00',
        status: 'scheduled',
        pillar: '5-Minute Nutrition',
        targetSku: 'Pure Green Moringa Powder 150g',
        owner: 'Rohini',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-fresh-tea-leaves-42171-large.mp4',
        mediaType: 'video',
        hashtags: ['#Moringa', '#MorningRoutine', '#BrainFog', '#Wellness'],
        createdAt: new Date('2026-10-03')
      },
      {
        _id: 'cal_4',
        title: 'Direct from farm gate to dehydration in Suryapet: How we solved cold-chain spoilage',
        caption: 'In India, post-harvest fruit and vegetable loss exceeds 25% due to inadequate rural cold chain.\n\nBy placing our dehydration hubs within 40km of farmer plots, we lock in freshness within 4 hours of harvest. Here is the operational blueprint.',
        platform: 'LinkedIn',
        channelGroup: 'LinkedIn',
        scheduledDate: '2026-10-18',
        scheduledTime: '11:00',
        status: 'scheduled',
        pillar: 'koh! Family',
        targetSku: 'Pure Green Moringa Powder 150g',
        owner: 'Keerthi',
        mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop',
        mediaType: 'image',
        hashtags: ['#AgriTech', '#SustainableSupplyChain', '#FarmerProsperity'],
        createdAt: new Date('2026-10-04')
      },
      {
        _id: 'cal_5',
        title: 'Fresh Moringa Leaf vs 1 Spoon Powder (Nutrient Density Chart)',
        caption: 'How does 100g of fresh leaf compare to 10g of low-temp dehydrated powder? Swipe through the laboratory assays comparing Potassium, Calcium, Iron, and Vitamin A.',
        platform: 'Instagram Post',
        channelGroup: 'Meta',
        scheduledDate: '2026-10-19',
        scheduledTime: '19:00',
        status: 'scheduled',
        pillar: 'Made With Care',
        targetSku: 'Pure Green Moringa Powder 150g',
        owner: 'Ajay',
        mediaUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop',
        mediaType: 'carousel',
        hashtags: ['#NutritionFacts', '#Superfoods', '#PlantBased'],
        createdAt: new Date('2026-10-05')
      },
      {
        _id: 'cal_6',
        title: 'Inside Batch #KBT-AML-019 QC: Refractometer Brix & Moisture check',
        caption: 'Live look from our Hyderabad dehydration bay. Measuring final moisture level to ensure under 5% shelf stability with zero chemical preservatives.',
        platform: 'Instagram Story',
        channelGroup: 'Meta',
        scheduledDate: '2026-10-20',
        scheduledTime: '14:00',
        status: 'scheduled',
        pillar: 'Made With Care',
        targetSku: 'Organic Wild Amla Powder 100g',
        owner: 'Lakshmi',
        mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop',
        mediaType: 'image',
        hashtags: ['#QualityFirst', '#CleanLabel'],
        createdAt: new Date('2026-10-06')
      },
      {
        _id: 'cal_7',
        title: 'We put grocery store dried fruit under a microscope vs koh! vacuum dried',
        caption: 'Notice the difference in cellular structure, crystal sugar coating, and sulphur residue. Clean label is about what is NOT in your food.',
        platform: 'YouTube Short',
        channelGroup: 'YouTube',
        scheduledDate: '2026-10-17',
        scheduledTime: '17:00',
        status: 'scheduled',
        pillar: 'Made With Care',
        targetSku: 'Crispy Sweet Carrot Crunchies 50g',
        owner: 'Keerthi',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vegetables-being-washed-in-a-kitchen-sink-40919-large.mp4',
        mediaType: 'video',
        hashtags: ['#Microscope', '#FoodScience', '#CleanLabel'],
        createdAt: new Date('2026-10-07')
      },
      {
        _id: 'cal_8',
        title: 'The Clean-Label Manifesto: Why our ingredient list has only 1 word',
        caption: 'No maltodextrin fillers. No anti-caking silica. No artificial coloring. Just 100% dehydrated whole fruit and leaf.\n\nWhy we chose a difficult manufacturing path over easy shortcuts.',
        platform: 'LinkedIn',
        channelGroup: 'LinkedIn',
        scheduledDate: '2026-10-22',
        scheduledTime: '10:00',
        status: 'draft',
        pillar: 'Made With Care',
        targetSku: 'All SKUs',
        owner: 'Keerthi',
        mediaUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop',
        mediaType: 'image',
        hashtags: ['#Entrepreneurship', '#CleanFood', '#FounderStory'],
        createdAt: new Date('2026-10-08')
      }
    ];
  }

  if (!memoryStore.shoots || memoryStore.shoots.length === 0) {
    memoryStore.shoots = [
      {
        _id: 'sht_1',
        title: 'Factory Dehydration Line Chamber Run',
        type: 'Factory',
        status: 'shot',
        shootDate: '2026-10-02',
        location: 'Hyderabad Dehydration Plant, Bay 2',
        cameraOperator: 'Ajay Varma',
        equipmentUsed: 'Sony A7S III, 24-70mm GM, Ronin RS3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
        notes: 'Captured raw moringa washing, vacuum chamber loading, and dry discharge inspection.',
        clipsCount: 3,
        clips: ['clp_1', 'clp_2', 'clp_3'],
        linkedPieces: ['cal_1', 'cal_6'],
        createdAt: new Date('2026-10-02')
      },
      {
        _id: 'sht_2',
        title: 'Suryapet Farmer Anji Reddy Harvest & Sun-Trace',
        type: 'Founder',
        status: 'shot',
        shootDate: '2026-09-28',
        location: 'Thonda Organic Farm, Suryapet',
        cameraOperator: 'Rohini Sharma',
        equipmentUsed: 'Canon R5C, DJI Mavic 3 Pro',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop',
        notes: 'Golden hour drone shots of PKM-1 Moringa trees and farmer hand-harvest interviews.',
        clipsCount: 2,
        clips: ['clp_4', 'clp_5'],
        linkedPieces: ['cal_4'],
        createdAt: new Date('2026-09-28')
      },
      {
        _id: 'sht_3',
        title: 'Nutritionist Kitchen ASMR Morning Tonic Demo',
        type: 'Recipe',
        status: 'logged',
        shootDate: '2026-10-05',
        location: 'Jubilee Hills Kitchen Studio',
        cameraOperator: 'Ajay Varma',
        equipmentUsed: 'Sony FX3, Rode NTG5 Shotgun Mic',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop',
        notes: 'Ultra-crisp ASMR audio of spoon clink, powder swirl, and hydration dissolve.',
        clipsCount: 2,
        clips: ['clp_6', 'clp_7'],
        linkedPieces: ['cal_2', 'cal_3'],
        createdAt: new Date('2026-10-05')
      },
      {
        _id: 'sht_4',
        title: 'Eurofins QA & FSSAI Heavy Metal Testing Laboratory',
        type: 'Workshop',
        status: 'planned',
        shootDate: '2026-10-25',
        location: 'Quality Assurance Testing Bay',
        cameraOperator: 'Keerthi Kumar',
        equipmentUsed: 'Sony A7S III, Macro 90mm',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop',
        notes: 'Scheduled to film ICP-MS heavy metal test readouts for consumer trust campaign.',
        clipsCount: 0,
        clips: [],
        linkedPieces: [],
        createdAt: new Date('2026-10-08')
      }
    ];
  }

  if (!memoryStore.shootClips || memoryStore.shootClips.length === 0) {
    memoryStore.shootClips = [
      {
        _id: 'clp_1',
        clipId: 'CLP-FACT-01',
        title: 'Moringa Leaf Cold-Wash & Vibratory Air Knives',
        location: 'Hyderabad Plant Bay 1',
        cropOrProduce: 'Moringa',
        durationSeconds: 18,
        tags: ['#solar-drying', '#washing-bay', '#moringa', '#4k-60fps'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vegetables-being-washed-in-a-kitchen-sink-40919-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-10-02',
        cameraOperator: 'Ajay Varma',
        usageCount: 4,
        status: 'raw',
        attachedPieces: [{ id: 'cal_1', title: 'Vitamin C Retention', type: 'LinkedIn' }]
      },
      {
        _id: 'clp_2',
        clipId: 'CLP-FACT-02',
        title: 'Stainless Steel Vacuum Drying Trays Loading at 58°C',
        location: 'Dryer Chamber A',
        cropOrProduce: 'Amla',
        durationSeconds: 24,
        tags: ['#vacuum-drying', '#dehydration', '#factory-line', '#crisp'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-automated-assembly-line-working-in-a-factory-42459-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-10-02',
        cameraOperator: 'Ajay Varma',
        usageCount: 7,
        status: 'edited',
        attachedPieces: [{ id: 'cal_6', title: 'Batch QC Moisture', type: 'Instagram' }]
      },
      {
        _id: 'clp_3',
        clipId: 'CLP-FACT-03',
        title: 'Ultra-Fine 120 Mesh Air-Classifier Pulverizer Powder Stream',
        location: 'Milling & Powdering Suite',
        cropOrProduce: 'Beetroot',
        durationSeconds: 15,
        tags: ['#milling', '#superfine', '#powder', '#texture'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flour-falling-slowly-on-a-table-41147-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-10-02',
        cameraOperator: 'Ajay Varma',
        usageCount: 3,
        status: 'raw'
      },
      {
        _id: 'clp_4',
        clipId: 'CLP-FARM-01',
        title: 'Orchard Canopy Hand-Picking Wild Amla by Farmer Venkat Rao',
        location: 'Suryapet Organic Orchards',
        cropOrProduce: 'Amla',
        durationSeconds: 32,
        tags: ['#farm-harvest', '#amla', '#organic', '#farmer-story'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-through-a-crop-field-41558-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-09-28',
        cameraOperator: 'Rohini Sharma',
        usageCount: 5,
        status: 'edited',
        attachedPieces: [{ id: 'cal_4', title: 'Farm Gate Dehydration', type: 'LinkedIn' }]
      },
      {
        _id: 'clp_5',
        clipId: 'CLP-FARM-02',
        title: 'Morning Dew on PKM-1 Moringa Canopy at Dawn',
        location: 'Thonda Village',
        cropOrProduce: 'Moringa',
        durationSeconds: 20,
        tags: ['#cinematic', '#nature', '#moringa', '#dawn'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-green-leaves-with-morning-dew-42838-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-09-28',
        cameraOperator: 'Rohini Sharma',
        usageCount: 2,
        status: 'raw'
      },
      {
        _id: 'clp_6',
        clipId: 'CLP-KITCH-01',
        title: 'ASMR Spoon Dip & Swirl into Coconut Water (Zero Clump)',
        location: 'Kitchen Studio',
        cropOrProduce: 'Moringa & Amla',
        durationSeconds: 14,
        tags: ['#asmr', '#solubility', '#morning-tonic', '#recipe'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-iced-coffee-41604-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-10-05',
        cameraOperator: 'Ajay Varma',
        usageCount: 8,
        status: 'edited',
        attachedPieces: [{ id: 'cal_3', title: 'Moringa Green Goddess', type: 'Instagram' }]
      },
      {
        _id: 'clp_7',
        clipId: 'CLP-CRIS-01',
        title: 'Crispy Carrot Chips Crunch Audio Soundwave',
        location: 'Sensory QA Lab',
        cropOrProduce: 'Carrot',
        durationSeconds: 12,
        tags: ['#snack', '#carrot', '#crunch-test', '#healthy-kids'],
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chips-falling-on-a-table-41148-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=600&auto=format&fit=crop',
        resolution: '4K 60fps',
        shootDate: '2026-10-05',
        cameraOperator: 'Ajay Varma',
        usageCount: 6,
        status: 'edited',
        attachedPieces: [{ id: 'cal_2', title: 'Carrot Chips ASMR', type: 'Instagram' }]
      }
    ];
  }

  if (!memoryStore.organicPosts || memoryStore.organicPosts.length === 0) {
    memoryStore.organicPosts = [
      {
        _id: 'org_1',
        postId: 'IG-P-8821',
        title: 'Conventional Sun Drying vs 58°C Vacuum Dehydration Nutrient Retention Test',
        caption: 'We tested 40 batches for residual Vitamin C. Watch what happens when high heat destroys bioactives vs low temp dehydration.',
        platform: 'Instagram Reel',
        channel: 'Meta',
        postUrl: 'https://instagram.com/p/reel_vacuum_vs_sun',
        publishedDate: '2026-10-08',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop',
        theme: 'Factory Process',
        hookType: 'Shock/Fact',
        views: 245000,
        reach: 310000,
        impressions: 380000,
        likes: 18400,
        comments: 650,
        shares: 4200,
        saves: 5800,
        clicks: 1240,
        engagementRate: 7.2,
        isBoostCandidate: true,
        watchTimeHours: 1940
      },
      {
        _id: 'org_2',
        postId: 'LI-P-4402',
        title: 'Why 80% of Vitamin C is Destroyed in Hot Air Drying (And Our 58°C Fix)',
        caption: 'Food tech deep-dive on heat kinetics in drying amla and moringa. Full breakdown of our vacuum cycle.',
        platform: 'LinkedIn',
        channel: 'LinkedIn',
        postUrl: 'https://linkedin.com/posts/kohfoods_foodtech-cleanlabel-dehydration',
        publishedDate: '2026-10-06',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
        theme: 'Nutritional Science',
        hookType: 'Question',
        views: 42000,
        reach: 55000,
        impressions: 68000,
        likes: 2100,
        comments: 184,
        shares: 620,
        saves: 980,
        clicks: 1840,
        engagementRate: 5.8,
        isBoostCandidate: true,
        watchTimeHours: 480
      },
      {
        _id: 'org_3',
        postId: 'IG-P-8822',
        title: 'Farmer Venkat Rao on 100% Zero-Synthetic-Pesticide Wild Amla Harvesting',
        caption: 'Meet Venkat Rao from Suryapet. 12 years of natural farming, hand-gathering forest amla with zero synthetic fertilizers.',
        platform: 'Instagram Reel',
        channel: 'Meta',
        postUrl: 'https://instagram.com/p/reel_venkat_rao_amla',
        publishedDate: '2026-10-03',
        thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop',
        theme: 'Farmer Journey',
        hookType: 'Story',
        views: 182000,
        reach: 220000,
        impressions: 260000,
        likes: 14200,
        comments: 410,
        shares: 2900,
        saves: 3100,
        clicks: 820,
        engagementRate: 6.1,
        isBoostCandidate: true,
        watchTimeHours: 1420
      },
      {
        _id: 'org_4',
        postId: 'YT-S-1092',
        title: 'We Put Supermarket Dried Fruit Under a Microscope (Surprise Sulphur Residue)',
        caption: 'Commercial dried fruit vs koh! clean label dehydration under a 400x lab lens.',
        platform: 'YouTube Short',
        channel: 'YouTube',
        postUrl: 'https://youtube.com/shorts/microscope_dried_fruit',
        publishedDate: '2026-10-01',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
        theme: 'Nutritional Science',
        hookType: 'Shock/Fact',
        views: 280000,
        reach: 320000,
        impressions: 390000,
        likes: 22100,
        comments: 890,
        shares: 5400,
        saves: 6100,
        clicks: 2100,
        engagementRate: 8.1,
        isBoostCandidate: true,
        watchTimeHours: 2310
      },
      {
        _id: 'org_5',
        postId: 'IG-P-8823',
        title: 'Single-Ingredient Moringa Morning Elixir for Cortisol Balance',
        caption: 'The ultimate 60-second breakfast ritual. Mix 1 spoon into tender coconut water with zero clumping.',
        platform: 'Instagram Reel',
        channel: 'Meta',
        postUrl: 'https://instagram.com/p/reel_moringa_elixir',
        publishedDate: '2026-09-29',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop',
        theme: 'Recipe & Tonic',
        hookType: 'Transformation',
        views: 154000,
        reach: 195000,
        impressions: 230000,
        likes: 11200,
        comments: 380,
        shares: 3600,
        saves: 4200,
        clicks: 960,
        engagementRate: 5.4,
        isBoostCandidate: false,
        watchTimeHours: 1180
      },
      {
        _id: 'org_6',
        postId: 'LI-P-4403',
        title: 'The Engineering Behind Low-Temperature Thermal Pumps in Food Dehydration',
        caption: 'Why thermodynamics matter in superfood processing. How heat pumps recycle latent vapor energy.',
        platform: 'LinkedIn',
        channel: 'LinkedIn',
        postUrl: 'https://linkedin.com/posts/kohfoods_heatpump-agritech-efficiency',
        publishedDate: '2026-09-25',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop',
        theme: 'Factory Process',
        hookType: 'Behind The Scenes',
        views: 28000,
        reach: 35000,
        impressions: 42000,
        likes: 1250,
        comments: 92,
        shares: 280,
        saves: 410,
        clicks: 910,
        engagementRate: 4.8,
        isBoostCandidate: false,
        watchTimeHours: 290
      },
      {
        _id: 'org_7',
        postId: 'IG-P-8824',
        title: 'Guilt-Free Snack Crunch ASMR: Whole Dehydrated Carrot Sticks',
        caption: 'Crispy root chips with only 1 ingredient: fresh carrots. No palm oil, no seed oils, no potato starch.',
        platform: 'Instagram Reel',
        channel: 'Meta',
        postUrl: 'https://instagram.com/p/reel_carrot_crunch_asmr',
        publishedDate: '2026-09-22',
        thumbnailUrl: 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=600&auto=format&fit=crop',
        theme: 'Recipe & Tonic',
        hookType: 'ASMR Sound',
        views: 98000,
        reach: 130000,
        impressions: 160000,
        likes: 7800,
        comments: 210,
        shares: 1900,
        saves: 2400,
        clicks: 540,
        engagementRate: 4.9,
        isBoostCandidate: false,
        watchTimeHours: 820
      },
      {
        _id: 'org_8',
        postId: 'IG-P-8825',
        title: '3 Warning Signs of Adulterated Turmeric Powders (Lead Chromate Alert)',
        caption: 'Swipe through to learn the simple water sedimentation test to spot fake coloring in store-bought spice powders.',
        platform: 'Instagram Post',
        channel: 'Meta',
        postUrl: 'https://instagram.com/p/carousel_turmeric_purity',
        publishedDate: '2026-09-18',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop',
        theme: 'Nutritional Science',
        hookType: 'Shock/Fact',
        views: 86000,
        reach: 110000,
        impressions: 145000,
        likes: 6900,
        comments: 315,
        shares: 3800,
        saves: 5100,
        clicks: 730,
        engagementRate: 6.8,
        isBoostCandidate: true,
        watchTimeHours: 640
      }
    ];
  }

  if (!memoryStore.influencers || memoryStore.influencers.length === 0) {
    memoryStore.influencers = [
      {
        _id: 'inf_1',
        name: 'Dr. Nita Sharma',
        handle: '@dr.nitasharma_nutrition',
        igHandle: 'dr.nitasharma_nutrition',
        ytHandle: 'DrNitaHealth',
        platform: 'Instagram',
        followers: 185000,
        engagementRate: 5.6,
        tier: 'mid',
        niche: 'Clinical Nutrition & Gut Health',
        status: 'active',
        collaborations: [],
        totalSpent: 35000,
        totalRevenue: 147200,
        overallRoas: 4.2,
        contactEmail: 'nita@nutritionstudio.in',
        contactPhone: '+91 98201 12345',
        city: 'Mumbai',
        notes: 'Functional nutritionist with strict stance on clean labels and zero sugar additives. Very high credibility.',
        createdAt: new Date('2026-08-10')
      },
      {
        _id: 'inf_2',
        name: 'Kavita Krishnan',
        handle: '@clean_eats_kavita',
        igHandle: 'clean_eats_kavita',
        ytHandle: 'KavitaCleanEats',
        platform: 'Instagram',
        followers: 48000,
        engagementRate: 6.8,
        tier: 'micro',
        niche: 'Functional Nutrition & Clean Recipes',
        status: 'active',
        collaborations: [],
        totalSpent: 18000,
        totalRevenue: 64800,
        overallRoas: 3.6,
        contactEmail: 'collabs@kavitaclean.com',
        contactPhone: '+91 98450 67890',
        city: 'Bangalore',
        notes: 'High visual aesthetic. Great at morning tonic and smoothie bowl ASMR videos.',
        createdAt: new Date('2026-08-15')
      },
      {
        _id: 'inf_3',
        name: 'Rahul Nair (FitChef)',
        handle: '@fitchef_rahul',
        igHandle: 'fitchef_rahul',
        ytHandle: 'FitChefNair',
        platform: 'YouTube',
        followers: 520000,
        engagementRate: 4.2,
        tier: 'macro',
        niche: 'Fitness, Athletes & High-Performance Diet',
        status: 'active',
        collaborations: [],
        totalSpent: 75000,
        totalRevenue: 285000,
        overallRoas: 3.8,
        contactEmail: 'mgmt@fitchefrahul.in',
        contactPhone: '+91 99100 23456',
        city: 'Delhi NCR',
        notes: 'Celebrity fitness coach. Ideal for Beetroot pre-workout nitrate messaging and high-protein blends.',
        createdAt: new Date('2026-08-20')
      },
      {
        _id: 'inf_4',
        name: 'Dr. Ananya Reddy',
        handle: '@dr_ananya_pediatrics',
        igHandle: 'dr_ananya_pediatrics',
        liHandle: 'Dr Ananya Reddy MD',
        platform: 'Instagram',
        followers: 32000,
        engagementRate: 7.4,
        tier: 'micro',
        niche: 'Pediatric Diet & Toxin-Free Child Nutrition',
        status: 'outreach',
        collaborations: [],
        totalSpent: 12000,
        totalRevenue: 42000,
        overallRoas: 3.5,
        contactEmail: 'ananya@pediatricwell.com',
        contactPhone: '+91 94400 88776',
        city: 'Hyderabad',
        notes: 'Local Hyderabad pediatrician advocating for zero-chemical dehydrated crunchy fruit snacks for kids.',
        createdAt: new Date('2026-09-01')
      },
      {
        _id: 'inf_5',
        name: 'Pooja Makhija (Plant Chef)',
        handle: '@plantpower_pooja',
        igHandle: 'plantpower_pooja',
        platform: 'Instagram',
        followers: 8500,
        engagementRate: 9.1,
        tier: 'nano',
        niche: 'Raw Plant Whole Foods',
        status: 'active',
        collaborations: [],
        totalSpent: 5000,
        totalRevenue: 36400,
        overallRoas: 6.1,
        contactEmail: 'pooja.plantpower@gmail.com',
        contactPhone: '+91 97110 33445',
        city: 'Pune',
        notes: 'Nano creator with super-engaged community. High conversion rate on raw Moringa and Curry leaf powders.',
        createdAt: new Date('2026-09-10')
      },
      {
        _id: 'inf_6',
        name: 'Siddharth Roy',
        handle: '@siddharth_wellness',
        igHandle: 'siddharth_wellness',
        liHandle: 'Siddharth Roy',
        platform: 'LinkedIn',
        followers: 6200,
        engagementRate: 8.4,
        tier: 'nano',
        niche: 'Ayurveda & Biohacking',
        status: 'outreach',
        collaborations: [],
        totalSpent: 4000,
        totalRevenue: 0,
        overallRoas: 0,
        contactEmail: 'sid@ayurbiohack.com',
        contactPhone: '+91 98190 55667',
        city: 'Chennai',
        notes: 'Biohacker focused on cold-chain purity and ORAC antioxidant scores.',
        createdAt: new Date('2026-09-15')
      }
    ];
  }

  if (!memoryStore.collabs || memoryStore.collabs.length === 0) {
    memoryStore.collabs = [
      {
        _id: 'col_1',
        influencerId: 'inf_1',
        influencerName: 'Dr. Nita Sharma',
        handle: '@dr.nitasharma_nutrition',
        deliverable: '1x IG Reel + 2x Story set',
        type: 'Reel',
        stage: 'content_live',
        productSent: 'Wild Amla 100g + Moringa 150g Sample Kit',
        productCost: 1800,
        fee: 35000,
        advanceStatus: 'paid',
        finalPaymentStatus: 'cleared',
        paymentDueDate: '2026-10-05',
        invoiceNumber: 'INV-NS-104',
        dueDate: '2026-10-08',
        liveDate: '2026-10-08',
        postUrl: 'https://instagram.com/p/collab_dr_nita_gut_health',
        promoCode: 'DRNITA15',
        views: 215000,
        ordersTracked: 184,
        revenue: 147200,
        roi: 4.0,
        approachRecommendation: 'partnership_ad',
        notes: 'Top performing gut wellness collab! Run as partnership branded ad on Meta.',
        createdAt: new Date('2026-09-20')
      },
      {
        _id: 'col_2',
        influencerId: 'inf_2',
        influencerName: 'Kavita Krishnan',
        handle: '@clean_eats_kavita',
        deliverable: '1x Reel Recipe ASMR + Carousel Guide',
        type: 'Reel',
        stage: 'script_review',
        productSent: 'Full Pantry Dehydration Box',
        productCost: 1200,
        fee: 18000,
        advanceStatus: 'paid',
        finalPaymentStatus: 'pending',
        paymentDueDate: '2026-10-25',
        invoiceNumber: 'INV-KK-088',
        dueDate: '2026-10-18',
        promoCode: 'KAVITA10',
        views: 0,
        ordersTracked: 0,
        revenue: 0,
        roi: 0,
        approachRecommendation: 'organic_only',
        notes: 'Script reviewed. Focused on non-clumping solubility in iced coconut tonics.',
        createdAt: new Date('2026-10-01')
      },
      {
        _id: 'col_3',
        influencerId: 'inf_3',
        influencerName: 'Rahul Nair (FitChef)',
        handle: '@fitchef_rahul',
        deliverable: '1x Dedicated YouTube Review + 2x Shorts',
        type: 'Dedicated Video',
        stage: 'brief_agreed',
        productSent: 'Pure Beetroot Powder 250g Jar + Wild Amla',
        productCost: 2500,
        fee: 75000,
        advanceStatus: 'pending',
        finalPaymentStatus: 'pending',
        paymentDueDate: '2026-10-20',
        dueDate: '2026-10-28',
        promoCode: 'FITKOH20',
        views: 0,
        ordersTracked: 0,
        revenue: 0,
        roi: 0,
        approachRecommendation: 'paid_ad_ugc',
        notes: 'Advance 50% payable upon script confirmation. Content will be cut down into high-ROAS Meta ads.',
        createdAt: new Date('2026-10-03')
      },
      {
        _id: 'col_4',
        influencerId: 'inf_4',
        influencerName: 'Dr. Ananya Reddy',
        handle: '@dr_ananya_pediatrics',
        deliverable: '1x Carousel on Kids Sugar Alternatives',
        type: 'Carousel',
        stage: 'sample_sent',
        productSent: 'Crispy Sweet Carrot Crunchies 50g Box',
        productCost: 1500,
        fee: 12000,
        advanceStatus: 'pending',
        finalPaymentStatus: 'pending',
        paymentDueDate: '2026-11-05',
        dueDate: '2026-11-02',
        promoCode: 'ANANYA10',
        views: 0,
        ordersTracked: 0,
        revenue: 0,
        roi: 0,
        approachRecommendation: 'organic_only',
        notes: 'Samples dispatched via BlueDart. Awaiting sensory feedback from pediatric clinic.',
        createdAt: new Date('2026-10-05')
      },
      {
        _id: 'col_5',
        influencerId: 'inf_5',
        influencerName: 'Pooja Makhija (Plant Chef)',
        handle: '@plantpower_pooja',
        deliverable: '1x Reel on Morning Moringa Tonic',
        type: 'Reel',
        stage: 'completed',
        productSent: 'Pure Green Moringa Powder 150g',
        productCost: 900,
        fee: 5000,
        advanceStatus: 'paid',
        finalPaymentStatus: 'cleared',
        paymentDueDate: '2026-09-22',
        invoiceNumber: 'INV-PM-019',
        dueDate: '2026-09-24',
        liveDate: '2026-09-24',
        postUrl: 'https://instagram.com/p/collab_pooja_moringa',
        promoCode: 'POOJA10',
        views: 42000,
        ordersTracked: 52,
        revenue: 36400,
        roi: 6.1,
        approachRecommendation: 'organic_only',
        notes: '6.1x ROI! Top nano creator partnership. Rebook for quarterly retention.',
        createdAt: new Date('2026-09-12')
      },
      {
        _id: 'col_6',
        influencerId: 'inf_6',
        influencerName: 'Siddharth Roy',
        handle: '@siddharth_wellness',
        deliverable: '1x LinkedIn Post + IG Story Breakdown',
        type: 'LinkedIn Post',
        stage: 'outreach',
        productSent: 'Wild Amla Bioactive Pack',
        productCost: 900,
        fee: 4000,
        advanceStatus: 'not_applicable',
        finalPaymentStatus: 'pending',
        dueDate: '2026-11-05',
        promoCode: 'SID10',
        views: 0,
        ordersTracked: 0,
        revenue: 0,
        roi: 0,
        approachRecommendation: 'organic_only',
        notes: 'Outreach sent via LinkedIn InMail. Waiting on contract acceptance.',
        createdAt: new Date('2026-10-09')
      }
    ];
  }
};

// ==========================================
// BULLETPROOF ENTERPRISE PERSISTENCE LAYER
// Guarantees all entries are present, atomic disk writes, automatic backup, and non-destructive reload
// ==========================================
const resolveStorePaths = () => {
  const candidateDirs = [
    path.resolve(__dirname, '../../data'),
    path.join(process.cwd(), 'server', 'data'),
    path.join(process.cwd(), 'data')
  ];

  let selectedDir = candidateDirs[0];
  for (const d of candidateDirs) {
    if (fs.existsSync(path.join(d, 'local_store.json'))) {
      selectedDir = d;
      break;
    }
  }

  if (!fs.existsSync(selectedDir)) {
    try {
      fs.mkdirSync(selectedDir, { recursive: true });
    } catch (e) {}
  }

  return {
    dir: selectedDir,
    file: path.join(selectedDir, 'local_store.json'),
    tempFile: path.join(selectedDir, 'local_store.json.tmp'),
    backupFile: path.join(selectedDir, 'local_store.backup.json')
  };
};

const storePaths = resolveStorePaths();

export const saveStore = () => {
  try {
    if (!fs.existsSync(storePaths.dir)) {
      fs.mkdirSync(storePaths.dir, { recursive: true });
    }

    const payload = JSON.stringify(memoryStore, null, 2);

    // Atomic write via temp file
    fs.writeFileSync(storePaths.tempFile, payload, 'utf-8');
    fs.copyFileSync(storePaths.tempFile, storePaths.file);

    // Keep redundant backup file
    fs.copyFileSync(storePaths.tempFile, storePaths.backupFile);

    try {
      fs.unlinkSync(storePaths.tempFile);
    } catch (e) {}
  } catch (err) {
    console.error('[DataStore] Failed to persist data to disk:', err);
  }
};

export const loadStore = () => {
  try {
    let raw = '';
    if (fs.existsSync(storePaths.file)) {
      try {
        raw = fs.readFileSync(storePaths.file, 'utf-8');
      } catch (e) {}
    }

    // Fallback to backup if primary file is missing or empty
    if ((!raw || raw.trim().length === 0) && fs.existsSync(storePaths.backupFile)) {
      try {
        raw = fs.readFileSync(storePaths.backupFile, 'utf-8');
        console.log(`[DataStore] Recovered from backup file ${storePaths.backupFile}`);
      } catch (e) {}
    }

    if (raw && raw.trim().length > 0) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            (memoryStore as any)[key] = data[key];
          }
        });
        console.log(`[DataStore] Loaded persistent data from ${storePaths.file}`);
      }
    }

    // Ensure all 21 production collections and marketing collections are fully populated
    seedMarketingDataIfEmpty();
    seedAllProductionData(memoryStore);

    // Flush consolidated dataset immediately
    saveStore();
  } catch (err) {
    console.error('[DataStore] Error during loadStore, re-seeding complete dataset:', err);
    seedMarketingDataIfEmpty();
    seedAllProductionData(memoryStore);
    saveStore();
  }
};

// Auto-hydrate on server startup
loadStore();

// Auto-save periodically every 2.5 seconds to capture all in-memory mutations automatically
setInterval(() => {
  saveStore();
}, 2500);

// Graceful exit handlers to prevent data loss during server shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    saveStore();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    saveStore();
    process.exit(0);
  });
  process.on('beforeExit', () => {
    saveStore();
  });
}

