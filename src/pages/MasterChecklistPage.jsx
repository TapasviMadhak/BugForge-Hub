import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Search,
  Wrench,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import checklistJson from "../data/masterChecklist.json"

const STORAGE_KEY = "bb-master-checklist-v2"

// Helper to identify rows uniquely
const getRowId = (row) => `${row.sr_no}-${row.category}-${row.activity}`

// Simple regex to detect if a tool/technique is a command
const isCommand = (text) => {
  const t = text.trim()
  return t.includes(" -") || /^(python|curl|nmap|perl|gobuster|assetfinder|httpx|cat )/i.test(t)
}

export default function MasterChecklistPage() {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  const [checkedRows, setCheckedRows] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))
    } catch {
      return new Set()
    }
  })

  const rows = checklistJson.checklist

  const categories = useMemo(() => {
    const unique = new Set(rows.map((item) => item.category || "Uncategorized"))
    return Array.from(unique)
  }, [rows])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const rowCategory = row.category || "Uncategorized"
      const toolsText = (row.tools_technique || []).join(" ")
      const haystack = `${row.sr_no} ${rowCategory} ${row.activity} ${toolsText} ${row.remarks || ""}`.toLowerCase()
      return (!q || haystack.includes(q)) && (categoryFilter === "all" || rowCategory === categoryFilter)
    })
  }, [categoryFilter, query, rows])

  const groupedRows = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        rows: filteredRows.filter((row) => (row.category || "Uncategorized") === category),
      }))
      .filter((group) => group.rows.length > 0)
  }, [categories, filteredRows])

  const completedTotal = rows.filter((row) => checkedRows.has(getRowId(row))).length

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedRows)))
  }, [checkedRows])

  const toggleChecked = (rowId) => {
    setCheckedRows((prev) => {
      const next = new Set(prev)
      next.has(rowId) ? next.delete(rowId) : next.add(rowId)
      return next
    })
  }

  const clearFilters = () => {
    setQuery("")
    setCategoryFilter("all")
  }

  return (
    <section className="space-y-5">
      {/* ── Header ── */}
      <header className="page-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Master Checklist</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">
              {checklistJson.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              A comprehensive checklist for your bug bounty workflows. Track your progress and save it locally.
            </p>
          </div>
          <div className="rounded-lg border border-teal-300 bg-teal-50 p-4 text-teal-950 text-center min-w-[140px]">
            <p className="text-3xl font-extrabold">{Math.round((completedTotal / rows.length) * 100)}%</p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">Completion</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Items" value={rows.length} icon={<ClipboardList size={16} />} />
          <Stat label="Completed" value={completedTotal} icon={<CheckCircle2 size={16} />} />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3">
            <Search size={15} className="shrink-0 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activities, tools, remarks…"
              className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="shrink-0 text-stone-400 hover:text-stone-700">
                <X size={13} />
              </button>
            )}
          </label>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 outline-none ring-teal-500 transition focus:ring-2 max-w-[200px] truncate"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      {/* ── Checklist Body ── */}
      <div className="space-y-6">
        {groupedRows.length > 0 ? (
          groupedRows.map((group) => {
            const groupCompleted = group.rows.filter(r => checkedRows.has(getRowId(r))).length
            return (
              <section key={group.category} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between gap-3 border-b border-stone-300 pb-2">
                  <h2 className="text-xl font-extrabold text-neutral-950">{group.category}</h2>
                  <span className="font-mono text-xs font-semibold text-stone-500">
                    {groupCompleted} / {group.rows.length} completed
                  </span>
                </div>

                {/* Items */}
                <div className="grid gap-3">
                  {group.rows.map((row) => {
                    const rowId = getRowId(row)
                    const isChecked = checkedRows.has(rowId)
                    const tools = (row.tools_technique || []).filter(Boolean)

                    return (
                      <article
                        key={rowId}
                        className={[
                          "page-panel rounded-lg p-4 transition-colors",
                          isChecked ? "opacity-60 bg-stone-50/50" : ""
                        ].join(" ")}
                      >
                        <label className="flex cursor-pointer items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleChecked(rowId)}
                            className="mt-1 h-5 w-5 shrink-0 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 mb-1">
                              <span className="rounded bg-stone-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-600">
                                #{row.sr_no}
                              </span>
                            </span>
                            <p className={[
                              "text-sm font-semibold leading-relaxed text-neutral-950",
                              isChecked ? "line-through text-stone-500" : ""
                            ].join(" ")}>
                              {row.activity}
                            </p>

                            {/* Details: Tools & Remarks */}
                            {!isChecked && (tools.length > 0 || row.remarks) && (
                              <div className="mt-3 space-y-3">
                                {tools.length > 0 && (
                                  <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                    <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                      <Wrench size={12} />
                                      Tools & Techniques
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                      {tools.map((t, idx) => (
                                        <code
                                          key={idx}
                                          className={[
                                            "block rounded bg-white border border-stone-200 px-2 py-1.5 text-xs text-stone-700",
                                            isCommand(t) ? "font-mono whitespace-pre-wrap break-all" : ""
                                          ].join(" ")}
                                        >
                                          {isCommand(t) ? `$ ${t}` : t}
                                        </code>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {row.remarks && (
                                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                    <AlertTriangle size={16} className="shrink-0 text-amber-500 mt-0.5" />
                                    <p>{row.remarks}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })
        ) : (
          <div className="page-panel rounded-lg p-10 text-center">
            <Search size={36} className="mx-auto mb-3 text-stone-400" />
            <p className="text-sm font-semibold text-stone-500">No checklist items match your filters.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-xs text-teal-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
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
