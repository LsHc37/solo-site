import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://retrogigz.com";
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/solo`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/games`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/community`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
