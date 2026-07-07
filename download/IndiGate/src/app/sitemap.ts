import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://indigate.work";

  const jobs = await db.job
    .findMany({
      where: { isActive: true },
      select: { id: true, postedAt: true },
      orderBy: { postedAt: "desc" },
    })
    .catch(() => []);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${APP_URL}/?view=jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/?view=for-companies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/?view=about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${APP_URL}/?view=job-detail&jobId=${job.id}`,
    lastModified: job.postedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...jobPages];
}
