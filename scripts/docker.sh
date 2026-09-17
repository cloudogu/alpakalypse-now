#!/bin/bash
set -euo pipefail

COMMAND=$1

if [ -z "$COMMAND" ]; then
  echo "No command specified"
  exit 1
fi

if [ "$COMMAND" != "build" ] && [ "$COMMAND" != "push" ]; then
  echo "Unsupported command: $COMMAND"
  exit 1
fi

COMMIT=$(git rev-parse --short HEAD)
DATE=$(date +%Y%m%d%H%M%S)
IMAGE=europe-docker.pkg.dev/cloudogu-backend/team-rapid-public/alpakalypse-now:$DATE-$COMMIT

docker build -t $IMAGE .

  if [ $? -eq 0 ]; then
    echo "Docker build succeeded: $IMAGE"
  else
    echo "Docker build failed"
    exit 1
  fi
  
if [ "$COMMAND" = "push" ]; then
  docker push $IMAGE

  if [ $? -eq 0 ]; then
    echo "Docker push succeeded: $IMAGE"
  else
    echo "Docker push failed"
    exit 1
  fi
fi
