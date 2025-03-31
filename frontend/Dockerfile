FROM node:20-alpine

WORKDIR /app

# COPY package.json package-lock.json ./
COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]