// Add new posts here. Keep newest entries at the top.
//
// Required: id, url.
// Optional: type, title, source, publishedAt, tags, description, cover.
//
// type/source can be:
// - "article" for Medium, blogs, news, GitHub, docs, or any normal link.
// - "tweet", "twitter", or "x" to embed the complete X/Twitter post.
// - "reddit" to embed the complete Reddit post.
//
// You can also skip type. The page detects X/Twitter and Reddit from the URL.
// Article covers are fetched automatically when cover is not provided.
// If a remote cover is slow or broken, the page falls back to a source panel.
export const blogPosts = [
  {
    id: "hackerone-automation-blocked-critical",
    type: "reddit",
    title: "HackerOne automation blocked my critical $100",
    url: "https://www.reddit.com/r/bugbounty/comments/1s8gjmp/hackerone_automation_blocked_my_critical_100/",
    source: "Reddit",
    tags: ["bug bounty", "HackerOne"],
    description: "Reddit discussion from r/bugbounty.",
  },
  {
    id: "stokfredrik-bugbounty-tweet-1109733020540567555",
    type: "tweet",
    title: "Bug bounty tweet by Stok",
    url: "https://x.com/stokfredrik/status/1109733020540567555",
    source: "X / Twitter",
    tags: ["bug bounty", "tips"],
    description: "Useful bug bounty post from Stok.",
  },
  {
    id: "rDNS",
    type: "article",
    title: "FUnderstanding Reverse DNS (rDNS) — A Behind-the-Scenes Lookup ",
    url: "https://hettt.medium.com/understanding-reverse-dns-rdns-a-behind-the-scenes-lookup-5b676ffe49cf",
    source: "Medium",
    publishedAt: "2025-04-15",
    tags: ["DNS", "Reverse DNS", "DNS servers"],
    description: "Uncovering vulnerabilities and exploiting them: a deep dive into the journey from reconnaissance to a successful SQL injection.",
  },
  {
    id: "i-passed-the-crta-exam",
    type: "article",
    title: "I Passed the CRTA Exam; Here’s My Honest Experience",
    url: "https://medium.com/@tapasviMadhak/i-passed-the-crta-exam-heres-my-honest-experience-63c5c4cf7b13",
    source: "Medium",
    publishedAt: "2026-03-11",
    tags: ["Exam Review", "CyberWarefare Labs", "CRTA"],
    description: "If you’re reading this, you’re probably either curious about the CRTA certification, already enrolled, or just someone who enjoys reading about people suffering through CTF-style exams.",
  },
  {
    id: "sql-injection-lab",
    type: "article",
    title: "SQL Injection Lab — TryHackMe — Walkthrough & answers",
    url: "https://medium.com/@tapasviMadhak/sql-injection-lab-tryhackme-walkthrough-answers-c0ed7fc3bd33",
    source: "Medium",
    publishedAt: "2025-08-25",
    tags: ["Walkthrough", "TryHackMe", "SQLi"],
    description: "This room is intended to be an introduction to SQL injection and demonstrates various SQL injection attacks.",
  },
  {
    id: "what-is-nmap",
    type: "article",
    title: "What is N-map?",
    url: "https://medium.com/@tapasviMadhak/what-is-n-map-77a145e4fdc3",
    source: "Medium",
    publishedAt: "2026-04-26",
    tags: ["nmap", "recon", "network-scanning"],
    description: "A beginner-friendly note on Nmap and how it fits into recon and network scanning.",
  },
  

]
