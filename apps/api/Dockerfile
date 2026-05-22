FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @wpp-recebo/shared build
RUN pnpm --filter @wpp-recebo/api build

FROM node:22-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm && apk add --no-cache openssl
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN cd apps/api && npx prisma generate
EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
