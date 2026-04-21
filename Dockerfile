FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY skypulse.db ./skypulse.db

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
