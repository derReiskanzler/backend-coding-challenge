FROM docker.io/node:lts-alpine AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production=false && npm cache clean --force
COPY . .

FROM base AS build
RUN npx nx build be-auth-service --prod

FROM docker.io/node:lts-alpine AS production

WORKDIR /app

COPY --from=build --chown=nestjs:nodejs /app/dist/apps/be-auth-service ./
RUN npm ci --only=production && npm cache clean --force
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "main.js"]
