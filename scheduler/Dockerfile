FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set explicit cache path so model is found at runtime
ENV TRANSFORMERS_CACHE=/app/.cache
ENV XDG_CACHE_HOME=/app/.cache

# Pre-download model to the explicit path
RUN node -e "const { pipeline } = require('@xenova/transformers'); pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2').then(() => { console.log('Model downloaded'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });"

CMD ["node", "src/index.js"]
