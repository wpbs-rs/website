import { MDXProvider } from "@mdx-js/react";
import { Calendar, UserPen } from "lucide-react";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import { useLoaderData } from "react-router";

import { Separator } from "~/components/ui/separator";
import formatDate from "~/lib/format-date";
import { getPostBySlug } from "~/lib/mdx";

import type { Route } from "./+types/$slug";

export async function loader({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    throw new Response("Post not found", { status: 404 });
  }
  if (!post.code) {
    throw new Response("Post content is missing", { status: 500 });
  }

  return {
    code: post.code,
    frontmatter: post.frontmatter,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `wpbs | ${loaderData.frontmatter.title}` },
    { name: "description", content: loaderData.frontmatter.description },
    { property: "og:title", content: `wpbs | ${loaderData.frontmatter.title}` },
    { property: "og:description", content: loaderData.frontmatter.description },
    { property: "og:type", content: "article" },
  ];
}

export default function Post() {
  const { code, frontmatter } = useLoaderData<typeof loader>();
  const Component = useMemo(() => getMDXComponent(code), [code]);

  return (
    <MDXProvider>
      <main className="py-8">
        <div className="container mx-auto w-full">
          <article className="prose dark:prose-invert max-w-none px-6">
            <h1 className="mb-0">{frontmatter.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <time>{formatDate.format(frontmatter.published)}</time>
              </div>
              <div className="flex items-center gap-1">
                <UserPen className="size-4" />
                <span>{frontmatter.author}</span>
              </div>
            </div>
            <Separator className="mt-8" />
            <Component />
          </article>
        </div>
      </main>
    </MDXProvider>
  );
}
