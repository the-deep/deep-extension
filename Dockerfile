FROM node:17-buster-slim AS base

MAINTAINER togglecorp info@togglecorp.com

RUN apt update -y \
    && apt install -y --no-install-recommends git bash

WORKDIR /code

FROM base AS full-client

COPY ./package.json ./yarn.lock /code/
RUN yarn install --frozen-lockfile

COPY . /code/
