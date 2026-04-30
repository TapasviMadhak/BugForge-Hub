import { CalendarDays, ExternalLink, Newspaper, Search, Tag } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { blogPosts } from "../data/blogPosts"

const previewCache = new Map()
const IMAGE_LOAD_TIMEOUT_MS = 2500
const TWITTER_WIDGET_SRC = "https://platform.twitter.com/widgets.js"
const REDDIT_WIDGET_SRC = "https://embed.reddit.com/widgets.js"

const isTweet = (post) =>
  post.type === "tweet" ||
  post.source?.toLowerCase() === "tweet" ||
  post.source?.toLowerCase() === "x" ||
  post.source?.toLowerCase() === "twitter" ||
  /(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/i.test(post.url)

const isRedditPost = (post) =>
  post.type === "reddit" ||
  post.source?.toLowerCase() === "reddit" ||
  /reddit\.com\/r\/[^/]+\/comments\/[^/]+/i.test(post.url)

const getPostKind = (post) => {
  if (isTweet(post)) return "tweet"
  if (isRedditPost(post)) return "reddit"
  return "article"
}

const getTweetEmbedUrl = (url) => url.replace(/^https?:\/\/(?:www\.)?x\.com\//i, "https://twitter.com/")

const getHostname = (url) => new URL(url).hostname.replace(/^www\./, "")

const getMediumResizeFillSize = (url) => {
  const match = url.match(/resize:fill:(\d+):(\d+)/i)
  if (!match) return null

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  }
}

const isLikelyArticleCover = (imageUrl, pageUrl) => {
  if (!imageUrl || imageUrl === pageUrl) return false
  if (!/^https?:\/\//i.test(imageUrl)) return false

  const lowerUrl = imageUrl.toLowerCase()
  if (/avatar|profile|author|logo|icon|publication|resize:fill:32|resize:fill:64|resize:fill:76|resize:fill:96|resize:fill:128/.test(lowerUrl)) {
    return false
  }

  const fillSize = getMediumResizeFillSize(lowerUrl)
  if (fillSize && Math.max(fillSize.width, fillSize.height) < 300) return false

  return true
}

const findMarkdownValue = (markdown, label) => {
  const match = markdown.match(new RegExp(`^${label}:\\\\s*(.+)$`, "im"))
  return match?.[1]?.trim()
}

const findArticleImage = (markdown, pageUrl) => {
  const images = Array.from(markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)).map((match) => match[1])
  return images.find((image) => isLikelyArticleCover(image, pageUrl))
}

const fetchMicrolinkPreview = async (url, signal) => {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true`
  const response = await fetch(endpoint, { signal })
  if (!response.ok) return null

  const payload = await response.json()
  const data = payload?.data
  if (!data) return null

  return {
    title: data.title,
    description: data.description,
    cover: [data.image?.url, data.screenshot?.url].find((image) => isLikelyArticleCover(image, url)),
    publisher: data.publisher,
  }
}

const fetchJinaPreview = async (url, signal) => {
  const endpoint = `https://r.jina.ai/http://${url}`
  const response = await fetch(endpoint, { signal })
  if (!response.ok) return null

  const markdown = await response.text()
  const title = findMarkdownValue(markdown, "Title")
  const cover = findArticleImage(markdown, url)

  return {
    title,
    cover,
    description: markdown
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 120 && !line.startsWith("!") && !line.startsWith("["))
      ?.slice(0, 240),
  }
}

const fetchArticlePreview = async (post, signal) => {
  const microlinkPreview = await fetchMicrolinkPreview(post.url, signal).catch(() => null)
  if (microlinkPreview?.cover) return microlinkPreview

  const jinaPreview = await fetchJinaPreview(post.url, signal).catch(() => null)
  return {
    ...microlinkPreview,
    ...jinaPreview,
    cover: microlinkPreview?.cover || jinaPreview?.cover,
  }
}

const loadScript = (src, onReady) => {
  const existingScript = document.querySelector(`script[src="${src}"]`)
  if (existingScript) {
    onReady?.()
    return
  }

  const script = document.createElement("script")
  script.src = src
  script.async = true
  script.charset = "utf-8"
  script.onload = () => onReady?.()
  document.body.appendChild(script)
}

const formatDate = (date) => {
  if (!date) return "Undated"

  try {
    return new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  } catch {
    return date
  }
}

export default function BlogsPage() {
  const [query, setQuery] = useState("")

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return blogPosts

    return blogPosts.filter((post) => {
      const haystack = [
        post.title,
        post.source,
        post.description,
        post.url,
        ...(post.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [query])

  useEffect(() => {
    if (!posts.some(isTweet)) return

    loadScript(TWITTER_WIDGET_SRC, () => window.twttr?.widgets?.load())
  }, [posts])

  useEffect(() => {
    if (!posts.some(isRedditPost)) return

    loadScript(REDDIT_WIDGET_SRC)
  }, [posts])

  return (
    <section className="space-y-5">
      <header className="page-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Daily Insights</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">Blogs and Posts</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Curated articles, notes, and social posts for sharing useful security learning with others.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900">
            <Newspaper size={16} />
            {blogPosts.length} posts
          </div>
        </div>

        <label className="mt-5 flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3">
          <Search size={16} className="text-stone-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts by title, tag, source, or description..."
            className="w-full bg-transparent text-sm text-stone-800 outline-none"
          />
        </label>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="page-panel rounded-lg p-8 text-center text-sm text-stone-500 xl:col-span-2">
            No posts match your search.
          </div>
        )}
      </div>
    </section>
  )
}

function PostCard({ post }) {
  const kind = getPostKind(post)

  if (kind === "tweet") return <TweetPost post={post} />
  if (kind === "reddit") return <RedditPost post={post} />
  return <ArticlePost post={post} />
}

function ArticlePost({ post }) {
  const [preview, setPreview] = useState(() => previewCache.get(post.url) || null)

  useEffect(() => {
    if (post.title && post.cover) return
    if (previewCache.has(post.url)) return

    const controller = new AbortController()
    fetchArticlePreview(post, controller.signal)
      .then((nextPreview) => {
        if (!nextPreview) return
        previewCache.set(post.url, nextPreview)
        setPreview(nextPreview)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [post])

  const title = post.title || preview?.title || post.url
  const description = post.description || preview?.description || "Open the source link to read the full post."
  const cover = post.cover || preview?.cover
  const source = post.source || preview?.publisher || getHostname(post.url)

  return (
    <article className="page-panel overflow-hidden rounded-lg">
      <ArticleCover key={cover || "fallback"} cover={cover} source={source} title={title} url={post.url} />

      <div className="p-5">
        <PostMeta post={post} source={source} />
        <h2 className="mt-3 text-xl font-extrabold leading-snug text-neutral-950">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
        <PostTags tags={post.tags} />
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="action-button mt-4 border border-stone-300 bg-white text-stone-700 hover:border-teal-500 hover:text-teal-700"
        >
          Read post
          <ExternalLink size={14} />
        </a>
      </div>
    </article>
  )
}

function ArticleCover({ cover, source, title, url }) {
  const [imageState, setImageState] = useState(cover ? "loading" : "fallback")
  const fallbackTimerRef = useRef(null)
  const imageRef = useRef(null)

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }

  useEffect(() => {
    clearFallbackTimer()

    if (!cover) return undefined

    fallbackTimerRef.current = setTimeout(() => {
      if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
        setImageState("loaded")
        return
      }

      setImageState("fallback")
    }, IMAGE_LOAD_TIMEOUT_MS)

    return clearFallbackTimer
  }, [cover])

  if (!cover || imageState === "fallback") {
    return <ArticleCoverFallback source={source} />
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title}`} className="relative block h-52">
      {imageState === "loading" ? (
        <ArticleCoverFallback source={source} compact />
      ) : null}
      <img
        ref={imageRef}
        src={cover}
        alt=""
        className={[
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
          imageState === "loaded" ? "opacity-100" : "opacity-0",
        ].join(" ")}
        loading="lazy"
        onLoad={() => {
          clearFallbackTimer()
          setImageState("loaded")
        }}
        onError={() => {
          clearFallbackTimer()
          setImageState("fallback")
        }}
      />
    </a>
  )
}

function ArticleCoverFallback({ source, compact = false }) {
  return (
    <div
      className={[
        "flex items-center justify-center bg-neutral-950 px-6 text-center text-stone-100",
        compact ? "absolute inset-0" : "h-36",
      ].join(" ")}
    >
      <p className="text-lg font-extrabold">{source}</p>
    </div>
  )
}

function TweetPost({ post }) {
  const source = post.source?.toLowerCase() === "tweet" ? "X / Twitter" : post.source || "X / Twitter"
  const embedUrl = getTweetEmbedUrl(post.url)

  return (
    <article className="page-panel rounded-lg p-5">
      <PostMeta post={post} source={source} />
      {post.description ? <p className="mt-3 text-sm leading-relaxed text-stone-600">{post.description}</p> : null}
      <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 p-3">
        <blockquote className="twitter-tweet" data-dnt="true" data-theme="light">
          <a href={embedUrl}>{post.title || embedUrl}</a>
        </blockquote>
      </div>
      <PostTags tags={post.tags} />
    </article>
  )
}

function RedditPost({ post }) {
  const source = post.source?.toLowerCase() === "reddit" ? "Reddit" : post.source || "Reddit"

  return (
    <article className="page-panel rounded-lg p-5">
      <PostMeta post={post} source={source} />
      {post.description ? <p className="mt-3 text-sm leading-relaxed text-stone-600">{post.description}</p> : null}
      <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 p-3">
        <blockquote className="reddit-embed-bq" data-embed-showtitle="true" data-embed-theme="light">
          <a href={post.url}>{post.title || post.url}</a>
        </blockquote>
      </div>
      <PostTags tags={post.tags} />
    </article>
  )
}

function PostMeta({ post, source }) {
  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
      <span>{source}</span>
      <span className="h-1 w-1 rounded-full bg-stone-300" />
      <span className="inline-flex items-center gap-1">
        <CalendarDays size={13} />
        {formatDate(post.publishedAt)}
      </span>
    </div>
  )
}

function PostTags({ tags = [] }) {
  if (!tags.length) return null

  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600"
        >
          <Tag size={12} />
          {tag}
        </span>
      ))}
    </div>
  )
}
