import { Request, Response } from 'express';
import { memoryStore, ALL_SYSTEM_MODULES } from '../services/storeService';
import { User } from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = memoryStore.users.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastLogin = new Date();

    // Log the login activity
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Auth',
      action: 'login',
      title: 'User Logged In',
      description: `${user.name} (${user.email}) logged in with role [${user.role}].`,
      entityId: user._id,
      userName: user.name,
      timestamp: new Date()
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      avatar: user.avatar,
      lastLogin: user.lastLogin
    };

    return res.json({
      success: true,
      token: `koh_jwt_${user._id}_${Date.now()}`,
      user: safeUser
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string || '').toLowerCase();
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email) || memoryStore.users[0];

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      avatar: user.avatar
    };

    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const safeUsers = memoryStore.users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      modules: u.modules || [],
      avatar: u.avatar || '👤',
      isActive: u.isActive !== false,
      lastLogin: u.lastLogin
    }));
    return res.json(safeUsers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, modules, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: `User with email ${cleanEmail} already exists` });
    }

    const assignedRole = role || 'Factory Staff';
    const assignedPassword = (password && String(password).trim() !== '') ? String(password).trim() : 'password123';

    // Module assignment with intelligent role defaults
    let assignedModules: string[] = [];
    if (Array.isArray(modules) && modules.length > 0) {
      assignedModules = modules;
    } else if (assignedRole === 'Admin' || assignedRole === 'Founder') {
      assignedModules = ALL_SYSTEM_MODULES;
    } else if (assignedRole === 'Batch Staff' || assignedRole === 'Factory Staff') {
      assignedModules = ['production', 'factory', 'batches', 'inventory'];
    } else if (assignedRole === 'Procurement Manager') {
      assignedModules = ['procurement', 'farmers', 'catalog', 'npd', 'dashboard'];
    } else if (assignedRole === 'Marketing Lead') {
      assignedModules = ['marketing', 'board', 'calendar', 'shoots', 'ads', 'statics', 'influencers', 'analytics', 'skus', 'dashboard'];
    } else if (assignedRole === 'Ops Head') {
      assignedModules = ['production', 'procurement', 'planning', 'catalog', 'inventory', 'attendance', 'dashboard'];
    } else {
      assignedModules = ['production', 'procurement', 'dashboard'];
    }

    const defaultAvatar =
      avatar ||
      (assignedRole === 'Admin' || assignedRole === 'Founder'
        ? '👑'
        : assignedRole === 'Batch Staff' || assignedRole === 'Factory Staff'
        ? '👨‍🏭'
        : assignedRole === 'Procurement Manager'
        ? '🌾'
        : assignedRole === 'Marketing Lead'
        ? '📈'
        : assignedRole === 'Ops Head'
        ? '⚙️'
        : '👤');

    const newUser = {
      _id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: assignedPassword,
      role: assignedRole,
      modules: assignedModules,
      avatar: defaultAvatar,
      isActive: true,
      lastLogin: new Date()
    };

    memoryStore.users.push(newUser);

    // Save to Mongo if connected
    try {
      if (User) {
        await User.create({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          modules: newUser.modules,
          avatar: newUser.avatar,
          isActive: true
        });
      }
    } catch (dbErr) {
      // Memory store already updated
    }

    // Add activity log
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Users',
      action: 'create',
      title: 'New Team Member Assigned',
      description: `Created user ${newUser.name} (${newUser.email}) with role [${newUser.role}] and ${assignedModules.length} assigned modules.`,
      entityId: newUser._id,
      userName: req.body.adminName || 'Admin',
      timestamp: new Date()
    });

    const safeUser = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      modules: newUser.modules,
      avatar: newUser.avatar,
      isActive: newUser.isActive,
      lastLogin: newUser.lastLogin
    };

    return res.status(201).json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, modules, isActive, avatar } = req.body;

    const user = memoryStore.users.find(u => u._id === id || u.email.toLowerCase() === id.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (password !== undefined && String(password).trim() !== '') user.password = String(password).trim();
    if (role !== undefined) user.role = role;
    if (modules !== undefined && Array.isArray(modules)) user.modules = modules;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (avatar !== undefined) user.avatar = avatar;

    // Update in Mongo if connected
    try {
      if (User) {
        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            role: user.role,
            modules: user.modules,
            avatar: user.avatar,
            isActive: user.isActive,
            ...(password ? { password: user.password } : {})
          }
        );
      }
    } catch (dbErr) {
      // Memory store is already up to date
    }

    // Add activity log
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Users',
      action: 'update',
      title: 'User Profile & Permissions Updated',
      description: `Updated permissions and profile for ${user.name} (${user.email}).`,
      entityId: user._id,
      userName: req.body.adminName || 'Admin',
      timestamp: new Date()
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };

    return res.json(safeUser);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryStore.users.findIndex(u => u._id === id || u.email.toLowerCase() === id.toLowerCase());
    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userToDelete = memoryStore.users[idx];
    if (userToDelete.email.toLowerCase() === 'admin@koh.in') {
      return res.status(400).json({ error: 'Master Admin account cannot be deleted' });
    }

    const deleted = memoryStore.users.splice(idx, 1)[0];

    // Delete in Mongo if connected
    try {
      if (User) {
        await User.deleteOne({ email: deleted.email });
      }
    } catch (dbErr) {
      // Memory store is already updated
    }

    // Log deletion
    memoryStore.activityLogs.unshift({
      _id: `log_${Date.now()}`,
      module: 'Users',
      action: 'delete',
      title: 'User Access Revoked',
      description: `Revoked access and removed user ${deleted.name} (${deleted.email}).`,
      entityId: deleted._id,
      userName: 'Admin',
      timestamp: new Date()
    });

    return res.json({ success: true, message: `User ${deleted.email} removed` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

