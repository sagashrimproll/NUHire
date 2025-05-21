FROM node:22-alpine AS builder

# Install system build dependencies
RUN apk add --no-cache \
    python3 make g++ libc-dev pkgconfig \
    pixman-dev cairo-dev pango-dev jpeg-dev \
    giflib-dev libpng-dev

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV production

CMD ["npm", "start"]