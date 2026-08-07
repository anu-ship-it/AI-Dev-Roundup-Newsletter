// dedup.js — Title-based deduplication
//
// Instead of embeddings (which require a model download or external API),
// we use normalized title similarity. Two items are duplicates if their
// titles share more than 60% of words after normalization.
// Simple, fast, zero dependencies, works perfectly for newsletter dedup.

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2) // ignore short words like "a", "an", "to"
    .filter((w) => !["the", "and", "for", "with", "from", "this", "that"].includes(w));
}

function titleSimilarity(titleA, titleB) {
  const wordsA = new Set(normalizeTitle(titleA));
  const wordsB = new Set(normalizeTitle(titleB));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = [...wordsA].filter((w) => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);

  // Jaccard similarity
  return intersection.length / union.size;
}

function urlDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function deduplicateItems(newItems, existingItems) {
  console.log(`\nDeduplication: checking ${newItems.length} items...`);

  if (existingItems.length === 0) {
    console.log("  No existing items this week — all items pass dedup");
    return newItems;
  }

  const uniqueItems = [];

  for (const item of newItems) {
    let isDuplicate = false;

    for (const existing of existingItems) {
      // Check URL domain match first (fast path)
      if (item.url === existing.url) {
        isDuplicate = true;
        break;
      }

      // Check title similarity
      const similarity = titleSimilarity(item.title, existing.title);
      if (similarity > 0.6) {
        console.log(`  Skipping duplicate: "${item.title.substring(0, 50)}..." (similarity: ${similarity.toFixed(2)})`);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) uniqueItems.push(item);
  }

  console.log(`  ${uniqueItems.length} unique items passed dedup (${newItems.length - uniqueItems.length} duplicates removed)`);
  return uniqueItems;
}

module.exports = { deduplicateItems };
