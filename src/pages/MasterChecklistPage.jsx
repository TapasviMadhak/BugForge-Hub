import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ChevronDown,
  Copy,
  Search,
  Wrench,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import checklistJson from "../data/masterChecklist.json"
import { categoryToPhase, criticalFallbacks, roadmapPhases } from "../data/checklistRoadmap"

const STORAGE_KEY = "bb-master-checklist-v2"
const DEFAULT_PHASE_KEY = "special-cases"

const getRowId = (row) => `${row.sr_no}-${row.category}-${row.activity}`
const getPhaseItemId = (phaseKey, itemId) => `phase:${phaseKey}:${itemId}`
const getFallbackItemId = (bundleKey, itemId) => `fallback:${bundleKey}:${itemId}`
const getCategoryId = (phaseKey, category) => `category:${phaseKey}:${slugify(category)}`
const toSearchText = (...parts) => parts.filter(Boolean).join(" ").toLowerCase()
const isMatch = (query, ...parts) => !query || toSearchText(...parts).includes(query)
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

// Simple regex to detect if a tool/technique is a command
const isCommand = (text) => {
  const t = text.trim()
  return t.includes(" -") || /^(python|curl|nmap|perl|gobuster|assetfinder|httpx|cat )/i.test(t)
}

export default function MasterChecklistPage() {
  const [query, setQuery] = useState("")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [detailMode, setDetailMode] = useState("simple")
  const [collapsedCategories, setCollapsedCategories] = useState(() => new Set())
  const [copiedSnippet, setCopiedSnippet] = useState("")
  const showMaster = scopeFilter !== "fallbacks"
  const showFallbacks = scopeFilter !== "master"
  const showDetails = detailMode === "detailed"

  const [checkedRows, setCheckedRows] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))
    } catch {
      return new Set()
    }
  })

  const rows = checklistJson.checklist
  const normalizedQuery = query.trim().toLowerCase()

  const allCategoryIds = useMemo(() => {
    const ids = []
    const seen = new Set()

    for (const row of rows) {
      const phaseKey = categoryToPhase[row.category] || DEFAULT_PHASE_KEY
      const categoryId = getCategoryId(phaseKey, row.category || "Uncategorized")

      if (!seen.has(categoryId)) {
        seen.add(categoryId)
        ids.push(categoryId)
      }
    }

    return ids
  }, [rows])

  const roadmapSections = useMemo(() => {
    const rowsByPhase = new Map(roadmapPhases.map((phase) => [phase.key, []]))

    for (const row of rows) {
      const phaseKey = categoryToPhase[row.category] || DEFAULT_PHASE_KEY
      if (!rowsByPhase.has(phaseKey)) rowsByPhase.set(phaseKey, [])
      rowsByPhase.get(phaseKey).push(row)
    }

    return roadmapPhases.map((phase) => {
      const phaseRows = rowsByPhase.get(phase.key) || []
      const phaseMetadata = toSearchText(
        phase.title,
        phase.summary,
        phase.trigger,
        ...(phase.sourceCategories || []),
      )
      const metadataMatches = isMatch(normalizedQuery, phaseMetadata)

      const visibleItems = metadataMatches
        ? phase.items
        : phase.items.filter((item) => isMatch(normalizedQuery, item.label, item.note))

      const categoryOrder = []
      const rowsByCategory = new Map()

      for (const row of phaseRows) {
        const category = row.category || "Uncategorized"
        if (!rowsByCategory.has(category)) {
          rowsByCategory.set(category, [])
          categoryOrder.push(category)
        }
        rowsByCategory.get(category).push(row)
      }

      const categoryGroups = categoryOrder.map((category) => {
        const categoryRows = rowsByCategory.get(category) || []
        const categoryId = getCategoryId(phase.key, category)
        const visibleRows = metadataMatches
          ? categoryRows
          : categoryRows.filter((row) =>
              isMatch(
                normalizedQuery,
                row.sr_no,
                row.category,
                row.activity,
                row.remarks,
                ...(row.tools_technique || []),
              ),
            )

        const isCollapsed = !normalizedQuery && collapsedCategories.has(categoryId)

        return {
          category,
          categoryId,
          rows: categoryRows,
          visibleRows,
          isVisible: visibleRows.length > 0,
          isCollapsed,
          completed: categoryRows.filter((row) => checkedRows.has(getRowId(row))).length,
          total: categoryRows.length,
        }
      })

      const phaseItemIds = phase.items.map((item) => getPhaseItemId(phase.key, item.id))
      const phaseRowIds = phaseRows.map((row) => getRowId(row))
      const phaseCompleted = [...phaseItemIds, ...phaseRowIds].filter((id) => checkedRows.has(id)).length
      const phaseTotal = phaseItemIds.length + phaseRowIds.length

      return {
        ...phase,
        rows: phaseRows,
        visibleItems,
        categoryGroups,
        isVisible: visibleItems.length > 0 || categoryGroups.some((group) => group.isVisible),
        phaseCompleted,
        phaseTotal,
      }
    })
  }, [checkedRows, collapsedCategories, normalizedQuery, rows])

  const fallbackSections = useMemo(() => {
    return criticalFallbacks.map((bundle) => {
      const bundleMetadata = toSearchText(bundle.title, bundle.summary, bundle.trigger)
      const metadataMatches = isMatch(normalizedQuery, bundleMetadata)

      const visibleItems = metadataMatches
        ? bundle.items
        : bundle.items.filter((item) => isMatch(normalizedQuery, item.label, item.note))

      const bundleItemIds = bundle.items.map((item) => getFallbackItemId(bundle.key, item.id))
      const bundleCompleted = bundleItemIds.filter((id) => checkedRows.has(id)).length
      const bundleTotal = bundleItemIds.length

      return {
        ...bundle,
        visibleItems,
        isVisible: visibleItems.length > 0,
        bundleCompleted,
        bundleTotal,
      }
    })
  }, [checkedRows, normalizedQuery])

  const masterItemTotal = useMemo(
    () => roadmapSections.reduce((total, section) => total + section.phaseTotal, 0),
    [roadmapSections],
  )

  const fallbackItemTotal = useMemo(
    () => fallbackSections.reduce((total, section) => total + section.bundleTotal, 0),
    [fallbackSections],
  )

  const knownIds = useMemo(() => {
    const ids = new Set()

    for (const phase of roadmapPhases) {
      for (const item of phase.items) ids.add(getPhaseItemId(phase.key, item.id))
    }

    for (const row of rows) {
      ids.add(getRowId(row))
    }

    for (const bundle of criticalFallbacks) {
      for (const item of bundle.items) ids.add(getFallbackItemId(bundle.key, item.id))
    }

    return ids
  }, [rows])

  const completedTotal = useMemo(
    () => Array.from(checkedRows).filter((id) => knownIds.has(id)).length,
    [checkedRows, knownIds],
  )

  const completionPercent = (total) => (total ? Math.round((completedTotal / total) * 100) : 0)
  const masterCompletedTotal = roadmapSections.reduce((total, section) => total + section.phaseCompleted, 0)
  const fallbackCompletedTotal = fallbackSections.reduce((total, section) => total + section.bundleCompleted, 0)
  const visibleCategoryIndex = roadmapSections
    .filter((section) => section.isVisible)
    .flatMap((section) =>
      section.categoryGroups
        .filter((group) => group.isVisible)
        .map((group) => ({
          ...group,
          phaseTitle: section.title,
        })),
    )

  const visibleMasterSections = roadmapSections.filter((section) => section.isVisible)
  const visibleFallbackSections = fallbackSections.filter((section) => section.isVisible)

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

  const toggleCategory = (categoryId) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId)
      return next
    })
  }

  const copySnippet = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSnippet(id)
      setTimeout(() => setCopiedSnippet(""), 1200)
    } catch {
      setCopiedSnippet("Clipboard blocked")
      setTimeout(() => setCopiedSnippet(""), 1200)
    }
  }

  const expandAllCategories = () => {
    setCollapsedCategories(new Set())
  }

  const collapseAllCategories = () => {
    setCollapsedCategories(new Set(allCategoryIds))
  }

  const viewButtonClass = (isActive) =>
    [
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
      isActive
        ? "border-teal-400 bg-teal-50 text-teal-900 dark:border-teal-300 dark:bg-teal-500/20 dark:text-teal-100"
        : "border-stone-200 bg-white text-stone-700 hover:border-teal-300 hover:text-teal-700 dark:border-stone-700/70 dark:bg-stone-900/40 dark:text-stone-100 dark:hover:border-teal-300 dark:hover:text-teal-100",
    ].join(" ")

  const clearFilters = () => {
    setQuery("")
    setScopeFilter("all")
  }

  return (
    <section className="checklist-page space-y-5">
      <header className="page-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Bug bounty roadmap</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">One master checklist, then fallback modules</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              The page is ordered as a single roadmap: run the master path first, then drop into critical fallback
              mini-checklists when the target stalls. Based on {checklistJson.title}.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              {roadmapPhases.length} master phases · {criticalFallbacks.length} critical fallback modules · {rows.length} detailed source rows
            </p>
          </div>
          <div className="completion-meter min-w-[140px] rounded-lg border border-teal-300 bg-teal-50 p-4 text-center">
            <p className="text-3xl font-extrabold">{completionPercent(masterItemTotal + fallbackItemTotal)}%</p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">Completion</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Master items" value={masterItemTotal} icon={<ClipboardList size={16} />} />
          <Stat label="Fallback items" value={fallbackItemTotal} icon={<Wrench size={16} />} />
          <Stat label="Sections" value={roadmapPhases.length + criticalFallbacks.length} icon={<ClipboardList size={16} />} />
          <Stat label="Completed" value={completedTotal} icon={<CheckCircle2 size={16} />} />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3">
            <Search size={15} className="shrink-0 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phases, rows, tools, or fallback steps…"
              className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="shrink-0 text-stone-400 hover:text-stone-700">
                <X size={13} />
              </button>
            ) : null}
          </label>

          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="min-h-11 max-w-[220px] truncate rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 outline-none ring-teal-500 transition focus:ring-2"
          >
            <option value="all">All sections</option>
            <option value="master">Master roadmap</option>
            <option value="fallbacks">Critical fallbacks</option>
          </select>
        </div>

        {showMaster ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">View</span>
            <button type="button" onClick={() => setDetailMode("simple")} className={viewButtonClass(!showDetails)}>
              Simple
            </button>
            <button type="button" onClick={() => setDetailMode("detailed")} className={viewButtonClass(showDetails)}>
              Detailed
            </button>
            <span className="text-xs text-stone-500">Simple view hides raw rows and tools.</span>
          </div>
        ) : null}

        {showMaster ? (
          <div className="page-panel mt-4 rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Category access</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Jump to any category, or collapse and expand them all from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {showDetails ? (
                  <>
                    <button
                      type="button"
                      onClick={expandAllCategories}
                      className="action-button border border-teal-300 bg-white text-xs text-teal-700 hover:border-teal-500 hover:text-teal-800"
                    >
                      Expand all categories
                    </button>
                    <button
                      type="button"
                      onClick={collapseAllCategories}
                      className="action-button border border-stone-300 bg-white text-xs text-stone-700 hover:border-stone-500 hover:text-stone-900"
                    >
                      Collapse all categories
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDetailMode("detailed")}
                    className="action-button border border-teal-300 bg-white text-xs text-teal-700 hover:border-teal-500 hover:text-teal-800"
                  >
                    Show detailed categories
                  </button>
                )}
              </div>
            </div>

            {visibleCategoryIndex.length > 0 ? (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {visibleCategoryIndex.map((entry) => (
                  <a
                    key={entry.categoryId}
                    href={`#${entry.categoryId}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700 transition hover:border-teal-300 hover:text-teal-700"
                    title={entry.phaseTitle}
                  >
                    <span>{entry.category}</span>
                    <span className="font-mono text-[10px] text-stone-500">{entry.total}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                No categories match the current filters.
              </p>
            )}

            {!showDetails ? (
              <p className="mt-3 text-xs text-stone-500">
                Detailed rows are hidden in simple view. Switch to detailed to see tools and full steps.
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="space-y-6">
        {showMaster && visibleMasterSections.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-stone-300 pb-2">
              <div>
                <p className="eyebrow">Master roadmap</p>
                <h2 className="mt-1 text-2xl font-extrabold text-neutral-950">Run this path first</h2>
              </div>
              <span className="font-mono text-xs font-semibold text-stone-500">
                {masterCompletedTotal} / {masterItemTotal} completed
              </span>
            </div>

            {visibleMasterSections.map((phase) => (
              <section key={phase.key} id={`phase-${phase.key}`} className="space-y-3">
                <div className="page-panel rounded-lg p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Master phase</p>
                      <h3 className="mt-2 text-2xl font-extrabold text-neutral-950">{phase.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{phase.summary}</p>
                    </div>
                    <div className="completion-meter min-w-[140px] rounded-lg border border-teal-300 bg-teal-50 p-4 text-center">
                      <p className="text-2xl font-extrabold">
                        {phase.phaseTotal ? Math.round((phase.phaseCompleted / phase.phaseTotal) * 100) : 0}%
                      </p>
                      <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-700">
                        {phase.phaseCompleted} / {phase.phaseTotal} completed
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      Trigger: {phase.trigger}
                    </span>
                    {phase.sourceCategories.length > 0 ? (
                      phase.sourceCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-700"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                        Curated roadmap items
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid gap-2 md:grid-cols-2">
                    {phase.visibleItems.map((item) => {
                      const itemId = getPhaseItemId(phase.key, item.id)

                      return (
                        <CompactChecklistItem
                          key={itemId}
                          id={itemId}
                          checked={checkedRows.has(itemId)}
                          onToggle={toggleChecked}
                          title={item.label}
                          note={item.note}
                        />
                      )
                    })}
                  </div>
                </div>

                {phase.categoryGroups.filter((group) => group.isVisible).length > 0 ? (
                  showDetails ? (
                    <div className="space-y-3">
                      {phase.categoryGroups
                        .filter((group) => group.isVisible)
                        .map((group) => (
                          <CategoryGroup
                            key={group.categoryId}
                            group={group}
                            checkedIds={checkedRows}
                            onToggleCategory={() => toggleCategory(group.categoryId)}
                            onToggleRow={toggleChecked}
                            onCopySnippet={copySnippet}
                            copiedSnippet={copiedSnippet}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {phase.categoryGroups
                        .filter((group) => group.isVisible)
                        .map((group) => (
                          <CategorySummaryCard
                            key={group.categoryId}
                            group={group}
                            onShowDetails={() => setDetailMode("detailed")}
                          />
                        ))}
                    </div>
                  )
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {showFallbacks && visibleFallbackSections.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-stone-300 pb-2">
              <div>
                <p className="eyebrow">Critical fallback modules</p>
                <h2 className="mt-1 text-2xl font-extrabold text-neutral-950">Use these when the main path stalls</h2>
              </div>
              <span className="font-mono text-xs font-semibold text-stone-500">
                {fallbackCompletedTotal} / {fallbackItemTotal} completed
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {visibleFallbackSections.map((bundle) => (
                <article key={bundle.key} className="page-panel rounded-lg border border-rose-200 bg-rose-50/50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                        Critical fallback
                      </p>
                      <h3 className="mt-2 text-xl font-extrabold text-neutral-950">{bundle.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{bundle.summary}</p>
                    </div>
                    <div className="completion-meter completion-meter-danger min-w-[132px] rounded-lg border border-rose-200 bg-white p-3 text-center">
                      <p className="text-2xl font-extrabold">
                        {bundle.bundleTotal ? Math.round((bundle.bundleCompleted / bundle.bundleTotal) * 100) : 0}%
                      </p>
                      <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-700">
                        {bundle.bundleCompleted} / {bundle.bundleTotal} completed
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Trigger: {bundle.trigger}
                  </p>

                  <div className="mt-4 grid gap-2">
                    {bundle.visibleItems.map((item) => {
                      const itemId = getFallbackItemId(bundle.key, item.id)

                      return (
                        <CompactChecklistItem
                          key={itemId}
                          id={itemId}
                          checked={checkedRows.has(itemId)}
                          onToggle={toggleChecked}
                          title={item.label}
                          note={item.note}
                          variant="fallback"
                        />
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {(!showMaster || visibleMasterSections.length === 0) && (!showFallbacks || visibleFallbackSections.length === 0) ? (
          <div className="page-panel rounded-lg p-10 text-center">
            <Search size={36} className="mx-auto mb-3 text-stone-400" />
            <p className="text-sm font-semibold text-stone-500">No checklist items match your filters.</p>
            <button type="button" onClick={clearFilters} className="mt-2 text-xs text-teal-700 hover:underline">
              Clear filters
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function CompactChecklistItem({ id, title, note, checked, onToggle, variant = "master" }) {
  const variantClasses =
    variant === "fallback"
      ? "border-rose-200 bg-white/90 hover:border-rose-300"
      : "border-stone-200 bg-white/90 hover:border-teal-300"

  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition",
        variantClasses,
        checked ? "opacity-70" : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
      />
      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm font-semibold leading-relaxed",
            checked ? "line-through text-stone-500" : "text-neutral-950",
          ].join(" ")}
        >
          {title}
        </p>
        {note ? <p className="mt-1 text-xs leading-5 text-stone-500">{note}</p> : null}
      </div>
    </label>
  )
}

function DetailedChecklistRow({ row, checked, onToggle, onCopySnippet, copiedSnippet }) {
  const tools = (row.tools_technique || []).filter(Boolean)

  return (
    <article
      className={[
        "page-panel rounded-lg p-4 transition-colors",
        checked ? "bg-stone-50/60 opacity-70" : "",
      ].join(" ")}
    >
      <label className="flex cursor-pointer items-start gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(getRowId(row))}
          className="mt-1 h-5 w-5 shrink-0 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-stone-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-600">
              #{row.sr_no}
            </span>
            <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {row.category}
            </span>
          </div>

          <p
            className={[
              "mt-2 text-sm font-semibold leading-relaxed text-neutral-950",
              checked ? "line-through text-stone-500" : "",
            ].join(" ")}
          >
            {row.activity}
          </p>

          {!checked && (tools.length > 0 || row.remarks) ? (
            <div className="mt-3 space-y-3">
              {tools.length > 0 ? (
                <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                  <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    <Wrench size={12} />
                    Tools & Techniques
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {tools.map((tool, index) => {
                      const snippet = isCommand(tool) ? `$ ${tool}` : tool
                      const snippetId = `${getRowId(row)}-tool-${index}`

                      return (
                        <SnippetBar
                          key={snippetId}
                          id={snippetId}
                          text={snippet}
                          copied={copiedSnippet === snippetId}
                          onCopy={onCopySnippet}
                          className={isCommand(tool) ? "font-mono whitespace-pre-wrap break-all" : ""}
                        />
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {row.remarks ? (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                  <p>{row.remarks}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </label>
    </article>
  )
}

function CategoryGroup({ group, checkedIds, onToggleCategory, onToggleRow, onCopySnippet, copiedSnippet }) {
  return (
    <section id={group.categoryId} className="scroll-mt-24 rounded-xl border border-stone-200 bg-white/70 p-4">
      <button
        type="button"
        onClick={onToggleCategory}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={!group.isCollapsed}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-extrabold text-neutral-950">{group.category}</h4>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {group.completed} / {group.total}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            {group.isCollapsed ? "Collapsed" : "Expanded"} category
          </p>
        </div>

        <span className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          {group.isCollapsed ? "Expand" : "Collapse"}
          <ChevronDown size={14} className={group.isCollapsed ? "transition-transform" : "rotate-180 transition-transform"} />
        </span>
      </button>

      {group.isCollapsed ? (
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Hidden rows are still tracked. Use this category to reopen the detailed checklist.
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {group.visibleRows.map((row) => {
            const rowId = getRowId(row)

            return (
              <DetailedChecklistRow
                key={rowId}
                row={row}
                checked={checkedIds.has(rowId)}
                onToggle={onToggleRow}
                onCopySnippet={onCopySnippet}
                copiedSnippet={copiedSnippet}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

function SnippetBar({ id, text, copied, onCopy, className = "" }) {
  return (
    <div className="group/snippet relative rounded border border-stone-200 bg-white text-xs text-stone-700">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onCopy(id, text)
        }}
        className="absolute left-1.5 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded border border-stone-300 bg-white text-stone-700 opacity-0 shadow-sm transition hover:border-teal-500 hover:text-teal-700 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-teal-500 group-hover/snippet:opacity-100"
        aria-label={copied ? "Copied snippet" : "Copy snippet"}
        title={copied ? "Copied" : "Copy"}
      >
        <Copy size={12} />
      </button>
      <code className={["block px-2 py-1.5 pl-10", className].join(" ")}>
        {text}
      </code>
    </div>
  )
}

function CategorySummaryCard({ group, onShowDetails }) {
  return (
    <section id={group.categoryId} className="scroll-mt-24 rounded-xl border border-stone-200 bg-white/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-extrabold text-neutral-950">{group.category}</h4>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            {group.completed} / {group.total} completed
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          Summary
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Switch to detailed view to open every step, tool, and remark in this category.
      </p>
      <button
        type="button"
        onClick={onShowDetails}
        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:underline"
      >
        Show detailed rows
        <ChevronDown size={12} className="-rotate-90" />
      </button>
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
