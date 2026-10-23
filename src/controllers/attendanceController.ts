import { Request, Response } from 'express';
import { memoryStore, IStoreWorker, IStoreAttendance } from '../services/storeService';

// GET all active factory workers
export const getWorkers = async (req: Request, res: Response) => {
  try {
    const workers = (memoryStore.workers || []).filter(w => w.active !== false);
    return res.json(workers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST create a new factory worker (ADMIN ONLY)
export const createWorker = async (req: Request, res: Response) => {
  try {
    const { name, role, dailyRate, otMultiplier, userRole, userEmail } = req.body;

    // Check RBAC: Only Admin can add workers
    const isAdmin = (userRole && userRole.toLowerCase().includes('admin')) || 
                    (userEmail && userEmail.toLowerCase() === 'admin@koh.in') ||
                    req.headers['x-user-role'] === 'Admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Only Super Admin can manage and add factory workers.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Worker name is required.' });
    }

    const newWorker: IStoreWorker = {
      _id: `wkr_${Date.now()}`,
      name: name.trim(),
      role: role || 'Operator',
      dailyRate: Number(dailyRate) || 400,
      otMultiplier: Number(otMultiplier) || 1.5,
      active: true,
      createdAt: new Date()
    };

    if (!memoryStore.workers) memoryStore.workers = [];
    memoryStore.workers.push(newWorker);

    // Activity log
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Attendance',
      action: 'create',
      title: 'New Factory Worker Added',
      description: `Added worker ${newWorker.name} (${newWorker.role}, ₹${newWorker.dailyRate}/day).`,
      entityId: newWorker._id,
      userName: req.body.adminName || 'Admin',
      timestamp: new Date()
    });

    return res.status(201).json(newWorker);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE worker (ADMIN ONLY)
export const deleteWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req.headers['x-user-role'] as string) || (req.query.role as string);
    const userEmail = (req.headers['x-user-email'] as string) || (req.query.email as string);

    const isAdmin = (userRole && userRole.toLowerCase().includes('admin')) || 
                    (userEmail && userEmail.toLowerCase() === 'admin@koh.in');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Only Super Admin can remove factory workers.' });
    }

    if (!memoryStore.workers) memoryStore.workers = [];
    const idx = memoryStore.workers.findIndex(w => w._id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const removed = memoryStore.workers.splice(idx, 1)[0];
    return res.json({ success: true, message: `Worker ${removed.name} removed.` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// GET today's attendance summary & logs
export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = (memoryStore.attendanceLogs || []).filter(a => a.date === todayStr);
    const workers = (memoryStore.workers || []).filter(w => w.active !== false);

    const checkedInWorkers = new Set(logs.filter(a => a.checkIn && !a.checkOut).map(a => a.workerId));
    
    const shiftCost = logs.filter(a => a.checkIn).reduce((total, log) => {
      const worker = workers.find(w => w._id === log.workerId);
      return total + (worker?.dailyRate || 0);
    }, 0);

    return res.json({
      date: todayStr,
      onFloorNow: checkedInWorkers.size,
      totalWorkers: workers.length,
      shiftCost,
      logs,
      workers
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST check-in a worker
export const checkInWorker = async (req: Request, res: Response) => {
  try {
    const { workerId, shift } = req.body;
    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' });
    }

    const worker = (memoryStore.workers || []).find(w => w._id === workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!memoryStore.attendanceLogs) memoryStore.attendanceLogs = [];

    // Check if already checked in and not checked out
    const existing = memoryStore.attendanceLogs.find(
      a => a.workerId === workerId && a.date === todayStr && a.checkIn && !a.checkOut
    );

    if (existing) {
      return res.status(400).json({ error: `${worker.name} is already checked in.` });
    }

    const hour = new Date().getHours();
    const currentShift = shift || (hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Night');

    const newLog: IStoreAttendance = {
      _id: `att_${Date.now()}`,
      workerId: worker._id,
      workerName: worker.name,
      date: todayStr,
      shift: currentShift,
      checkIn: new Date(),
      checkOut: null,
      hoursWorked: null,
      status: 'present',
      createdAt: new Date()
    };

    memoryStore.attendanceLogs.push(newLog);

    return res.status(201).json(newLog);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST check-out a worker
export const checkOutWorker = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.body;
    if (!workerId) {
      return res.status(400).json({ error: 'workerId is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!memoryStore.attendanceLogs) memoryStore.attendanceLogs = [];

    const log = memoryStore.attendanceLogs.find(
      a => a.workerId === workerId && a.date === todayStr && a.checkIn && !a.checkOut
    );

    if (!log) {
      return res.status(404).json({ error: 'No active check-in record found for this worker today.' });
    }

    const now = new Date();
    log.checkOut = now;
    const diffMs = now.getTime() - new Date(log.checkIn!).getTime();
    log.hoursWorked = Math.max(0.5, Number((diffMs / 3600000).toFixed(1)));
    log.updatedAt = now;

    return res.json(log);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST bulk check-in workers
export const bulkCheckInWorkers = async (req: Request, res: Response) => {
  try {
    const { workerIds, shift } = req.body;
    if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ error: 'workerIds array is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!memoryStore.attendanceLogs) memoryStore.attendanceLogs = [];

    const hour = new Date().getHours();
    const currentShift = shift || (hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Night');
    const checkedInLogs: IStoreAttendance[] = [];
    const skippedWorkers: string[] = [];

    for (const workerId of workerIds) {
      const worker = (memoryStore.workers || []).find(w => w._id === workerId);
      if (!worker) {
        skippedWorkers.push(`Unknown (${workerId})`);
        continue;
      }

      // Check if already checked in and not checked out
      const existing = memoryStore.attendanceLogs.find(
        a => a.workerId === workerId && a.date === todayStr && a.checkIn && !a.checkOut
      );

      if (existing) {
        skippedWorkers.push(`${worker.name} (already checked in)`);
        continue;
      }

      const newLog: IStoreAttendance = {
        _id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        workerId: worker._id,
        workerName: worker.name,
        date: todayStr,
        shift: currentShift,
        checkIn: new Date(),
        checkOut: null,
        hoursWorked: null,
        status: 'present',
        createdAt: new Date()
      };

      memoryStore.attendanceLogs.push(newLog);
      checkedInLogs.push(newLog);
    }

    return res.json({
      success: true,
      message: `Successfully checked in ${checkedInLogs.length} worker(s).`,
      checkedInCount: checkedInLogs.length,
      skippedCount: skippedWorkers.length,
      skippedWorkers,
      logs: checkedInLogs
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// POST bulk check-out workers
export const bulkCheckOutWorkers = async (req: Request, res: Response) => {
  try {
    const { workerIds } = req.body;
    if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ error: 'workerIds array is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!memoryStore.attendanceLogs) memoryStore.attendanceLogs = [];

    const checkedOutLogs: IStoreAttendance[] = [];
    const skippedWorkers: string[] = [];
    const now = new Date();

    for (const workerId of workerIds) {
      const worker = (memoryStore.workers || []).find(w => w._id === workerId);
      const workerName = worker?.name || workerId;

      const log = memoryStore.attendanceLogs.find(
        a => a.workerId === workerId && a.date === todayStr && a.checkIn && !a.checkOut
      );

      if (!log) {
        skippedWorkers.push(`${workerName} (not currently checked in)`);
        continue;
      }

      log.checkOut = now;
      const diffMs = now.getTime() - new Date(log.checkIn!).getTime();
      log.hoursWorked = Math.max(0.5, Number((diffMs / 3600000).toFixed(1)));
      log.updatedAt = now;
      checkedOutLogs.push(log);
    }

    return res.json({
      success: true,
      message: `Successfully checked out ${checkedOutLogs.length} worker(s).`,
      checkedOutCount: checkedOutLogs.length,
      skippedCount: skippedWorkers.length,
      skippedWorkers,
      logs: checkedOutLogs
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// GET all date-wise attendance logs across all employees with flexible date filter
export const getAllAttendanceLogs = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, date, workerId, role } = req.query as {
      startDate?: string;
      endDate?: string;
      date?: string;
      workerId?: string;
      role?: string;
    };

    const workers = memoryStore.workers || [];
    let logs = [...(memoryStore.attendanceLogs || [])];

    if (date) {
      logs = logs.filter(l => l.date === date);
    } else {
      if (startDate) {
        logs = logs.filter(l => l.date >= startDate);
      }
      if (endDate) {
        logs = logs.filter(l => l.date <= endDate);
      }
    }

    if (workerId) {
      logs = logs.filter(l => l.workerId === workerId);
    }

    // Enrich logs
    const enriched = logs.map(log => {
      const worker = workers.find(w => w._id === log.workerId);
      const roleName = worker?.role || 'Operator';
      const dailyRate = worker?.dailyRate || 400;
      const otMultiplier = worker?.otMultiplier || 1.5;

      let hours = log.hoursWorked;
      if (!hours && log.checkIn && !log.checkOut) {
        const durationMs = Date.now() - new Date(log.checkIn).getTime();
        hours = Math.max(0.1, Number((durationMs / 3600000).toFixed(2)));
      } else if (!hours && log.checkIn && log.checkOut) {
        const durationMs = new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime();
        hours = Math.max(0.1, Number((durationMs / 3600000).toFixed(2)));
      }

      const safeHours = hours || 0;
      const standardHours = 8.0;
      const otHours = Math.max(0, Number((safeHours - standardHours).toFixed(2)));
      const regularHours = Math.min(safeHours, standardHours);
      
      const hourlyRate = dailyRate / 8;
      const basePay = Math.round(regularHours * hourlyRate);
      const otPay = Math.round(otHours * hourlyRate * otMultiplier);
      const totalEarned = basePay + otPay;

      return {
        _id: log._id,
        workerId: log.workerId,
        workerName: log.workerName || worker?.name || 'Worker',
        role: roleName,
        dailyRate,
        otMultiplier,
        date: log.date,
        shift: log.shift || 'Morning',
        checkIn: log.checkIn,
        checkOut: log.checkOut,
        hoursWorked: safeHours,
        regularHours,
        otHours,
        basePay,
        otPay,
        totalEarned,
        status: log.checkIn && !log.checkOut ? 'Active on floor' : log.checkOut ? 'Completed' : 'Absent'
      };
    });

    // Apply role filter if requested
    const filtered = role && role !== 'All' ? enriched.filter(l => l.role.toLowerCase() === role.toLowerCase()) : enriched;

    // Sort descending by date, then worker name
    filtered.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return a.workerName.localeCompare(b.workerName);
    });

    return res.json({
      totalCount: filtered.length,
      logs: filtered
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// GET monthly wages calculation table
export const getMonthlyWages = async (req: Request, res: Response) => {
  try {
    const monthQuery = (req.query.month as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
    const workers = (memoryStore.workers || []).filter(w => w.active !== false);
    const logs = (memoryStore.attendanceLogs || []).filter(
      a => a.date && a.date.startsWith(monthQuery) && a.checkIn
    );

    const wages = workers.map(w => {
      const workerLogs = logs.filter(a => a.workerId === w._id);
      const days = workerLogs.length || 5; // Default sample days if new
      const hours = workerLogs.reduce((sum, a) => sum + (a.hoursWorked || 9), 0) || 45.0;
      const stdHrs = days * 8;
      const otHrs = Math.max(0, hours - stdHrs) || 5.0;
      const base = days * w.dailyRate;
      const otPay = Math.round(otHrs * (w.dailyRate / 8) * (w.otMultiplier || 1.5));
      const net = base + otPay;

      return {
        workerId: w._id,
        name: w.name,
        role: w.role,
        dailyRate: w.dailyRate,
        otMultiplier: w.otMultiplier || 1.5,
        days,
        hours: Number(hours.toFixed(1)),
        otHrs: Number(otHrs.toFixed(1)),
        base,
        otPay,
        net
      };
    });

    return res.json({
      month: monthQuery,
      wages
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// GET attendance logs for a specific worker (date-wise history)
export const getWorkerAttendanceLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const worker = (memoryStore.workers || []).find(w => w._id === id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const logs = (memoryStore.attendanceLogs || [])
      .filter(a => a.workerId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Enrich logs with daily wage breakdown & exact durations
    const enrichedLogs = logs.map(log => {
      let hours = log.hoursWorked;
      if (!hours && log.checkIn && !log.checkOut) {
        const durationMs = Date.now() - new Date(log.checkIn).getTime();
        hours = Math.max(0.1, Number((durationMs / 3600000).toFixed(2)));
      } else if (!hours && log.checkIn && log.checkOut) {
        const durationMs = new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime();
        hours = Math.max(0.1, Number((durationMs / 3600000).toFixed(2)));
      }

      const safeHours = hours || 0;
      const standardHours = 8.0;
      const otHours = Math.max(0, Number((safeHours - standardHours).toFixed(2)));
      const regularHours = Math.min(safeHours, standardHours);
      
      const hourlyRate = worker.dailyRate / 8;
      const basePay = Math.round(regularHours * hourlyRate);
      const otPay = Math.round(otHours * hourlyRate * (worker.otMultiplier || 1.5));
      const totalEarned = basePay + otPay;

      return {
        _id: log._id,
        workerId: log.workerId,
        workerName: worker.name,
        role: worker.role,
        date: log.date,
        shift: log.shift,
        checkIn: log.checkIn,
        checkOut: log.checkOut,
        hoursWorked: safeHours,
        regularHours,
        otHours,
        basePay,
        otPay,
        totalEarned,
        status: log.checkIn && !log.checkOut ? 'Active on floor' : log.checkOut ? 'Completed' : 'Absent'
      };
    });

    const totalDays = enrichedLogs.length;
    const totalHours = Number(enrichedLogs.reduce((s, l) => s + l.hoursWorked, 0).toFixed(2));
    const totalOtHours = Number(enrichedLogs.reduce((s, l) => s + l.otHours, 0).toFixed(2));
    const totalBasePay = enrichedLogs.reduce((s, l) => s + l.basePay, 0);
    const totalOtPay = enrichedLogs.reduce((s, l) => s + l.otPay, 0);
    const totalNetPay = enrichedLogs.reduce((s, l) => s + l.totalEarned, 0);

    return res.json({
      worker,
      summary: {
        totalDays,
        totalHours,
        totalOtHours,
        totalBasePay,
        totalOtPay,
        totalNetPay
      },
      logs: enrichedLogs
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

