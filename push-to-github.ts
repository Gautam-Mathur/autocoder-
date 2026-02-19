import { Octokit } from "@octokit/rest";

async function getAccessToken() {
  let connectionSettings: any;
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) throw new Error("No repl token");

  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=github",
    { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } }
  ).then((r) => r.json()).then((d) => d.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;
}

async function main() {
  const token = await getAccessToken();
  const octokit = new Octokit({ auth: token });
  const owner = "Gautam-Mathur";
  const repo = "autocoder-";
  const branch = "main";

  // Get current commit SHA
  let baseSha: string;
  try {
    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    baseSha = ref.object.sha;
  } catch {
    console.log("Branch not found, creating initial commit");
    baseSha = "";
  }

  // Collect files
  const fs = await import("fs");
  const path = await import("path");
  const root = "/home/runner/workspace";

  const ignoreDirs = new Set(["node_modules", ".git", ".cache", "dist", ".replit", ".upm", ".local", ".config", "__pycache__", "attached_assets"]);
  const ignoreFiles = new Set([".replit", "replit.nix", ".gitattributes"]);

  function walk(dir: string): string[] {
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") && ignoreDirs.has(entry.name)) continue;
      if (ignoreDirs.has(entry.name)) continue;
      if (ignoreFiles.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walk(full));
      } else {
        results.push(full);
      }
    }
    return results;
  }

  const allFiles = walk(root);
  console.log(`Found ${allFiles.length} files to push`);

  // Create blobs in parallel batches
  const BATCH = 20;
  const treeItems: any[] = [];

  for (let i = 0; i < allFiles.length; i += BATCH) {
    const batch = allFiles.slice(i, i + BATCH);
    const promises = batch.map(async (filePath) => {
      const relativePath = path.relative(root, filePath);
      try {
        const content = fs.readFileSync(filePath);
        // Check if binary
        const isBinary = content.some((b: number) => b === 0);
        
        const { data: blob } = await octokit.git.createBlob({
          owner, repo,
          content: isBinary ? content.toString("base64") : content.toString("utf-8"),
          encoding: isBinary ? "base64" : "utf-8",
        });
        return { path: relativePath, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
      } catch (e: any) {
        console.error(`Failed: ${relativePath}: ${e.message}`);
        return null;
      }
    });
    const results = await Promise.all(promises);
    treeItems.push(...results.filter(Boolean));
    console.log(`Uploaded ${Math.min(i + BATCH, allFiles.length)}/${allFiles.length} blobs`);
  }

  // Create tree
  console.log("Creating tree...");
  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    tree: treeItems,
    ...(baseSha ? { base_tree: baseSha } : {}),
  });

  // Create commit
  console.log("Creating commit...");
  const { data: commit } = await octokit.git.createCommit({
    owner, repo,
    message: "CodeGen V2: dependency-tracked composable code generation engine\n\n- 18+ pre-built components with dependency tracking\n- Smart field-to-component mapping\n- 5+ UI patterns (list, detail, dashboard, kanban, card-grid)\n- Real CRUD with optimistic updates\n- Post-generation validation (0 errors, 0 warnings)\n- E2E test suite (Hospital, E-commerce, Project Manager)",
    tree: tree.sha,
    parents: baseSha ? [baseSha] : [],
  });

  // Update ref
  console.log("Updating ref...");
  await octokit.git.updateRef({
    owner, repo,
    ref: `heads/${branch}`,
    sha: commit.sha,
    force: true,
  });

  console.log(`\nPushed ${treeItems.length} files to GitHub successfully!`);
  console.log(`Commit: ${commit.sha}`);
}

main().catch(e => { console.error(e); process.exit(1); });
