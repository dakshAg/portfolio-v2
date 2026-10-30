import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

type Entry = { path: string; lastmod?: Date; priority: number };

export const GET: APIRoute = async ({ site }) => {
	const posts = (await getCollection("blog")).filter((post) => !post.data.draft);

	const entries: Entry[] = [
		{ path: "/", priority: 1.0 },
		{ path: "/tech-stack/", priority: 0.7 },
		{ path: "/gallery/", priority: 0.6 },
		{ path: "/blog/", priority: 0.6 },
		...posts.map((post) => ({
			path: `/blog/${post.slug}/`,
			lastmod: post.data.updatedDate ?? post.data.pubDate,
			priority: 0.5,
		})),
	];

	const urls = entries
		.map(({ path, lastmod, priority }) =>
			[
				"  <url>",
				`    <loc>${new URL(path, site).href}</loc>`,
				lastmod ? `    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : "",
				`    <priority>${priority.toFixed(1)}</priority>`,
				"  </url>",
			]
				.filter(Boolean)
				.join("\n"),
		)
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
