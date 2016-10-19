#!/bin/bash

set -e

cd site
npm run build
cd ..
docker-compose build
docker-compose up
