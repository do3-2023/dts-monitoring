## Use Node Slim image
FROM node:14-slim as buildContainer

WORKDIR /app
COPY ./package.json ./package-lock.json /app/

RUN npm install
COPY . /app
RUN npm run build:ssr

# Creates a "dist" folder with the production build
RUN npm run build:ssr

FROM node:14-slim
WORKDIR /app
# Copy dependency definitions
COPY --from=buildContainer /app/package.json /app

# Get all the code needed to run the app
COPY --from=buildContainer /app/dist /app/dist

EXPOSE 4000

## Start the application
CMD ["node", "/app/dist/hello-world/server/main.js"]
