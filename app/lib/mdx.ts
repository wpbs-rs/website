import fs from "fs";
import path from "path";

import { bundleMDX } from "mdx-bundler";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import * as z from "zod";

const frontMatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  published: z.coerce.date(),
  author: z.string(),
  heroImage: z.string().optional(),
  heroImageAlt: z.string().optional(),
});

export type FrontMatter = z.infer<typeof frontMatterSchema>;

function getComponentFiles(): Record<string, string> {
  const componentsPath = path.join(process.cwd(), "app/components");

  function readFilesRecursively(dir: string): Record<string, string> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.reduce<Record<string, string>>((acc, entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        Object.assign(acc, readFilesRecursively(fullPath));
      } else if (entry.isFile()) {
        const relativePath = path.relative(componentsPath, fullPath);
        const normalizedPath = relativePath.replaceAll("\\", "/");
        const content = fs.readFileSync(fullPath, "utf8");
        acc["../app/components/" + normalizedPath] = content;
      }
      return acc;
    }, {});
  }

  try {
    return readFilesRecursively(componentsPath);
  } catch (e) {
    console.warn("Components directory not found, continuing without components", e);
  }
  return {};
}

// Run once and cache
const componentFiles = getComponentFiles();

function resolvePostsPath(slug: string): string {
  const postPath = path.join(process.cwd(), "posts", `${slug}.mdx`);
  if (fs.existsSync(postPath)) return postPath;
  throw new Error(`Post not found for slug: ${slug}`);
}

export async function getPostBySlug(slug: string) {
  try {
    const postPath = resolvePostsPath(slug);
    const source = fs.readFileSync(postPath, "utf8");
    const { code, frontmatter } = await bundleMDX({
      source,
      files: componentFiles,
      mdxOptions(options) {
        options.remarkPlugins = [remarkFrontmatter, remarkMdxFrontmatter];
        options.rehypePlugins = [rehypePrettyCode];
        return options;
      },
    });
    const parsed = frontMatterSchema.safeParse(frontmatter);

    if (!parsed.success) {
      console.error(`Invalid frontmatter in "${slug}":`, parsed.error.message);
      return null;
    }
    return { code, frontmatter: parsed.data };
  } catch (err) {
    console.error("Error processing MDX:", err);
    return null;
  }
}

export function getPostSlugs(): string[] {
  const postsDir = path.join(process.cwd(), "posts");
  try {
    const files = fs.readdirSync(postsDir);
    return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
  } catch (err) {
    console.error("Error reading posts directory:", err);
    return [];
  }
}

export async function getPosts(): Promise<{ slug: string; frontmatter: FrontMatter }[]> {
  const slugs = getPostSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = await getPostBySlug(slug);
      return post ? [{ slug, frontmatter: post.frontmatter }] : [];
    }),
  );
  return posts
    .flat()
    .sort((a, b) => b.frontmatter.published.getTime() - a.frontmatter.published.getTime());
}
