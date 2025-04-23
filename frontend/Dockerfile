FROM node:18-alpine

RUN npm install
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc-dev \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    libpng-dev

WORKDIR /app

# COPY package.json package-lock.json ./
COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]