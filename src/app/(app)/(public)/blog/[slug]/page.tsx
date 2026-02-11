import { getPostSSR } from "@/services/blog";
import { format } from "date-fns";
import Link from "next/link";
import { User, ArrowLeft, Clock } from "lucide-react";
import { MarkdownReader } from "@/components/ui/markdown-reader";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

// Force dynamic rendering to ensure env vars are available at runtime
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostSSR(slug);
  if (!post) return { title: "Post Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://butterfast.com';

  return {
    title: `${post.title} | Butterfast`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | Butterfast`,
      description: post.excerpt || post.title,
      url: `${baseUrl}/blog/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author?.name || 'Butterfast'],
      images: post.featuredImg ? [post.featuredImg] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostSSR(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background pt-20">
        <Navbar />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6 text-muted-foreground">Post not found.</p>
        <Link href="/blog" className="text-base underline underline-offset-4 hover:text-foreground transition-colors">
            Back to stories
        </Link>
      </div>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://butterfast.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://butterfast.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://butterfast.com/blog/${slug}`
      }
    ]
  };

  return (
    <article className="min-h-screen pt-10 relative">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Featured Image - Full Width Hero */}
      {post.featuredImg && (
        <div className="w-full">
          <div className="max-w-6xl mx-auto px-4">
            <img 
              src={post.featuredImg} 
              alt={post.title} 
              className="w-full h-auto max-h-[600px] object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="max-w-[900px] mx-auto px-6 py-12">
        {/* Breadcrumb Nav */}
        <div className="flex items-center gap-2 mb-8 text-sm font-medium">
             <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Blog
             </Link>
             <span className="text-muted-foreground/30">/</span>
             <span className="text-foreground truncate max-w-[200px] sm:max-w-[400px]">{post.title}</span>
        </div>

        {/* Category */}
        {post.category && (
          <div className="mb-4">
            <Badge className="bg-primary/10 text-primary border-none rounded-md px-3 py-1 text-xs font-semibold">
              {post.category.name}
            </Badge>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-[1.15] tracking-tight mb-6">
          {post.title}
        </h1>

        {/* Subtitle/Excerpt */}
        {post.excerpt && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Author Section */}
        <div className="flex items-center gap-4 pb-8 border-b border-border mb-10">
          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-lg">
                {post.author.name?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {post.author.name}
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {Math.ceil((post.content?.body?.length || post.content?.length || 0) / 1000)} min read
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-invert max-w-none 
          prose-p:text-foreground/90 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
          prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
          prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
          prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground
          prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg
          prose-ul:my-6 prose-ol:my-6
          prose-li:text-lg prose-li:leading-relaxed prose-li:text-foreground/90
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground
          prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-6
        ">
          <MarkdownReader content={post.content.body || post.content} />
        </div>

        {/* Tags */}
        {post.metaKeywords && (
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Topics</p>
            <div className="flex flex-wrap gap-2">
              {post.metaKeywords.split(',').map((kw: string, i: number) => (
                <Badge key={i} className="bg-muted hover:bg-muted/80 text-foreground border border-border rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
                  {kw.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Footer */}
        <div className="mt-12 p-8 bg-card rounded-2xl border border-border">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
              {post.author.image ? (
                <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-xl">
                  {post.author.name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-foreground mb-1">
                {post.author.name}
              </p>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Sharing insights on AI, productivity, and modern storytelling. Thanks for reading!
              </p>
            </div>
          </div>
        </div>

        {/* Back to Blog Link */}
        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold">
            <ArrowLeft size={18} />
            Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
