# ═══════════════ STAGE 1: BUILD ═══════════════
# Start from an official image that already has Node.js 22 installed.
# "alpine" is a very small Linux, which keeps the image small.
FROM node:22-alpine AS builder

# All following commands run inside this folder in the image
WORKDIR /app

# Copy ONLY package files first, then install.
# Docker caches each step, so if package.json didn't change,
# it skips the slow npm install on the next build.
COPY package*.json ./
RUN npm ci

# Now copy the TypeScript source and compile it to JavaScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ═══════════════ STAGE 2: RUN ═══════════════
# Start again from a clean, small image
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install ONLY the packages needed to run (no TypeScript, tsx, esbuild...)
COPY package*.json ./
RUN npm ci --omit=dev

# Take just the compiled JavaScript from stage 1
COPY --from=builder /app/dist ./dist

# Don't run as the all-powerful "root" user; use the safer built-in "node" user
USER node

# Documentation: this app listens on port 3000
EXPOSE 3000

# The command that runs when the container starts
CMD ["node", "dist/server.js"]