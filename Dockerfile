FROM node:18-alpine as builder

COPY package*.json .

WORKDIR /app

RUN npm config set fetch-retry-maxtimeout 60000

RUN npm install 

COPY . .

RUN npm run build

RUN ls -la /app/.next

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app .

RUN npm install --production

EXPOSE 3000

CMD ["npm","start"]