import { Request, Response } from 'express';
import { memoryStore, IStorePayment } from '../services/storeService';

// GET /api/payments
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { status, recipientType } = req.query;
    let list = [...memoryStore.payments];

    if (status && typeof status === 'string') {
      list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    if (recipientType && typeof recipientType === 'string') {
      list = list.filter(p => p.recipientType.toLowerCase() === recipientType.toLowerCase());
    }

    // Sort by age (oldest due first)
    list.sort((a, b) => b.ageDays - a.ageDays);

    const grandTotal = list.reduce((sum, p) => sum + (p.amount || 0), 0);
    const overdueCount = list.filter(p => p.ageDays > 30 && p.status !== 'paid').length;

    res.json({
      success: true,
      data: list,
      meta: {
        totalOutstanding: grandTotal,
        overdueCount,
        count: list.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { referenceId, recipientType, recipientName, category, detail, amount, dueDate, notes } = req.body;
    if (!recipientName || !amount) {
      return res.status(400).json({ success: false, message: 'recipientName and amount are required' });
    }

    const newPayment: IStorePayment = {
      _id: 'pay_' + Date.now(),
      referenceId: referenceId || 'PAY-' + Date.now().toString().slice(-6),
      recipientType: recipientType || 'other',
      recipientName,
      category: category || 'General',
      detail: detail || '',
      amount: Number(amount),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      ageDays: 0,
      notes,
      createdAt: new Date()
    };

    memoryStore.payments.unshift(newPayment);
    res.status(201).json({ success: true, data: newPayment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/payments/:id/pay
export const payPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMode, utrRef, notes } = req.body;

    const payment = memoryStore.payments.find(p => p._id === id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.status = 'paid';
    payment.paidDate = new Date().toISOString().split('T')[0];
    if (paymentMode) payment.paymentMode = paymentMode;
    if (utrRef) payment.utrRef = utrRef;
    if (notes) payment.notes = notes;

    // Cross-sync underlying receipt or order if applicable
    if (payment.referenceId.startsWith('REC-')) {
      const receipt = memoryStore.receipts.find(r => r.rmId === payment.referenceId);
      if (receipt) receipt.paymentStatus = 'paid';
    } else if (payment.referenceId.startsWith('PO-')) {
      const po = memoryStore.purchaseOrders.find(o => o.poNumber === payment.referenceId);
      if (po) po.status = 'Received';
    }

    res.json({ success: true, data: payment, message: 'Payment marked as settled' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
