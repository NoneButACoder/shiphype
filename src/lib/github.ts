import { PRSummary } from "@/types";

export function parseGitHubPRUrl(url: string): { owner: string; repo: string; pullNumber: number } | null {
  try {
    const trimmed = url.trim();
    // Support formats:
    // https://github.com/owner/repo/pull/123
    // github.com/owner/repo/pull/123
    // owner/repo#123
    const fullUrlMatch = trimmed.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
    if (fullUrlMatch) {
      return {
        owner: fullUrlMatch[1],
        repo: fullUrlMatch[2],
        pullNumber: parseInt(fullUrlMatch[3], 10),
      };
    }

    const shortMatch = trimmed.match(/^([^/]+)\/([^#]+)#(\d+)$/);
    if (shortMatch) {
      return {
        owner: shortMatch[1],
        repo: shortMatch[2],
        pullNumber: parseInt(shortMatch[3], 10),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchGitHubPR(owner: string, repo: string, pullNumber: number): Promise<PRSummary> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ShipHype-App",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 1. Fetch PR details
  const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!prRes.ok) {
    if (prRes.status === 404) {
      throw new Error(`Pull Request not found: ${owner}/${repo}#${pullNumber}. Please check if the repository is public.`);
    }
    if (prRes.status === 403) {
      throw new Error(`GitHub API rate limit exceeded. Please configure GITHUB_TOKEN in .env.local.`);
    }
    throw new Error(`Failed to fetch PR from GitHub (${prRes.status}): ${prRes.statusText}`);
  }

  const prData = await prRes.json();

  // 2. Fetch changed files list (up to 30 files for summary)
  let changedFiles: string[] = [];
  try {
    const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=30`, {
      headers,
      next: { revalidate: 60 },
    });
    if (filesRes.ok) {
      const filesData = await filesRes.json();
      changedFiles = (filesData as Array<{ filename: string }>).map((f) => f.filename);
    }
  } catch {
    // Non-fatal if files fetch fails
  }

  return {
    owner,
    repo,
    pullNumber,
    title: prData.title || "",
    body: prData.body || "",
    author: prData.user?.login || "anonymous",
    labels: Array.isArray(prData.labels) ? prData.labels.map((l: { name: string }) => l.name) : [],
    changedFiles,
    htmlUrl: prData.html_url || `https://github.com/${owner}/${repo}/pull/${pullNumber}`,
  };
}
