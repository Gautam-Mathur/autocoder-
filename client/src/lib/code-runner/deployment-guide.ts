export interface DeploymentGuide {
  platform: string;
  icon: string;
  steps: string[];
  configFiles: { name: string; content: string }[];
  commands: string[];
  url: string;
  features: string[];
}

export interface ProjectAnalysis {
  type: "static" | "node" | "react" | "nextjs" | "express" | "fullstack";
  framework?: string;
  hasDatabase: boolean;
  hasAuth: boolean;
  dependencies: string[];
  envVars: string[];
}

export function analyzeProject(files: { path: string; content: string }[]): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    type: "static",
    hasDatabase: false,
    hasAuth: false,
    dependencies: [],
    envVars: [],
  };

  const packageJson = files.find(f => f.path.includes("package.json"));
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content);
      analysis.dependencies = Object.keys(pkg.dependencies || {});
      
      if (analysis.dependencies.includes("next")) {
        analysis.type = "nextjs";
        analysis.framework = "Next.js";
      } else if (analysis.dependencies.includes("express")) {
        analysis.type = "express";
        analysis.framework = "Express.js";
      } else if (analysis.dependencies.includes("react")) {
        analysis.type = "react";
        analysis.framework = "React";
      } else if (analysis.dependencies.includes("vue")) {
        analysis.type = "react";
        analysis.framework = "Vue.js";
      }

      if (analysis.dependencies.some(d => ["pg", "mysql2", "mongodb", "prisma", "drizzle-orm"].includes(d))) {
        analysis.hasDatabase = true;
      }

      if (analysis.dependencies.some(d => ["passport", "next-auth", "jsonwebtoken", "bcrypt"].includes(d))) {
        analysis.hasAuth = true;
      }
    } catch (e) {
      console.error("Failed to parse package.json");
    }
  }

  const hasHtml = files.some(f => f.path.endsWith(".html"));
  const hasJs = files.some(f => f.path.endsWith(".js") || f.path.endsWith(".ts"));
  
  if (!packageJson && hasHtml) {
    analysis.type = "static";
  }

  for (const file of files) {
    const envMatches = file.content.match(/process\.env\.(\w+)|import\.meta\.env\.(\w+)/g);
    if (envMatches) {
      for (const match of envMatches) {
        const varName = match.replace(/process\.env\.|import\.meta\.env\./, "");
        if (!analysis.envVars.includes(varName)) {
          analysis.envVars.push(varName);
        }
      }
    }
  }

  return analysis;
}

export function generateDeploymentGuides(analysis: ProjectAnalysis): DeploymentGuide[] {
  const guides: DeploymentGuide[] = [];

  guides.push(generateVercelGuide(analysis));
  guides.push(generateNetlifyGuide(analysis));
  guides.push(generateReplitGuide(analysis));
  guides.push(generateRailwayGuide(analysis));

  return guides;
}

function generateVercelGuide(analysis: ProjectAnalysis): DeploymentGuide {
  const steps = [
    "Sign up or log in to Vercel (vercel.com)",
    "Click 'Add New Project'",
    "Import your Git repository or drag & drop your project folder",
  ];

  const commands: string[] = [];
  const configFiles: { name: string; content: string }[] = [];

  if (analysis.type === "react" || analysis.type === "nextjs") {
    steps.push("Vercel will auto-detect your framework");
    steps.push("Configure environment variables if needed");
    steps.push("Click 'Deploy'");
  } else if (analysis.type === "express" || analysis.type === "fullstack") {
    steps.push("Add vercel.json configuration for serverless functions");
    configFiles.push({
      name: "vercel.json",
      content: JSON.stringify({
        version: 2,
        builds: [{ src: "*.js", use: "@vercel/node" }],
        routes: [{ src: "/(.*)", dest: "/" }],
      }, null, 2),
    });
  } else {
    steps.push("Set output directory to your build folder");
  }

  if (analysis.envVars.length > 0) {
    steps.push(`Add environment variables: ${analysis.envVars.join(", ")}`);
  }

  commands.push("npm i -g vercel");
  commands.push("vercel login");
  commands.push("vercel --prod");

  return {
    platform: "Vercel",
    icon: "▲",
    steps,
    configFiles,
    commands,
    url: "https://vercel.com",
    features: ["Automatic HTTPS", "Edge Functions", "Preview Deployments", "Analytics"],
  };
}

function generateNetlifyGuide(analysis: ProjectAnalysis): DeploymentGuide {
  const steps = [
    "Sign up or log in to Netlify (netlify.com)",
    "Click 'Add new site' → 'Import an existing project'",
    "Connect your Git repository",
  ];

  const commands: string[] = [];
  const configFiles: { name: string; content: string }[] = [];

  if (analysis.type === "react") {
    steps.push("Set build command: npm run build");
    steps.push("Set publish directory: dist or build");
  } else if (analysis.type === "express" || analysis.type === "fullstack") {
    steps.push("Create netlify.toml for serverless functions");
    configFiles.push({
      name: "netlify.toml",
      content: `[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200`,
    });
  }

  if (analysis.envVars.length > 0) {
    steps.push(`Add environment variables in Site settings → Environment variables`);
  }

  steps.push("Click 'Deploy site'");

  commands.push("npm i -g netlify-cli");
  commands.push("netlify login");
  commands.push("netlify deploy --prod");

  return {
    platform: "Netlify",
    icon: "◆",
    steps,
    configFiles,
    commands,
    url: "https://netlify.com",
    features: ["Form Handling", "Serverless Functions", "Split Testing", "Identity"],
  };
}

function generateReplitGuide(analysis: ProjectAnalysis): DeploymentGuide {
  const steps = [
    "Sign up or log in to Replit (replit.com)",
    "Create a new Repl and import your code",
    "Click the 'Run' button to start your app",
    "Click 'Deploy' in the top right",
    "Choose 'Autoscale' for production apps",
    "Configure your deployment settings",
    "Click 'Deploy' to publish",
  ];

  if (analysis.envVars.length > 0) {
    steps.splice(3, 0, `Add secrets in the Secrets tab: ${analysis.envVars.join(", ")}`);
  }

  return {
    platform: "Replit",
    icon: "◎",
    steps,
    configFiles: [],
    commands: [],
    url: "https://replit.com",
    features: ["Built-in Database", "Always-on Hosting", "Multiplayer Editing", "GitHub Sync"],
  };
}

function generateRailwayGuide(analysis: ProjectAnalysis): DeploymentGuide {
  const steps = [
    "Sign up or log in to Railway (railway.app)",
    "Click 'New Project' → 'Deploy from GitHub repo'",
    "Select your repository",
    "Railway auto-detects your framework and builds",
  ];

  if (analysis.hasDatabase) {
    steps.push("Add a PostgreSQL database: New → Database → PostgreSQL");
    steps.push("Railway auto-injects DATABASE_URL");
  }

  if (analysis.envVars.length > 0) {
    steps.push(`Add variables in the Variables tab: ${analysis.envVars.join(", ")}`);
  }

  steps.push("Your app deploys automatically!");

  return {
    platform: "Railway",
    icon: "🚂",
    steps,
    configFiles: [],
    commands: ["npm i -g @railway/cli", "railway login", "railway up"],
    url: "https://railway.app",
    features: ["PostgreSQL Included", "Redis Available", "Auto Deploys", "Usage-based Pricing"],
  };
}

export function generatePackageJson(
  projectName: string,
  type: ProjectAnalysis["type"],
  dependencies: Record<string, string> = {}
): string {
  const baseDeps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};
  let scripts: Record<string, string> = {};

  switch (type) {
    case "react":
      Object.assign(baseDeps, {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      });
      Object.assign(devDeps, {
        vite: "^5.0.0",
        "@vitejs/plugin-react": "^4.0.0",
      });
      scripts = {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      };
      break;
    case "express":
      Object.assign(baseDeps, {
        express: "^4.18.2",
      });
      scripts = {
        start: "node server.js",
        dev: "node --watch server.js",
      };
      break;
    case "nextjs":
      Object.assign(baseDeps, {
        next: "^14.0.0",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      });
      scripts = {
        dev: "next dev",
        build: "next build",
        start: "next start",
      };
      break;
    default:
      scripts = {
        start: "npx serve .",
      };
  }

  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      type: "module",
      scripts,
      dependencies: { ...baseDeps, ...dependencies },
      devDependencies: devDeps,
    },
    null,
    2
  );
}
