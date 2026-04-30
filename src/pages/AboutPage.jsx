import { Award, ExternalLink, Fingerprint, ShieldCheck, Terminal } from "lucide-react"

const placeholders = [
  { label: "Focus", value: "Web security, recon, report writing", icon: Fingerprint },
  { label: "Practice", value: "Checklist-driven testing workflow", icon: Terminal },
  { label: "Progress", value: "Certifications, labs, and writeups", icon: Award },
]

export default function AboutPage() {
  return (
    <section className="space-y-5">
      <header className="page-panel rounded-lg p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="eyebrow">Profile</p>
            <h1 className="mt-2 text-4xl font-extrabold text-neutral-950 md:text-5xl">About Me</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
              A dedicated profile section for your bug bounty journey. We can later add your story, certifications,
              methodology, favorite tools, public reports, social links, and selected writeups.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-900 bg-neutral-950 p-5 text-white">
            <ShieldCheck className="text-lime-300" size={28} />
            <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-stone-300">
              Identity Panel
            </p>
            <p className="mt-2 text-2xl font-extrabold">Design Pending</p>
          </div>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {placeholders.map(({ label, value, icon: Icon }) => (
          <div key={label} className="page-panel rounded-lg p-4">
            <Icon className="text-teal-700" size={21} />
            <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-950">{value}</p>
          </div>
        ))}
      </div>

      <section className="page-panel rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Next Pass</p>
            <h2 className="mt-1 text-2xl font-extrabold text-neutral-950">Content To Add Later</h2>
          </div>
          <button
            type="button"
            className="action-button border border-stone-300 bg-white text-neutral-950 hover:border-teal-500 hover:text-teal-700"
          >
            Links
            <ExternalLink size={15} />
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["Short bio", "Certifications", "Public profiles", "Featured writeups"].map((item) => (
            <div key={item} className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              {item}
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
