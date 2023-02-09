FROM node:19
WORKDIR twitch-and-tooty
COPY package.json ./
COPY package.lock ./
RUN npm i
COPY . ./
CMD ["node", "twitch-and-toot.js"]
