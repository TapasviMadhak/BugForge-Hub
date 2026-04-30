const withIds = (prefix, items) =>
  items.map((item, index) => ({
    ...item,
    id: item.id ?? `${prefix}-${index + 1}`,
  }))

export const roadmapPhases = [
  {
    key: "pre-engagement",
    title: "Pre-engagement & scope",
    summary: "Lock the target, logging, and safe-testing boundaries before any probing.",
    trigger: "Start here on every program or new target.",
    sourceCategories: [],
    items: withIds("pre-engagement", [
      {
        label: "Verify scope, exclusions, authorization, and the program's test limits.",
      },
      {
        label: "Prepare notes, evidence folders, and a repeatable capture template.",
      },
      {
        label: "List the target's domains, apps, APIs, accounts, and environments.",
      },
    ]),
  },
  {
    key: "recon",
    title: "Recon, infrastructure & mapping",
    summary: "Enumerate assets, exposed services, and technology clues before active testing.",
    trigger: "Use when you need more surface area or the target feels cold.",
    sourceCategories: [
      "Fingerprinting Application",
      "Network Testing",
      "Application Component Audit",
    ],
    items: withIds("recon", [
      {
        label: "Enumerate domains, subdomains, and third-level hosts.",
      },
      {
        label: "Probe live services, open ports, headers, and technology stacks.",
      },
      {
        label: "Crawl directories, JS files, and historical URLs for hidden entry points.",
      },
    ]),
  },
  {
    key: "identity",
    title: "Identity, session & access control",
    summary: "Stress login, registration, reset, and token handling until state breaks.",
    trigger: "Use when the app has accounts, cookies, or role-based screens.",
    sourceCategories: [
      "Audit Session Management",
      "Audit Registration",
      "Audit Authentication",
      "Forgot Password Testing",
      "Post Login Account Information Testing / Testing My Account Information",
      "CSRF Token Testing",
      "CAPTCHA Testing",
    ],
    items: withIds("identity", [
      {
        label: "Test registration, duplicate users, and identity collisions.",
      },
      {
        label: "Inspect cookies, token structure, expiry, fixation, and replay behavior.",
      },
      {
        label: "Push login, password reset, MFA, and recovery flows for bypasses.",
      },
    ]),
  },
  {
    key: "workflows",
    title: "APIs, transactions & business logic",
    summary: "Target state changes, ownership boundaries, and money-like workflows.",
    trigger: "Use when the app has carts, refunds, bookings, forms, or API clients.",
    sourceCategories: [
      "Contact Us / Feedback Form Testing",
      "Product Purchase Testing",
      "Flight / Railway / Hotel / Cab etc. Booking Testing",
      "Banking Application Auditing",
      "Web Services Testing",
    ],
    items: withIds("workflows", [
      {
        label: "Map API routes, versions, methods, and content types.",
      },
      {
        label: "Tamper totals, quantities, ownership, coupons, and refund state.",
      },
      {
        label: "Check cross-origin exposure, request replay, and server-side validation gaps.",
      },
    ]),
  },
  {
    key: "injection",
    title: "Input validation & injection",
    summary: "Exercise every parser, context, and encoding path with focused payloads.",
    trigger: "Use when parameters, headers, forms, or uploads look unsafely parsed.",
    sourceCategories: [
      "Error Codes Testing",
      "Cross Site Scripting (XSS)",
      "SQL Injection",
      "Open Redirection",
      "Separators",
    ],
    items: withIds("injection", [
      {
        label: "Test reflected, stored, and DOM XSS in the correct browser context.",
      },
      {
        label: "Probe SQL, NoSQL, command, and template injection surfaces.",
      },
      {
        label: "Try separators, redirects, and parser confusion in parameters and headers.",
      },
    ]),
  },
  {
    key: "special-cases",
    title: "Client-side intelligence & special cases",
    summary: "Mine the odd flows, unusual parsers, and hidden files that generic tests miss.",
    trigger: "Use when the obvious checks stall but the app still feels incomplete.",
    sourceCategories: ["Other Testcases"],
    items: withIds("special-cases", [
      {
        label: "Inspect JavaScript, source maps, comments, and historical URLs.",
      },
      {
        label: "Review EXIF, viewstate, generated files, and platform-specific quirks.",
      },
      {
        label: "Treat SSRF, redirectors, and odd encodings as first-class test surfaces.",
      },
    ]),
  },
  {
    key: "hardening",
    title: "Configuration & hardening",
    summary: "Confirm the target's posture around TLS, headers, methods, and exposure.",
    trigger: "Use after the main attack surfaces are mapped.",
    sourceCategories: [],
    items: withIds("hardening", [
      {
        label: "Validate TLS, security headers, caches, and error handling behavior.",
      },
      {
        label: "Check debug endpoints, backup files, default credentials, and staging leaks.",
      },
      {
        label: "Review unsafe HTTP methods, exposed services, and known-vuln surfaces.",
      },
    ]),
  },
  {
    key: "reporting",
    title: "Chaining & reporting",
    summary: "Turn scattered weaknesses into a real impact story and prove it cleanly.",
    trigger: "Use when you have one or more findings worth validating or escalating.",
    sourceCategories: [],
    items: withIds("reporting", [
      {
        label: "Chain low-severity weaknesses into a higher-impact path.",
      },
      {
        label: "Capture clean PoCs, impact, and remediation guidance.",
      },
      {
        label: "Retest fixes and confirm the bug is actually closed.",
      },
    ]),
  },
]

export const criticalFallbacks = [
  {
    key: "api-bypass",
    title: "API bypass chain",
    trigger: "Use when the API looks locked down or inconsistent.",
    summary: "Hit route, version, and parameter weaknesses that web layers often miss.",
    items: withIds("api-bypass", [
      { label: "Swap versions, routes, and methods to hit deprecated or adjacent endpoints." },
      { label: "Duplicate, reorder, or pollute parameters and object IDs." },
      { label: "Flip content types, body formats, and JSON versus form handling." },
      { label: "Check staging, mobile, or non-production hosts for weaker controls." },
    ]),
  },
  {
    key: "mfa-failure",
    title: "MFA and 2FA failure chain",
    trigger: "Use when login is fine but the second factor still feels weak.",
    summary: "Look for reusable, bypassable, or rate-limit-free challenge flows.",
    items: withIds("mfa-failure", [
      { label: "Try OTP reuse, brute force, and response manipulation." },
      { label: "Inspect backup codes, recovery paths, and disable/enable workflows." },
      { label: "Check whether sessions survive factor changes or login completion." },
      { label: "Verify that rate limits and lockouts apply to every verification path." },
    ]),
  },
  {
    key: "file-upload",
    title: "File upload to RCE chain",
    trigger: "Use when uploads are allowed but the trust boundary is fuzzy.",
    summary: "Push extension, parser, and storage handling until execution or access breaks.",
    items: withIds("file-upload", [
      { label: "Try double extensions, alternate extensions, and case changes." },
      { label: "Vary MIME type, magic bytes, and polyglot payloads." },
      { label: "Test filename handling, traversal, and direct object access to the upload." },
      { label: "Check image, SVG, archive, and parser edge cases." },
    ]),
  },
  {
    key: "account-takeover",
    title: "Account takeover and reset chain",
    trigger: "Use when the app has email changes, reset links, or confirmation flows.",
    summary: "Break the full identity lifecycle instead of a single form field.",
    items: withIds("account-takeover", [
      { label: "Enumerate accounts and compare reset, confirmation, and email change behavior." },
      { label: "Test host headers, forwarded host headers, and link generation." },
      { label: "Check token reuse, token lifetime, and confirmation semantics." },
      { label: "Combine account enumeration with rate-limit bypass and session reuse." },
    ]),
  },
  {
    key: "cors",
    title: "CORS misconfiguration sweep",
    trigger: "Use when the target has public APIs or cross-site session access.",
    summary: "Look for permissive origin logic, especially on sensitive endpoints.",
    items: withIds("cors", [
      { label: "Test exact, wildcard, null, and subdomain-based origin matching." },
      { label: "Repeat requests with credentials and compare preflight behavior." },
      { label: "Sweep subdomains and sensitive routes for inconsistent policy." },
      { label: "Check staging or alternate environments for wider origin allowlists." },
    ]),
  },
  {
    key: "business-logic",
    title: "Business logic and race condition sweep",
    trigger: "Use when features have state transitions, balances, or workflow steps.",
    summary: "Exploit missing server-side rules instead of the input parser.",
    items: withIds("business-logic", [
      { label: "Tamper quantities, prices, coupons, and ownership boundaries." },
      { label: "Replay sensitive actions to look for race conditions or double spends." },
      { label: "Skip steps and compare what the server accepts versus what the UI blocks." },
      { label: "Test multi-account, refund, and approval flows for trust collisions." },
    ]),
  },
  {
    key: "client-side-intel",
    title: "Client-side intelligence mining",
    trigger: "Use when recon is dry but the browser still exposes clues.",
    summary: "Mine JavaScript, source maps, storage, and historical URLs for hidden leverage.",
    items: withIds("client-side-intel", [
      { label: "Sweep JavaScript bundles, source maps, and comments for endpoints and secrets." },
      { label: "Check network responses, local storage, session storage, and cookies." },
      { label: "Pull historical URLs and archived assets for forgotten features." },
      { label: "Correlate leaks across subdomains, old builds, and downloadable files." },
    ]),
  },
  {
    key: "waf-bypass",
    title: "WAF and filter bypass pack",
    trigger: "Use when payloads are blocked before they reach the vulnerable parser.",
    summary: "Change the shape of the payload instead of only the payload itself.",
    items: withIds("waf-bypass", [
      { label: "Vary encodings, casing, comments, and whitespace." },
      { label: "Try nested encodings and alternate content types." },
      { label: "Move the payload into headers, parameters, or body fields that are parsed differently." },
      { label: "Re-test the same attack in a different browser or request context." },
    ]),
  },
]

export const categoryToPhase = Object.fromEntries(
  roadmapPhases.flatMap((phase) =>
    phase.sourceCategories.map((category) => [category, phase.key]),
  ),
)