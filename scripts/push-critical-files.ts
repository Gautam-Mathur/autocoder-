import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

async function pushFiles() {
  const octokit = new Octokit({ auth: await getAccessToken() });
  const owner = 'Gautam-Mathur';
  const repo = 'autocoder-';
  const branch = 'main';

  // Critical files that need to be pushed
  const files = [
    'client/src/lib/code-runner/webcontainer.ts',
    'client/src/lib/code-runner/auto-runner.ts',
    'client/src/components/auto-run-preview.tsx'
  ];

  console.log('🚀 Pushing critical files...');

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  const parentSha = ref.object.sha;
  console.log(`   Base commit: ${parentSha.substring(0, 7)}`);

  const treeItems: any[] = [];
  
  for (const filePath of files) {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
    console.log(`   Uploading ${filePath}...`);
    
    const { data: blob } = await octokit.git.createBlob({
      owner, repo,
      content,
      encoding: 'utf-8'
    });
    
    treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
    await new Promise(r => setTimeout(r, 500)); // Rate limit protection
  }

  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    tree: treeItems,
    base_tree: parentSha
  });

  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: 'Fix missing exports: hasNodeModules, setPackageJsonHash',
    tree: tree.sha,
    parents: [parentSha]
  });

  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });
  
  console.log(`✅ Push successful! Commit: ${commit.sha.substring(0, 7)}`);
}

pushFiles().catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });
