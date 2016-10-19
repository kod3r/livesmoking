#!/bin/bash

set -e

cd site
docker build -t vespakoen/livesmoking:latest .
docker push vespakoen/livesmoking
cd ../signal-server
docker build -t vespakoen/signal-server:latest .
docker push vespakoen/signal-server
