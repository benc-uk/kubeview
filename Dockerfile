#
# Build and bundle the Vue.js app with Vue CLI 3 https://cli.vuejs.org/
#
FROM node:10-alpine as spabuild
ARG vue_root="client"

WORKDIR /build

# Install all the Vue.js dev tools & CLI, and our app dependencies 
COPY ${vue_root}/package*.json ./
RUN npm install --silent

# Copy in the Vue.js app source
COPY ${vue_root}/.env.production .
COPY ${vue_root}/.eslintrc.js .
COPY ${vue_root}/public ./public
COPY ${vue_root}/src ./src

# Run Vue CLI build & bundle, and output to ./dist
# Updated to run in modern mode https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode
RUN npm run build

# ===================================================================== #

#
# Build Node.js Express server service, pulling in bundled output from previous step
#
FROM node:10-alpine

LABEL version="0.0.9" 
ARG basedir="server"
ENV NODE_ENV production

# Place our app here
WORKDIR /home/app

# Install bash inside container just for debugging 
RUN apk update && apk add bash

# NPM install packages
COPY ${basedir}/package*.json ./
RUN npm install --production --silent

# NPM is done, now copy in the the whole project to the workdir
COPY ${basedir}/ .

# Copy in Vue.js app, uses previous build step 'spabuild' as source
COPY --from=spabuild /build/dist .

EXPOSE 3000
ENTRYPOINT [ "npm" , "start" ]