FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["node", "./src/index.js"]
