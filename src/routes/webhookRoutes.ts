import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import fs from 'fs';

const router = Router();
const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'koh_auto_deploy_2026';
const LOG_FILE = '/var/log/koh-deploy.log';

/**
 * POST /api/webhook/deploy
 * Handles both GitHub native push webhooks and direct API/curl calls.
 */
router.post('/deploy', (req: Request, res: Response) => {
  const secret = req.headers['x-deploy-secret'] || req.query.secret || req.body?.secret;
  const githubEvent = req.headers['x-github-event'];

  let project = req.body?.project;

  // Handle native GitHub webhook payload
  if (githubEvent === 'push' || req.body?.ref) {
    const ref = req.body?.ref;
    // Only deploy on push to main branch
    if (ref && ref !== 'refs/heads/main') {
      return res.status(200).json({
        ignored: true,
        message: `Ignored push to non-main branch: ${ref}`
      });
    }

    const repoName = (req.body?.repository?.name || '').toLowerCase();
    if (repoName.includes('server')) {
      project = 'server';
    } else if (repoName.includes('admin')) {
      project = 'admin';
    } else if (repoName.includes('factory') || repoName.includes('batch')) {
      project = 'batch';
    }
  }

  // Security check: verify secret if provided or enforce secret unless valid github event with query token
  if (secret !== DEPLOY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid deploy secret' });
  }

  if (!project) {
    return res.status(400).json({ error: 'Target project missing. Specify server, admin, or batch.' });
  }

  // Send immediate 200 response to prevent HTTP timeout
  res.status(200).json({
    success: true,
    message: `Deployment started for project: ${project}`,
    target: project,
    timestamp: new Date().toISOString()
  });

  // Execute deployment in background
  console.log(`[Auto-Deploy] Triggering deployment for ${project}...`);
  exec(`/var/www/koh/deploy.sh ${project}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Auto-Deploy ${project} Error]:`, error);
    } else {
      console.log(`[Auto-Deploy ${project} Finished]:\n${stdout}`);
    }
  });
});

/**
 * GET /api/webhook/deploy/status
 * Returns recent deployment log lines
 */
router.get('/deploy/status', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logs = fs.readFileSync(LOG_FILE, 'utf-8');
      const lines = logs.trim().split('\n').slice(-100);
      return res.type('text/plain').send(lines.join('\n'));
    } else {
      return res.send('No deployment logs recorded yet.');
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
