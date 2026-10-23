import { Router } from 'express';
import { login, getMe, getAllUsers, createUser, updateUser, deleteUser } from '../controllers/authController';
import {
  getProductionStats,
  getReceipts,
  createReceipt,
  updateReceipt,
  getBatches,
  createBatch,
  updateBatchStage,
  getInventory,
  getEquipment,
  createEquipment,
  updateEquipment,
  getCropProcessing,
  createCropProcessing,
  updateCropProcessing,
  getShiftSchedules,
  createShiftSchedule,
  updateShiftSchedule,
  getShiftSetups,
  createShiftSetup,
  updateShiftSetup,
  getFactoryAnalysis,
  claimPowderingBatches,
  updatePowderingBatch,
  finalizePowderingBatches,
  getPackages,
  createPackage,
  getProductTrace
} from '../controllers/productionController';
import {
  getFarmers,
  createFarmer,
  updateFarmer,
  deleteFarmer,
  getCropMasters,
  createCropMaster,
  updateCropMaster,
  getCropCycles,
  createCropCycle,
  updateCropCycle,
  addCyclePurchase,
  getFarmPartners,
  createFarmPartner,
  updateFarmPartner,
  deleteFarmPartner,
  getFarmerPlots,
  createFarmerPlot,
  deleteFarmerPlot,
  getSoilWaterTests,
  createSoilWaterTest,
  deleteSoilWaterTest,
  getFarmActivities,
  createFarmActivity,
  deleteFarmActivity,
  getCropDiagnoses,
  createCropDiagnosis
} from '../controllers/procurementController';
import {
  getUtilityStock,
  createUtilityStock,
  updateUtilityStock,
  adjustStock,
  deleteUtilityStock,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} from '../controllers/utilityController';
import {
  getSkus,
  createSku,
  updateSku,
  getComplianceTests,
  createComplianceTest
} from '../controllers/catalogController';
import {
  getContentItems,
  createContentItem,
  updateContentItem,
  getCalendarPosts,
  scheduleCalendarPost,
  updateCalendarPost,
  deleteCalendarPost,
  publishCalendarPost,
  getShoots,
  createShoot,
  updateShoot,
  deleteShoot,
  getShootClips,
  createShootClip,
  updateShootClip,
  deleteShootClip,
  linkClipToContent,
  getInfluencers,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  getCollabPipeline,
  createCollab,
  updateCollab,
  deleteCollab,
  getInfluencerPayments,
  generateInfluencerScripts,
  generateAiCalendar,
  getStatics,
  createStatic,
  updateStatic,
  getAdCreatives,
  createAdCreative,
  updateAdCreative,
  getPaidAds,
  createPaidAd,
  updatePaidAd,
  getOrganicAnalytics,
  getOrganicPosts,
  syncOrganicAnalytics,
  getOrganicLeaderboards,
  getOrganicBestTimes,
  getAdAnalyticsSummary
} from '../controllers/marketingController';
import {
  getPayments,
  createPayment,
  payPayment
} from '../controllers/paymentController';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController';
import {
  getPackaging,
  createPackaging,
  updatePackaging,
  deletePackaging
} from '../controllers/packagingController';
import {
  getB2BLeads,
  createB2BLead,
  updateB2BLead,
  getB2BOrders,
  createB2BOrder,
  updateB2BOrder
} from '../controllers/b2bController';
import {
  getNpdProducts,
  createNpdProduct,
  updateNpdStage,
  promoteNpdToSku
} from '../controllers/npdController';
import { getPlanningScenarios } from '../controllers/planningController';
import {
  getPnlEntries,
  getPnlByMonth,
  updatePnlEntry
} from '../controllers/financeController';
import {
  getActivityLogs,
  getFounderDashboardStats
} from '../controllers/userController';
import {
  getWorkers,
  createWorker,
  deleteWorker,
  getTodayAttendance,
  checkInWorker,
  checkOutWorker,
  bulkCheckInWorkers,
  bulkCheckOutWorkers,
  getAllAttendanceLogs,
  getMonthlyWages,
  getWorkerAttendanceLogs
} from '../controllers/attendanceController';

const router = Router();

// Authentication & RBAC User Management
router.post('/auth/login', login);
router.get('/auth/me', getMe);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Attendance Module (Factory Floor & Admin Management)
router.get('/attendance/workers', getWorkers);
router.post('/attendance/workers', createWorker);
router.delete('/attendance/workers/:id', deleteWorker);
router.get('/attendance/workers/:id/logs', getWorkerAttendanceLogs);
router.get('/attendance/today', getTodayAttendance);
router.post('/attendance/checkin', checkInWorker);
router.post('/attendance/checkout', checkOutWorker);
router.post('/attendance/bulk-checkin', bulkCheckInWorkers);
router.post('/attendance/bulk-checkout', bulkCheckOutWorkers);
router.get('/attendance/logs', getAllAttendanceLogs);
router.get('/attendance/monthly', getMonthlyWages);


// Dashboard Summary & Audit Trail
router.get('/dashboard/stats', getFounderDashboardStats);
router.get('/activity-logs', getActivityLogs);


// Production Module (6-Stage Factory)
router.get('/production/stats', getProductionStats);
router.get('/production/receipts', getReceipts);
router.post('/production/receipts', createReceipt);
router.patch('/production/receipts/:id', updateReceipt);
router.get('/production/batches', getBatches);
router.post('/production/batches', createBatch);
router.patch('/production/batches/:id/stage', updateBatchStage);
router.get('/production/inventory', getInventory);
router.get('/production/factory-analysis', getFactoryAnalysis);

// Powdering Stage Multi-Batch Operations
router.post('/production/powdering/claim', claimPowderingBatches);
router.patch('/production/powdering/:id', updatePowderingBatch);
router.post('/production/powdering/finalize', finalizePowderingBatches);

// Packing Stage Multi-Batch Mixing & Output Management
router.get('/production/packages', getPackages);
router.post('/production/packages', createPackage);

// Product History & Complete Lineage Traceability
router.get('/production/trace/:id', getProductTrace);

// Equipment Sub-Module
router.get('/production/equipment', getEquipment);
router.post('/production/equipment', createEquipment);
router.patch('/production/equipment/:id', updateEquipment);

// Crop Processing Sub-Module
router.get('/production/crop-processing', getCropProcessing);
router.post('/production/crop-processing', createCropProcessing);
router.patch('/production/crop-processing/:id', updateCropProcessing);

// Shift Schedule Sub-Module
router.get('/production/shift-schedules', getShiftSchedules);
router.post('/production/shift-schedules', createShiftSchedule);
router.patch('/production/shift-schedules/:id', updateShiftSchedule);

// Shift Setup Sub-Module
router.get('/production/shift-setups', getShiftSetups);
router.post('/production/shift-setups', createShiftSetup);
router.patch('/production/shift-setups/:id', updateShiftSetup);

// Procurement Module (Farmers, Crops & Cycles)
router.get('/procurement/farmers', getFarmers);
router.post('/procurement/farmers', createFarmer);
router.patch('/procurement/farmers/:id', updateFarmer);
router.delete('/procurement/farmers/:id', deleteFarmer);

router.get('/procurement/crop-masters', getCropMasters);
router.post('/procurement/crop-masters', createCropMaster);
router.patch('/procurement/crop-masters/:id', updateCropMaster);

router.get('/procurement/crop-cycles', getCropCycles);
router.post('/procurement/crop-cycles', createCropCycle);
router.patch('/procurement/crop-cycles/:id', updateCropCycle);
router.post('/procurement/crop-cycles/:id/purchase', addCyclePurchase);

router.get('/procurement/partners', getFarmPartners);
router.post('/procurement/partners', createFarmPartner);
router.patch('/procurement/partners/:id', updateFarmPartner);
router.delete('/procurement/partners/:id', deleteFarmPartner);

router.get('/procurement/plots', getFarmerPlots);
router.post('/procurement/plots', createFarmerPlot);
router.delete('/procurement/plots/:id', deleteFarmerPlot);

router.get('/procurement/soil-water-tests', getSoilWaterTests);
router.post('/procurement/soil-water-tests', createSoilWaterTest);
router.delete('/procurement/soil-water-tests/:id', deleteSoilWaterTest);

router.get('/procurement/activities', getFarmActivities);
router.post('/procurement/activities', createFarmActivity);
router.delete('/procurement/activities/:id', deleteFarmActivity);

router.get('/procurement/diagnoses', getCropDiagnoses);
router.post('/procurement/diagnoses', createCropDiagnosis);

// Inventory & Utility Module (Stock, Vendors & Purchase Orders)
router.get('/inventory/stock', getUtilityStock);
router.post('/inventory/stock', createUtilityStock);
router.patch('/inventory/stock/:id', updateUtilityStock);
router.post('/inventory/stock/:id/adjust', adjustStock);
router.delete('/inventory/stock/:id', deleteUtilityStock);

router.get('/inventory/vendors', getVendors);
router.post('/inventory/vendors', createVendor);
router.patch('/inventory/vendors/:id', updateVendor);
router.delete('/inventory/vendors/:id', deleteVendor);

router.get('/inventory/purchase-orders', getPurchaseOrders);
router.post('/inventory/purchase-orders', createPurchaseOrder);
router.patch('/inventory/purchase-orders/:id', updatePurchaseOrder);
router.delete('/inventory/purchase-orders/:id', deletePurchaseOrder);

// Catalog Module
router.get('/catalog/skus', getSkus);
router.post('/catalog/skus', createSku);
router.patch('/catalog/skus/:id', updateSku);
router.get('/catalog/compliance', getComplianceTests);
router.post('/catalog/compliance', createComplianceTest);

// Marketing Module - Content & Calendar Scheduling (LinkedIn & Meta)
router.get('/marketing/calendar', getCalendarPosts);
router.post('/marketing/calendar/schedule', scheduleCalendarPost);
router.patch('/marketing/calendar/:id', updateCalendarPost);
router.delete('/marketing/calendar/:id', deleteCalendarPost);
router.post('/marketing/calendar/:id/publish', publishCalendarPost);

router.get('/marketing/content', getContentItems);
router.post('/marketing/content', createContentItem);
router.patch('/marketing/content/:id', updateContentItem);

// Shoots & Library
router.get('/marketing/shoots/sessions', getShoots);
router.post('/marketing/shoots/sessions', createShoot);
router.patch('/marketing/shoots/sessions/:id', updateShoot);
router.delete('/marketing/shoots/sessions/:id', deleteShoot);

router.get('/marketing/shoots', getShootClips); // Footage library
router.post('/marketing/shoots', createShootClip);
router.get('/marketing/shoots/library', getShootClips);
router.post('/marketing/shoots/library', createShootClip);
router.patch('/marketing/shoots/library/:id', updateShootClip);
router.delete('/marketing/shoots/library/:id', deleteShootClip);
router.post('/marketing/shoots/link-content', linkClipToContent);

// Organic Channel & Granular Post Analytics
router.get('/marketing/organic-analytics', getOrganicAnalytics);
router.get('/marketing/organic-analytics/posts', getOrganicPosts);
router.post('/marketing/organic-analytics/sync', syncOrganicAnalytics);
router.get('/marketing/organic-analytics/leaderboards', getOrganicLeaderboards);
router.get('/marketing/organic-analytics/best-times', getOrganicBestTimes);

// Influencers & Collab Pipeline
router.get('/marketing/influencers', getInfluencers);
router.post('/marketing/influencers', createInfluencer);
router.patch('/marketing/influencers/:id', updateInfluencer);
router.delete('/marketing/influencers/:id', deleteInfluencer);

router.get('/marketing/influencers/collabs', getCollabPipeline);
router.post('/marketing/influencers/collabs', createCollab);
router.patch('/marketing/influencers/collabs/:id', updateCollab);
router.delete('/marketing/influencers/collabs/:id', deleteCollab);
router.get('/marketing/influencers/payments', getInfluencerPayments);
router.post('/marketing/influencers/generate-scripts', generateInfluencerScripts);

router.post('/marketing/ai-calendar', generateAiCalendar);

// Statics, Ad Creatives, Paid Ads & Analytics
router.get('/marketing/statics', getStatics);
router.post('/marketing/statics', createStatic);
router.patch('/marketing/statics/:id', updateStatic);
router.get('/marketing/ad-creatives', getAdCreatives);
router.post('/marketing/ad-creatives', createAdCreative);
router.patch('/marketing/ad-creatives/:id', updateAdCreative);
router.get('/marketing/paid-ads', getPaidAds);
router.post('/marketing/paid-ads', createPaidAd);
router.patch('/marketing/paid-ads/:id', updatePaidAd);
router.get('/marketing/ad-analytics', getAdAnalyticsSummary);

// Packaging Module
router.get('/packaging', getPackaging);
router.post('/packaging', createPackaging);
router.patch('/packaging/:id', updatePackaging);
router.delete('/packaging/:id', deletePackaging);

// B2B Sales & Orders Module
router.get('/b2b/leads', getB2BLeads);
router.post('/b2b/leads', createB2BLead);
router.patch('/b2b/leads/:id', updateB2BLead);
router.get('/b2b/orders', getB2BOrders);
router.post('/b2b/orders', createB2BOrder);
router.patch('/b2b/orders/:id', updateB2BOrder);

// Payments Command Center
router.get('/payments', getPayments);
router.post('/payments', createPayment);
router.patch('/payments/:id/pay', payPayment);

// Expense Claims Module
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.patch('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// NPD Module
router.get('/npd/products', getNpdProducts);
router.post('/npd/products', createNpdProduct);
router.patch('/npd/products/:id/stage', updateNpdStage);
router.post('/npd/products/:id/promote-sku', promoteNpdToSku);

// Planning Module
router.get('/planning/scenario', getPlanningScenarios);

// Finance / P&L Module
router.get('/finance/pnl', getPnlEntries);
router.get('/finance/pnl/:month', getPnlByMonth);
router.post('/finance/pnl/:month', updatePnlEntry);

export default router;
