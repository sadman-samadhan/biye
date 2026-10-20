/** Pure SigV4 presigning helpers for the R2 driver (no server-only imports, so they can be unit tested). */

/** SigV4 date floored to the hour, so URLs signed within the same hour are identical (cacheable). */
export function flooredAmzDate(now = new Date()) {
  const d = new Date(now)
  d.setUTCMinutes(0, 0, 0)
  return d.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

export async function presignR2(client, objectUrl, { method = 'GET', ttl, headers = {}, query = {}, datetime } = {}) {
  const url = new URL(objectUrl)
  url.searchParams.set('X-Amz-Expires', String(ttl))
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v)
  const signed = await client.sign(url.toString(), { method, headers, aws: { signQuery: true, datetime } })
  return signed.url
}
