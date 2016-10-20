#!/bin/bash

set -e

docker-compose build
docker-compose up -d
cd site
npm start
