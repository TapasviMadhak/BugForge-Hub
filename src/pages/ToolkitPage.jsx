import { Copy, Wrench } from "lucide-react"
import { useMemo, useState } from "react"
import { tools } from "../data/content"

export default function ToolkitPage() {
  const [copied, setCopied] = useState("")
  const toolsByCategory = useMemo(() => {
    return tools.reduce((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = []
      acc[tool.category].push(tool)
      return acc
    }, {})
  }, [])

  const copyText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(""), 1200)
    } catch {
      setCopied("Clipboard blocked")
      setTimeout(() => setCopied(""), 1200)
    }
  }

  return (
    <section className="space-y-5">
      <header className="page-panel rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Tooling</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">Essential Tools</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Install commands, quick usage patterns, and tool purpose grouped by workflow.
            </p>
          </div>
          <div className="rounded-lg border border-lime-300 bg-lime-50 p-4 text-lime-950">
            <Wrench size={22} />
            <p className="mt-2 text-2xl font-extrabold">{tools.length}</p>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">Tools</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <section key={category} className="space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-stone-300 pb-2">
              <h2 className="text-xl font-extrabold text-neutral-950">{category}</h2>
              <span className="font-mono text-xs font-semibold text-stone-500">{categoryTools.length} tools</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryTools.map((tool) => {
                const copyId = `${tool.name}-install`
                return (
                  <article key={tool.name} className="page-panel rounded-lg p-5">
                    <h3 className="text-lg font-extrabold text-neutral-950">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{tool.purpose}</p>
                    <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
                      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                        Install
                      </p>
                      <pre className="overflow-x-auto text-xs text-stone-800">
                        <code>{tool.install}</code>
                      </pre>
                    </div>
                    {tool.usage?.length ? (
                      <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
                        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
                          Usage
                        </p>
                        <div className="grid gap-1.5">
                          {tool.usage.map((command) => (
                            <pre
                              key={command}
                              className="overflow-x-auto whitespace-nowrap rounded-md border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800"
                            >
                              <code>{command}</code>
                            </pre>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => copyText(copyId, tool.install)}
                      className="action-button mt-3 border border-stone-300 bg-white text-xs text-stone-700 hover:border-teal-500 hover:text-teal-700"
                    >
                      <Copy size={13} />
                      {copied === copyId ? "Copied" : "Copy Install"}
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
