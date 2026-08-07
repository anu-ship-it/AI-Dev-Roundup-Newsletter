// dedup.js — Embeddings-based deduplication using Groq
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

async function getEmbedding(text) {
  const response = await groq.embeddings.create({
    model: "nomic-embed-text-v1_5",
    input: text.substring(0, 512),
  });
  return response.data[0].embedding;
}

async function deduplicateItems(newItems, existingItems) {
  console.log(`\nDeduplication: checking ${newItems.length} items...`);

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
    const itemEmbedding = await getEmbedding(`${item.title} ${item.description}`);

    let isDuplicate = false;
    for (let i = 0; i < existingEmbeddings.length; i++) {
      const similarity = cosineSimilarity(itemEmbedding, existingEmbeddings[i]);
      if (similarity > 0.92) {
        console.log(`  Skipping duplicate: "${item.title.substring(0, 50)}..."`);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) uniqueItems.push(item);
  }

  console.log(`  ${uniqueItems.length} unique items passed dedup`);
  return uniqueItems;
}

module.exports = { deduplicateItems };
