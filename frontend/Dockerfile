FROM node:22-alpine

# Install dependencies for Next.js and some common native builds
RUN apk add --no-cache \
    python3 make g++ libc-dev pkgconfig \
    pixman-dev cairo-dev pango-dev jpeg-dev \
    giflib-dev libpng-dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000
ENV NODE_ENV=development

# Start dev server
CMD ["npm", "run", "dev"]