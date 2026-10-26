FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN mkdir -p uploads && chown node:node uploads

ENV NODE_ENV=production
EXPOSE 5000

USER node
CMD ["npm", "start"]
