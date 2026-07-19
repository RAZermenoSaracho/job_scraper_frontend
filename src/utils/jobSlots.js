// Placeholder left in a discarded job's slot while its replacement is
// queued or being searched for. `__key` stands in for `Job Url` as the
// React key and as the identity used to find this slot again later.
export function makePlaceholder(key) {
  return { __searching: true, __key: key };
}

// Terminal state for a slot whose batch came back without enough
// candidates to fill it (or whose batch request failed outright).
export function makeNoReplacement(key) {
  return { __noReplacement: true, __key: key };
}

export function isRealJob(job) {
  return !job.__searching && !job.__noReplacement;
}
