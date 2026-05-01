import {
  ArrowUpRight,
  Bug,
  DollarSign,
  ExternalLink,
  Filter,
  Search,
  Shield,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"
import { bugReportsSource, disclosedReports, SEVERITY_META } from "../data/bugReports"

const ALL_SEVERITIES = ["critical", "high", "medium", "low"]

const fmt = (n) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`

export default function BugReportsPage() {
  const [query, setQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("bounty") // bounty | date

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return disclosedReports
      .filter((r) => {
        const hay = `${r.vulnerability} ${r.company} ${r.tags.join(" ")}`.toLowerCase()
        return (
          (!q || hay.includes(q)) &&
          (severityFilter === "all" || r.severity === severityFilter)
        )
      })
      .sort((a, b) =>
        sortBy === "bounty" ? b.bounty - a.bounty : new Date(b.publishedAt) - new Date(a.publishedAt),
      )
  }, [query, severityFilter, sortBy])

  const totalBounty = disclosedReports.reduce((s, r) => s + r.bounty, 0)
  const topBounty = Math.max(...disclosedReports.map((r) => r.bounty))

  return (
    <section className="space-y-5">
      {/* Header */}
      <header className="page-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Disclosed Reports</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">Community Bug Reports</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Community-sourced, publicly disclosed bug bounty reports. Each card shows the vulnerability type,
              company, and bounty paid.
            </p>
          </div>
          <a
            href={bugReportsSource.url}
            target="_blank"
            rel="noreferrer"
            className="action-button border border-teal-300 bg-teal-50 text-teal-800 hover:border-teal-500 hover:bg-white"
          >
            HackerOne Hacktivity
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Stat label="Total Reports" value={disclosedReports.length} icon={<Bug size={16} />} />
          <Stat label="Visible" value={filtered.length} icon={<Filter size={16} />} />
          <Stat label="Total Bounty" value={`$${(totalBounty / 1000).toFixed(0)}k+`} icon={<DollarSign size={16} />} />
          <Stat label="Top Bounty" value={fmt(topBounty)} icon={<Shield size={16} />} />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          {/* Search */}
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3">
            <Search size={15} className="shrink-0 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vulnerability, company, tag…"
              className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="shrink-0 text-stone-400 hover:text-stone-700">
                <X size={13} />
              </button>
            )}
          </label>

          {/* Severity filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSeverityFilter("all")}
              className={[
                "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                severityFilter === "all"
                  ? "border-neutral-900 bg-neutral-950 text-white"
                  : "border-stone-300 bg-white text-stone-600 hover:border-stone-400",
              ].join(" ")}
            >
              All
            </button>
            {ALL_SEVERITIES.map((sev) => {
              const m = SEVERITY_META[sev]
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev === severityFilter ? "all" : sev)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                    severityFilter === sev
                      ? `${m.bg} ${m.border} ${m.color}`
                      : "border-stone-300 bg-white text-stone-600 hover:border-stone-400",
                  ].join(" ")}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 outline-none ring-teal-500 transition focus:ring-2"
          >
            <option value="bounty">Sort: Bounty ↓</option>
            <option value="date">Sort: Newest first</option>
          </select>
        </div>
      </header>

      {/* Report grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="page-panel rounded-lg p-10 text-center">
          <Search size={36} className="mx-auto mb-3 text-stone-400" />
          <p className="text-sm font-semibold text-stone-500">No reports match your filters.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setSeverityFilter("all") }}
            className="mt-2 text-xs text-teal-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}

function ReportCard({ report }) {
  const sev = SEVERITY_META[report.severity]
  const date = new Date(report.publishedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })

  return (
    <a
      href={report.url}
      target="_blank"
      rel="noreferrer"
      className="group page-panel flex flex-col rounded-lg p-5 transition hover:-translate-y-0.5 hover:border-teal-400"
    >
      {/* Top row: severity + platform */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sev.bg} ${sev.border} ${sev.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
          {sev.label}
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-stone-400">
          {report.platform}
        </span>
      </div>

      {/* Vulnerability */}
      <h3 className="mt-3 text-base font-extrabold leading-snug text-neutral-950 group-hover:text-teal-700 transition">
        {report.vulnerability}
      </h3>

      {/* Company */}
      <p className="mt-1 text-sm font-semibold text-stone-500">{report.company}</p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {report.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-stone-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom row: bounty + date + arrow */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-teal-600" />
          <span className="text-lg font-extrabold text-neutral-950">{fmt(report.bounty)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <span>{date}</span>
          <ArrowUpRight
            size={15}
            className="text-teal-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </a>
  )
}

function Stat({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-lime-300">
        {icon}
      </span>
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-stone-500">{label}</p>
        <p className="mt-0.5 text-xl font-extrabold text-neutral-950">{value}</p>
      </div>
    </div>
  )
}
