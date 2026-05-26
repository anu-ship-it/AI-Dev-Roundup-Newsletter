# We use Node 20 on Alpine Linux — Alpine is a tiny OS (~5MB)
# which keeps our Docker image small and fast to build
FROM node:20-alpine

# Set the working directory inside the container
# All our code will live at /app
WORKDIR /app

# Copy package files first (before copying source code)
# Docker caches each step — if package.json hasn't changed,
# it won't re-run npm install on every build. Big time saver.
COPY package*.json ./

# Install dependencies
RUN npm install

# Now copy the rest of our source code
COPY . .

# The command that runs when the container starts
CMD ["node", "src/index.js"]