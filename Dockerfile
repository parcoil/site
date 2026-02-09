FROM node:24-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
RUN rm -rf node_modules/@next/third-parties
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100
RUN pnpm install && pnpm run build
EXPOSE 3100
CMD ["pnpm", "run", "start"]
