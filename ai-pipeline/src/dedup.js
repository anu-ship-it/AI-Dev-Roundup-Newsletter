// dedup.js — Embeddings-based deduplication using Gemini
//
// Same logic as before — convert each item to an embedding vector,
// compare against items already processed this week using cosine similarity.
// If similarity > 0.92, it's the same story — skip it.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cosine similarity — measures how similar two vectors are
// Returns 0 (completely different) to 1 (identical)
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Get embedding for a single piece of text using Gemini
async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
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
        console.log(`  ⏭️  Skipping duplicate: "${item.title.substring(0, 50)}..." (similarity: ${similarity.toFixed(3)})`);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      item._embedding = itemEmbedding;
      uniqueItems.push(item);
    }
  }

  console.log(`  ✅ ${uniqueItems.length} unique items passed dedup (${newItems.length - uniqueItems.length} duplicates removed)`);
  return uniqueItems;
}

module.exports = { deduplicateItems };