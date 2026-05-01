import { getStore } from "@netlify/blobs"

const COUNT_KEY = "site-visit-count"

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, chunk) => {
      const [key, ...rest] = chunk.split("=")
      if (!key) return acc
      acc[key] = decodeURIComponent(rest.join("="))
      return acc
    }, {})

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        Allow: "GET",
      },
      body: "Method Not Allowed",
    }
  }

  const cookies = parseCookies(event.headers?.cookie)
  const hasSession = cookies.bb_visit === "1"

  const store = getStore("bb-site-visits")
  const stored = await store.get(COUNT_KEY)
  const current = Number(stored)
  let count = Number.isFinite(current) ? current : 0

  if (!hasSession) {
    count += 1
    await store.set(COUNT_KEY, String(count))
  }

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  }

  if (!hasSession) {
    headers["Set-Cookie"] = "bb_visit=1; Path=/; SameSite=Lax"
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ count }),
  }
}
