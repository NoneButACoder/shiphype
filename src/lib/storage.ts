import fs from "fs";
import path from "path";
import { GeneratedPayload, PRSummary } from "@/types";

export type BrandAccentColor = "indigo" | "cyan" | "emerald" | "amber" | "rose" | "purple";
export type BannerPattern = "dots" | "gradient" | "grid" | "minimal";

export interface ProjectRecord {
  id: string;
  name: string;
  slug: string;
  repo: string;
  createdAt: string;
  // Custom Branding
  tagline?: string;
  description?: string;
  logoUrl?: string; // Image URL or single Emoji icon
  accentColor?: BrandAccentColor;
  websiteUrl?: string;
  twitterHandle?: string;
  customDomain?: string;
  bannerPattern?: BannerPattern;
}

export interface ReleaseRecord {
  id: string;
  projectSlug: string;
  versionTag: string;
  title: string;
  status?: "draft" | "published";
  changelog: {
    features: string[];
    improvements: string[];
    fixes: string[];
  };
  cardData: {
    badge: string;
    title: string;
    subtitle: string;
    highlights: string[];
    template?: string;
    themeColor?: string;
    watermark?: boolean;
  };
  sourcePr?: {
    owner: string;
    repo: string;
    pullNumber: number;
    url: string;
  };
  publishedAt: string;
}

export interface SubscriberRecord {
  id: string;
  projectSlug: string;
  email: string;
  subscribedAt: string;
}

const SEED_DIR = path.join(process.cwd(), "data");
export const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "shiphype-data")
    : SEED_DIR);

export const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
export const RELEASES_FILE = path.join(DATA_DIR, "releases.json");
export const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

export function getDataFilePath(filename: string): string {
  ensureDataFiles();
  return path.join(DATA_DIR, filename);
}

export function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }

  // If running in /tmp or custom storage dir, copy seed files from project data/
  if (DATA_DIR !== SEED_DIR && fs.existsSync(SEED_DIR)) {
    const seedFiles = [
      "projects.json",
      "releases.json",
      "subscribers.json",
      "webhook_deliveries.json",
      "tweet_publications.json",
      "broadcast_logs.json",
    ];
    for (const file of seedFiles) {
      const src = path.join(SEED_DIR, file);
      const dest = path.join(/*turbopackIgnore: true*/ DATA_DIR, file);
      if (fs.existsSync(src) && !fs.existsSync(/*turbopackIgnore: true*/ dest)) {
        try {
          fs.copyFileSync(src, dest);
        } catch {
          // ignore
        }
      }
    }
  }

  if (!fs.existsSync(PROJECTS_FILE)) {
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([]), "utf8");
    } catch {
      // ignore
    }
  }
  if (!fs.existsSync(RELEASES_FILE)) {
    try {
      fs.writeFileSync(RELEASES_FILE, JSON.stringify([]), "utf8");
    } catch {
      // ignore
    }
  }
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    try {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([]), "utf8");
    } catch {
      // ignore
    }
  }
}

export function getAllProjects(): ProjectRecord[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getProjectBySlug(slug: string): ProjectRecord | null {
  const projects = getAllProjects();
  return projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export function saveProject(project: Omit<ProjectRecord, "id" | "createdAt">): ProjectRecord {
  ensureDataFiles();
  const projects = getAllProjects();
  const existing = projects.find((p) => p.slug.toLowerCase() === project.slug.toLowerCase());

  if (existing) {
    existing.name = project.name;
    existing.repo = project.repo;
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
    return existing;
  }

  const newProject: ProjectRecord = {
    id: "proj_" + Math.random().toString(36).substring(2, 9),
    name: project.name,
    slug: project.slug.toLowerCase(),
    repo: project.repo,
    createdAt: new Date().toISOString(),
  };

  projects.push(newProject);
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
  return newProject;
}

export function updateProject(
  slug: string,
  updates: Partial<Omit<ProjectRecord, "id" | "slug" | "createdAt">>
): ProjectRecord | null {
  ensureDataFiles();
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.slug.toLowerCase() === slug.toLowerCase());
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
  };

  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
  return projects[index];
}

export function getAllReleases(projectSlug?: string, includeDrafts: boolean = false): ReleaseRecord[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(RELEASES_FILE, "utf8");
    const releases: ReleaseRecord[] = JSON.parse(raw);
    let filtered = releases;
    if (projectSlug) {
      filtered = filtered.filter((r) => r.projectSlug.toLowerCase() === projectSlug.toLowerCase());
    }
    if (!includeDrafts) {
      filtered = filtered.filter((r) => r.status !== "draft");
    }
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch {
    return [];
  }
}

export function getReleaseById(releaseId: string): ReleaseRecord | null {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(RELEASES_FILE, "utf8");
    const releases: ReleaseRecord[] = JSON.parse(raw);
    return releases.find((r) => r.id === releaseId) || null;
  } catch {
    return null;
  }
}

export function saveRelease(releaseData: Omit<ReleaseRecord, "id" | "publishedAt">): ReleaseRecord {
  ensureDataFiles();
  const raw = fs.readFileSync(RELEASES_FILE, "utf8");
  const releases: ReleaseRecord[] = JSON.parse(raw);

  const newRelease: ReleaseRecord = {
    id: "rel_" + Math.random().toString(36).substring(2, 9),
    ...releaseData,
    status: releaseData.status || "published",
    projectSlug: releaseData.projectSlug.toLowerCase(),
    publishedAt: new Date().toISOString(),
  };

  releases.unshift(newRelease);
  fs.writeFileSync(RELEASES_FILE, JSON.stringify(releases, null, 2), "utf8");
  return newRelease;
}

export function deleteRelease(releaseId: string): boolean {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(RELEASES_FILE, "utf8");
    const releases: ReleaseRecord[] = JSON.parse(raw);
    const filtered = releases.filter((r) => r.id !== releaseId);
    if (filtered.length !== releases.length) {
      fs.writeFileSync(RELEASES_FILE, JSON.stringify(filtered, null, 2), "utf8");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function updateReleaseStatus(releaseId: string, status: "draft" | "published"): boolean {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(RELEASES_FILE, "utf8");
    const releases: ReleaseRecord[] = JSON.parse(raw);
    const target = releases.find((r) => r.id === releaseId);
    if (target) {
      target.status = status;
      fs.writeFileSync(RELEASES_FILE, JSON.stringify(releases, null, 2), "utf8");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function deleteProject(slug: string): boolean {
  ensureDataFiles();
  try {
    const rawProjects = fs.readFileSync(PROJECTS_FILE, "utf8");
    const projects: ProjectRecord[] = JSON.parse(rawProjects);
    const filteredProjects = projects.filter((p) => p.slug.toLowerCase() !== slug.toLowerCase());
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filteredProjects, null, 2), "utf8");

    const rawReleases = fs.readFileSync(RELEASES_FILE, "utf8");
    const releases: ReleaseRecord[] = JSON.parse(rawReleases);
    const filteredReleases = releases.filter((r) => r.projectSlug.toLowerCase() !== slug.toLowerCase());
    fs.writeFileSync(RELEASES_FILE, JSON.stringify(filteredReleases, null, 2), "utf8");

    return true;
  } catch {
    return false;
  }
}

export function getAllSubscribers(projectSlug?: string): SubscriberRecord[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, "utf8");
    const subscribers: SubscriberRecord[] = JSON.parse(raw);
    if (projectSlug) {
      return subscribers.filter((s) => s.projectSlug.toLowerCase() === projectSlug.toLowerCase());
    }
    return subscribers;
  } catch {
    return [];
  }
}

export function saveSubscriber(
  projectSlug: string,
  email: string
): { success: boolean; isNew: boolean; message?: string } {
  ensureDataFiles();
  const cleanEmail = email.trim().toLowerCase();
  const cleanSlug = projectSlug.trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, isNew: false, message: "Invalid email format" };
  }

  const subscribers = getAllSubscribers();
  const existing = subscribers.find(
    (s) => s.projectSlug.toLowerCase() === cleanSlug && s.email.toLowerCase() === cleanEmail
  );

  if (existing) {
    return { success: true, isNew: false, message: "Already subscribed" };
  }

  const newSub: SubscriberRecord = {
    id: "sub_" + Math.random().toString(36).substring(2, 9),
    projectSlug: cleanSlug,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
  };

  subscribers.unshift(newSub);
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf8");
  return { success: true, isNew: true, message: "Subscribed successfully" };
}

export function getSubscribersCount(projectSlug: string): number {
  return getAllSubscribers(projectSlug).length;
}
