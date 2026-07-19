export function buildRequestBody(config, discardedUrls, overrides = {}) {
  return {
    keywords: config.keywords,
    acceptable_locations: config.acceptable_locations,
    anti_keywords: config.anti_keywords,
    discarded_urls: discardedUrls,
    max_jobs_searched_per_keyword: config.max_jobs_searched_per_keyword,
    max_jobs_saved: config.max_jobs_saved,
    max_experience_years: config.max_experience_years,
    ...overrides,
  };
}
