FROM redshelf/chrome-node:nvm

COPY package.json /srv/app/package.json

WORKDIR /srv/app/

ARG NPM_TOKEN
RUN NPM_TOKEN=$NPM_TOKEN npm i

COPY . /srv/app

