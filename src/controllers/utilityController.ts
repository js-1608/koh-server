import { Request, Response } from 'express';
import {
  memoryStore,
  IStoreUtilityStock,
  IStoreVendor,
  IStorePurchaseOrder
} from '../services/storeService';

// ==========================================
// 1. INVENTORY STOCK MANAGEMENT
// ==========================================

export const getUtilityStock = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.utilityStock || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createUtilityStock = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      unit,
      unitCost,
      currentStock,
      reorderLevel,
      preferredVendor,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const vendor = (memoryStore.vendors || []).find(v => v._id === preferredVendor || v.name === preferredVendor);

    const newItem: IStoreUtilityStock = {
      _id: `stk_${Date.now()}`,
      name: name.trim(),
      category: category || 'Packaging',
      unit: unit || 'pcs',
      unitCost: Number(unitCost) || 0,
      currentStock: Number(currentStock) || 0,
      reorderLevel: Number(reorderLevel) || 50,
      preferredVendor: vendor?._id || preferredVendor || '',
      preferredVendorName: vendor?.name || (preferredVendor && preferredVendor !== '—' ? preferredVendor : ''),
      notes: notes || '',
      lastRestocked: Number(currentStock) > 0 ? new Date() : undefined,
      createdAt: new Date()
    };

    if (!memoryStore.utilityStock) memoryStore.utilityStock = [];
    memoryStore.utilityStock.push(newItem);

    return res.status(201).json(newItem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUtilityStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      unit,
      unitCost,
      currentStock,
      reorderLevel,
      preferredVendor,
      notes
    } = req.body;

    const item = (memoryStore.utilityStock || []).find(s => s._id === id);
    if (!item) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    if (name !== undefined) item.name = name.trim();
    if (category !== undefined) item.category = category;
    if (unit !== undefined) item.unit = unit;
    if (unitCost !== undefined) item.unitCost = Number(unitCost);
    if (currentStock !== undefined) item.currentStock = Number(currentStock);
    if (reorderLevel !== undefined) item.reorderLevel = Number(reorderLevel);
    if (preferredVendor !== undefined) {
      const vendor = (memoryStore.vendors || []).find(v => v._id === preferredVendor || v.name === preferredVendor);
      item.preferredVendor = vendor?._id || preferredVendor;
      item.preferredVendorName = vendor?.name || (preferredVendor && preferredVendor !== '—' ? preferredVendor : '');
    }
    if (notes !== undefined) item.notes = notes;
    item.updatedAt = new Date();

    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adjustmentType, quantity, reason } = req.body; // 'add' | 'subtract' | 'set'

    const item = (memoryStore.utilityStock || []).find(s => s._id === id);
    if (!item) {
      return res.status(404).json({ error: 'Stock item not found' });
    }

    const qty = Number(quantity);
    if (isNaN(qty)) {
      return res.status(400).json({ error: 'Valid adjustment quantity is required' });
    }

    const previousStock = item.currentStock;
    if (adjustmentType === 'add') {
      item.currentStock += Math.abs(qty);
      item.lastRestocked = new Date();
    } else if (adjustmentType === 'subtract') {
      item.currentStock = Math.max(0, item.currentStock - Math.abs(qty));
    } else if (adjustmentType === 'set') {
      item.currentStock = Math.max(0, qty);
    } else {
      return res.status(400).json({ error: 'Invalid adjustment type' });
    }

    item.updatedAt = new Date();

    // Log Activity
    if (!memoryStore.activityLogs) memoryStore.activityLogs = [];
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Inventory',
      action: 'update',
      title: 'Stock Adjusted',
      description: `Adjusted ${item.name} from ${previousStock} to ${item.currentStock} ${item.unit} (${reason || 'Manual Adjustment'}).`,
      entityId: item._id,
      userName: req.body.userName || 'Admin',
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Stock updated to ${item.currentStock} ${item.unit}`,
      item
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUtilityStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.utilityStock || []).findIndex(s => s._id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Stock item not found' });
    }
    const removed = memoryStore.utilityStock.splice(idx, 1)[0];
    return res.json({ success: true, message: `Item ${removed.name} removed from stock.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. VENDORS & SUPPLIERS
// ==========================================

export const getVendors = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.vendors || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const {
      name,
      gstNumber,
      contactPerson,
      phone,
      email,
      address,
      paymentTerms,
      leadTimeDays,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }

    const count = (memoryStore.vendors || []).length + 1;
    const vendorCode = `VND-${String(count).padStart(3, '0')}`;

    const newVendor: IStoreVendor = {
      _id: `vnd_${Date.now()}`,
      vendorCode,
      name: name.trim(),
      gstNumber: gstNumber ? gstNumber.trim().toUpperCase() : '',
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      paymentTerms: paymentTerms || 'Net 30',
      leadTimeDays: Number(leadTimeDays) || 7,
      accountHolderName: accountHolderName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : '',
      upiId: upiId || '',
      notes: notes || '',
      status: 'active',
      createdAt: new Date()
    };

    if (!memoryStore.vendors) memoryStore.vendors = [];
    memoryStore.vendors.push(newVendor);

    return res.status(201).json(newVendor);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      gstNumber,
      contactPerson,
      phone,
      email,
      address,
      paymentTerms,
      leadTimeDays,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId,
      notes,
      status
    } = req.body;

    const vendor = (memoryStore.vendors || []).find(v => v._id === id || v.vendorCode === id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (name !== undefined) vendor.name = name.trim();
    if (gstNumber !== undefined) vendor.gstNumber = gstNumber.trim().toUpperCase();
    if (contactPerson !== undefined) vendor.contactPerson = contactPerson;
    if (phone !== undefined) vendor.phone = phone;
    if (email !== undefined) vendor.email = email;
    if (address !== undefined) vendor.address = address;
    if (paymentTerms !== undefined) vendor.paymentTerms = paymentTerms;
    if (leadTimeDays !== undefined) vendor.leadTimeDays = Number(leadTimeDays);
    if (accountHolderName !== undefined) vendor.accountHolderName = accountHolderName;
    if (accountNumber !== undefined) vendor.accountNumber = accountNumber;
    if (ifscCode !== undefined) vendor.ifscCode = ifscCode.trim().toUpperCase();
    if (upiId !== undefined) vendor.upiId = upiId;
    if (notes !== undefined) vendor.notes = notes;
    if (status !== undefined) vendor.status = status;
    vendor.updatedAt = new Date();

    return res.json(vendor);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.vendors || []).findIndex(v => v._id === id || v.vendorCode === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const removed = memoryStore.vendors.splice(idx, 1)[0];
    return res.json({ success: true, message: `Vendor ${removed.name} removed.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. PURCHASE ORDERS (UTILITIES & PACKAGING)
// ==========================================

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    return res.json(memoryStore.purchaseOrders || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const {
      vendorId,
      vendorName,
      itemId,
      itemName,
      quantity,
      rate,
      orderDate,
      expectedDelivery,
      invoiceNumber,
      status,
      notes
    } = req.body;

    const vendor = (memoryStore.vendors || []).find(v => v._id === vendorId || v.name === vendorName);
    const stockItem = (memoryStore.utilityStock || []).find(s => s._id === itemId || s.name === itemName);

    const qty = Number(quantity) || 0;
    const unitRate = Number(rate) || stockItem?.unitCost || 0;
    const totalAmount = qty * unitRate;

    const count = (memoryStore.purchaseOrders || []).length + 1;
    const dateStr = (orderDate || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const poNumber = `PO-${dateStr}-${String(count).padStart(3, '0')}`;

    const newPO: IStorePurchaseOrder = {
      _id: `po_${Date.now()}`,
      poNumber,
      vendorId: vendor?._id || vendorId || '',
      vendorName: vendor?.name || vendorName || 'Vendor Partner',
      itemId: stockItem?._id || itemId || '',
      itemName: stockItem?.name || itemName || 'Utility Item',
      quantity: qty,
      rate: unitRate,
      totalAmount,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      expectedDelivery: expectedDelivery || '',
      invoiceNumber: invoiceNumber || '',
      status: status || 'Ordered',
      notes: notes || '',
      createdAt: new Date()
    };

    if (!memoryStore.purchaseOrders) memoryStore.purchaseOrders = [];
    memoryStore.purchaseOrders.unshift(newPO);

    // If created directly as Received, update stock
    if (newPO.status === 'Received' && stockItem) {
      stockItem.currentStock += qty;
      stockItem.lastRestocked = new Date();
      newPO.receivedAt = new Date();
    }

    return res.status(201).json(newPO);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      vendorId,
      vendorName,
      itemId,
      itemName,
      quantity,
      rate,
      orderDate,
      expectedDelivery,
      invoiceNumber,
      status,
      notes
    } = req.body;

    const po = (memoryStore.purchaseOrders || []).find(p => p._id === id || p.poNumber === id);
    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const prevStatus = po.status;

    if (vendorId !== undefined) po.vendorId = vendorId;
    if (vendorName !== undefined) po.vendorName = vendorName;
    if (itemId !== undefined) po.itemId = itemId;
    if (itemName !== undefined) po.itemName = itemName;
    if (quantity !== undefined) po.quantity = Number(quantity);
    if (rate !== undefined) po.rate = Number(rate);
    po.totalAmount = po.quantity * po.rate;
    if (orderDate !== undefined) po.orderDate = orderDate;
    if (expectedDelivery !== undefined) po.expectedDelivery = expectedDelivery;
    if (invoiceNumber !== undefined) po.invoiceNumber = invoiceNumber;
    if (status !== undefined) po.status = status;
    if (notes !== undefined) po.notes = notes;
    po.updatedAt = new Date();

    // If status changed to Received, auto-increment inventory stock
    if (prevStatus !== 'Received' && po.status === 'Received') {
      po.receivedAt = new Date();
      const stockItem = (memoryStore.utilityStock || []).find(s => s._id === po.itemId || s.name === po.itemName);
      if (stockItem) {
        stockItem.currentStock += po.quantity;
        stockItem.lastRestocked = new Date();
      }
    }

    return res.json(po);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = (memoryStore.purchaseOrders || []).findIndex(p => p._id === id || p.poNumber === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    const removed = memoryStore.purchaseOrders.splice(idx, 1)[0];
    return res.json({ success: true, message: `PO ${removed.poNumber} removed.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
