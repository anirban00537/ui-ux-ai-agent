import { getPostsSSR } from "@/services/blog";
import { format } from "date-fns";
import Link from "next/link";
import { User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

// Force dynamic rendering to ensure env vars are available at runtime
export const dynamic = 'force-dynamic';

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Butterfast",
  description: "Insights, tutorials, and updates from the Butterfast team on AI, design, and mobile app development.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Butterfast",
    description: "Insights, tutorials, and updates from the Butterfast team on AI, design, and mobile app development.",
    url: "/blog",
    type: "website",
  },
};

export default async function BlogPage() {
  const postsResponse = await getPostsSSR({ page: 1, perPage: 20 });
  const posts = postsResponse?.data?.posts || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-28 pb-20">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Header */}
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Insights on AI, productivity, and modern storytelling to help you create better docs.
            </p>
          </header>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <article key={post.id} className="group flex flex-col h-full border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-card">
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    {/* Thumbnail */}
                    {post.featuredImg ? (
                      <div className="shrink-0 w-full aspect-[16/10] bg-muted overflow-hidden relative">
                        <img 
                          src={post.featuredImg} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-card/90 backdrop-blur-md text-foreground border border-border shadow-sm capitalize font-bold px-3 py-1 hover:bg-card">
                              {post.category.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="shrink-0 w-full aspect-[16/10] bg-muted/50 flex items-center justify-center p-8 relative">
                         {post.category && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-card/90 backdrop-blur-md text-foreground border border-border shadow-sm capitalize font-bold px-3 py-1 hover:bg-card">
                              {post.category.name}
                            </Badge>
                          </div>
                        )}
                         <h3 className="text-2xl font-bold text-muted-foreground/50 tracking-tighter">BUTTERFAST</h3>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                         <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                         <span>•</span>
                         <span>{Math.ceil((post.content?.length || 0) / 1000)} min read</span>
                      </div>

                      <h2 className="text-xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-muted-foreground leading-relaxed text-sm mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto pt-6 border-t border-border flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-muted overflow-hidden ring-2 ring-background shadow-sm">
                            {post.author.image ? (
                              <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                <User size={14} />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            {post.author.name}
                          </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground text-lg">No posts published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
