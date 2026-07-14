import { useEffect, useState } from "react";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

const STORAGE_KEY = "job_scraper_config";

const DEFAULT_CONFIG = {
  keywords: ["solidity", "defi"],
  acceptable_locations: ["remote"],
  anti_keywords: ["senior staff"],
  max_jobs_searched_per_keyword: 20,
  max_jobs_saved: 10,
  max_experience_years: 4,
};

/**
 * Holds the search config form state, persisted to localStorage so the
 * user's keywords/locations/anti_keywords survive page reloads.
 */
export function useJobConfig() {
  const [config, setConfig] = useState(() => loadFromStorage(STORAGE_KEY, DEFAULT_CONFIG));

  useEffect(() => {
    saveToStorage(STORAGE_KEY, config);
  }, [config]);

  return [config, setConfig];
}
