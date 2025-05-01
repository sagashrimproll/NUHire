FROM node:20-alpine as builder

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc-dev \
    pixman-dev \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    libpng-dev \
    pkgconfig

# Copy package files explicitly for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm config set fetch-retry-maxtimeout 60000
RUN npm install

# Copy the entire project, including next-env.d.ts if it exists
COPY . .

# Build the application
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts 

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production

# Start the application
CMD ["npm", "start"]