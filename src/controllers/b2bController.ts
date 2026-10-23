import { Request, Response } from 'express';
import { memoryStore, IStoreB2BLead, IStoreB2BOrder } from '../services/storeService';

// GET /api/b2b/leads
export const getB2BLeads = async (req: Request, res: Response) => {
  try {
    const { stage, type } = req.query;
    let list = [...memoryStore.b2bLeads];

    if (stage && typeof stage === 'string') {
      list = list.filter(l => l.stage.toLowerCase() === stage.toLowerCase());
    }

    if (type && typeof type === 'string') {
      list = list.filter(l => l.type.toLowerCase() === type.toLowerCase());
    }

    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const activeLeads = list.filter(l => !['won', 'lost'].includes(l.stage)).length;
    const wonCount = list.filter(l => l.stage === 'won').length;

    res.json({
      success: true,
      data: list,
      meta: {
        activeLeads,
        wonCount,
        count: list.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/b2b/leads
export const createB2BLead = async (req: Request, res: Response) => {
  try {
    const { name, type, stage, city, state, contactPerson, phone, email, gst, address, estimatedValue, creditLimit, paymentTerms, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Lead / business name is required' });
    }

    const newLead: IStoreB2BLead = {
      _id: 'b2b_' + Date.now(),
      name,
      type: type || 'Bulk/Distributor',
      stage: stage || 'lead',
      city: city || '',
      state: state || 'Telangana',
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      gst,
      address,
      estimatedValue: Number(estimatedValue) || 0,
      creditLimit: Number(creditLimit) || 0,
      paymentTerms: paymentTerms || 'Advance',
      samplesSent: [],
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryStore.b2bLeads.unshift(newLead);
    res.status(201).json({ success: true, data: newLead });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/b2b/leads/:id
export const updateB2BLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = memoryStore.b2bLeads.find(l => l._id === id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'B2B lead not found' });
    }

    Object.assign(lead, req.body, { updatedAt: new Date() });
    res.json({ success: true, data: lead });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/b2b/orders
export const getB2BOrders = async (req: Request, res: Response) => {
  try {
    const list = [...memoryStore.b2bOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const totalRevenue = list
      .filter(o => ['delivered', 'paid', 'processing', 'confirmed'].includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const receivables = list
      .filter(o => o.paymentStatus !== 'paid' && o.status !== 'draft')
      .reduce((sum, o) => sum + ((o.totalAmount || 0) - (o.paidAmount || 0)), 0);

    res.json({
      success: true,
      data: list,
      meta: {
        totalRevenue,
        receivables,
        count: list.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/b2b/orders
export const createB2BOrder = async (req: Request, res: Response) => {
  try {
    const { clientId, clientName, items, totalAmount, deliveryDueDate, paymentTerms, notes } = req.body;
    if (!clientName || !totalAmount) {
      return res.status(400).json({ success: false, message: 'clientName and totalAmount are required' });
    }

    const newOrder: IStoreB2BOrder = {
      _id: 'b2bo_' + Date.now(),
      clientId: clientId || 'b2b_client',
      clientName,
      orderNumber: 'ORD-B2B-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4),
      items: Array.isArray(items) ? items : [],
      totalAmount: Number(totalAmount),
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDueDate: deliveryDueDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: 'confirmed',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      notes,
      createdAt: new Date()
    };

    memoryStore.b2bOrders.unshift(newOrder);
    res.status(201).json({ success: true, data: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/b2b/orders/:id
export const updateB2BOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = memoryStore.b2bOrders.find(o => o._id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'B2B order not found' });
    }

    Object.assign(order, req.body);
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
