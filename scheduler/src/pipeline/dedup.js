// dedup.js — Embeddings-based deduplication using local transformers
//
// Groq doesn't have an embeddings API so we use @xenova/transformers
// which runs a tiny embedding model locally inside the container.
// No API call, no cost, no network dependency for this step.

const { pipeline } = require("@xenova/transformers");

let embedder = null;

// Lazy-load the embedding model on first use
// Downloads once, cached in container layer
async function getEmbedder() {
  if (!embedder) {
    console.log("  📦 Loading embedding model (first run only)...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("  ✅ Embedding model loaded");
  }
  return embedder;
}

// Cosine similarity — 0 (different) to 1 (identical)
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

async function getEmbedding(text) {
  const embed = await getEmbedder();
  const output = await embed(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

async function deduplicateItems(newItems, existingItems) {
  console.log(`\n🔍 Deduplication: checking ${newItems.length} items...`);

  if (existingItems.length === 0) {
    console.log("  No existing items this week — all items pass dedup");
    return newItems;
  }

  console.log(`  Getting embeddings for ${existingItems.length} existing items...`);
  const existingEmbeddings = await Promise.all(
    existingItems.map((item) =>
      getEmbedding(`${item.title} ${item.description}`)
    )
  );

  const uniqueItems = [];

  for (const item of newItems) {
    const itemText = `${item.title} ${item.description}`;
    const itemEmbedding = await getEmbedding(itemText);

    let isDuplicate = false;
    for (let i = 0; i < existingEmbeddings.length; i++) {
      const similarity = cosineSimilarity(itemEmbedding, existingEmbeddings[i]);
      if (similarity > 0.92) {
        console.log(`  ⏭️  Skipping duplicate: "${item.title.substring(0, 50)}..." (${similarity.toFixed(3)})`);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      item._embedding = itemEmbedding;
      uniqueItems.push(item);
    }
  }

  console.log(`  ✅ ${uniqueItems.length} unique items passed dedup`);
  return uniqueItems;
}

module.exports = { deduplicateItems };