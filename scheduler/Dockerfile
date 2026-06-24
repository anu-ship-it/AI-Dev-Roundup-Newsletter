FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

# Pre-download the embedding model during build
# So it's available offline at runtime on ECS
RUN node -e "const { pipeline } = require('@xenova/transformers'); pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2').then(() => { console.log('Model downloaded'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });"

COPY . .

CMD ["node", "src/index.js"]
