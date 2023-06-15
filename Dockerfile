# syntax=docker/dockerfile:1
   
FROM node:16-alpine
RUN mkdir -p /app/
WORKDIR /app/
COPY . .
RUN npm ci
CMD ["node", "src/server.js"]
EXPOSE 3000