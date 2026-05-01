import { ExternalLink, Eye, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

const profileLinks = [
  { label: "Portfolio", url: "https://tapasvimadhak.works" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/tapasvi-madhak-159945248/" },
  { label: "GitHub", url: "https://github.com/TapasviMadhak/" },
  { label: "TryHackMe", url: "https://tryhackme.com/p/tapasvimadhak" },
]

const VISIT_API = "/.netlify/functions/visit-counter"

const LinkItem = ({ label, url, inverse = false }) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer"
    className={
      inverse
        ? "group flex items-center justify-between gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        : "group flex items-center justify-between gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:border-teal-400"
    }
  >
    <span className="truncate">{label}</span>
    <ExternalLink
      size={14}
      className={inverse ? "text-lime-200/70 group-hover:text-lime-200" : "text-stone-400 group-hover:text-teal-600"}
    />
  </a>
)

function SiteVisitsCard() {
  const [visits, setVisits] = useState(null)
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    let isMounted = true

    const fetchVisits = async () => {
      try {
        const response = await fetch(VISIT_API, {
          credentials: "include",
          cache: "no-store",
        })
        if (!response.ok) throw new Error("Visit counter request failed")

        const data = await response.json()
        const count = Number(data?.count)
        if (!isMounted) return

        setVisits(Number.isFinite(count) ? count : null)
        setStatus("ready")
      } catch {
        if (!isMounted) return
        setStatus("error")
      }
    }

    fetchVisits()

    return () => {
      isMounted = false
    }
  }, [])

  const displayValue = Number.isFinite(visits) ? visits : status === "loading" ? "..." : "--"

  return (
    <div className="page-panel rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Site Visits</p>
          <p className="mt-1 text-3xl font-extrabold text-neutral-950">{displayValue}</p>
          
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
          <Eye size={20} />
        </span>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <section className="space-y-5">
      <header className="page-panel rounded-lg p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="eyebrow">Profile</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950 md:text-5xl">About Me</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
              Security researcher focused on web security, recon, and clean reporting. This space collects public
              profiles, credentials, and learning milestones in one place.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-900 bg-neutral-950 p-5 text-white">
            <ShieldCheck className="text-lime-300" size={28} />
            <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-stone-300">
              Profile Links
            </p>
            <div className="mt-4 grid gap-2">
              {profileLinks.map((link) => (
                <LinkItem key={link.label} label={link.label} url={link.url} inverse />
              ))}
            </div>
          </div>
        </div>
      </header>
      <SiteVisitsCard />
    </section>
  )
}
