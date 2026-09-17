FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG SITE_BASE=/
ARG SITE_URL=http://localhost:4321
ENV SITE_BASE=${SITE_BASE}
ENV SITE_URL=${SITE_URL}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist /site
COPY server.mjs ./server.mjs
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
