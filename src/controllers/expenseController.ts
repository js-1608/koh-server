import { Request, Response } from 'express';
import { memoryStore, IStoreExpense } from '../services/storeService';

// GET /api/expenses
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    let list = [...memoryStore.expenses];

    if (status && typeof status === 'string') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }

    if (category && typeof category === 'string') {
      list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const pendingCount = list.filter(e => e.status === 'pending').length;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const approvedThisMonth = list
      .filter(e => e.status === 'approved' && e.date?.startsWith(currentMonth))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    res.json({
      success: true,
      data: list,
      meta: {
        pendingCount,
        approvedThisMonth,
        count: list.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/expenses
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { person, submittedBy, date, category, amount, description, billImageKey } = req.body;
    if (!person || !amount) {
      return res.status(400).json({ success: false, message: 'Person and amount are required' });
    }

    const newExpense: IStoreExpense = {
      _id: 'exp_' + Date.now(),
      voucherNo: 'VCH-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4),
      person,
      submittedBy: submittedBy || person,
      date: date || new Date().toISOString().split('T')[0],
      category: category || 'Miscellaneous',
      amount: Number(amount),
      description: description || '',
      status: 'pending',
      reimbursementStatus: 'pending',
      billImageKey: billImageKey || '',
      createdAt: new Date()
    };

    memoryStore.expenses.unshift(newExpense);
    res.status(201).json({ success: true, data: newExpense });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/expenses/:id
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reimbursementStatus, notes } = req.body;

    const expense = memoryStore.expenses.find(e => e._id === id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found' });
    }

    if (status) expense.status = status;
    if (reimbursementStatus) expense.reimbursementStatus = reimbursementStatus;

    res.json({ success: true, data: expense });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.expenses.findIndex(e => e._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Expense claim not found' });
    }

    memoryStore.expenses.splice(idx, 1);
    res.json({ success: true, message: 'Expense claim removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
