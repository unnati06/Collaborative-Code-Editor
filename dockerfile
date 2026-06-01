# Build the Frontend [dist folder]
# Copy the dist folder content in Backend/public folder
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY ./client/package*.json ./
RUN npm install

COPY ./client .
RUN npm run build

# Backend
FROM node:20-alpine

WORKDIR /app

COPY ./server/package*.json ./
RUN npm install

COPY ./server .

COPY --from=frontend-builder /app/dist ./public

EXPOSE 5000

CMD ["node", "server.js"]