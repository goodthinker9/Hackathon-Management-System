FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
RUN mkdir -p uploads/avatars && chown -R node:node uploads

ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD ["npm", "start"]
