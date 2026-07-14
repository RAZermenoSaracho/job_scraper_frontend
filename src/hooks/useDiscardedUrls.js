import { useEffect, useState } from "react";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

const STORAGE_KEY = "job_scraper_discarded_urls";

/**
 * Holds discarded job URLs, persisted separately from the search config so
 * it survives independently across sessions.
 */
export function useDiscardedUrls() {
  const [discardedUrls, setDiscardedUrls] = useState(() => loadFromStorage(STORAGE_KEY, []));

  useEffect(() => {
    saveToStorage(STORAGE_KEY, discardedUrls);
  }, [discardedUrls]);

  return [discardedUrls, setDiscardedUrls];
}
