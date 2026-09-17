#!/usr/bin/env bash
set -euo pipefail

COMMAND=${1:-}

case "$COMMAND" in
  build | push) ;;
  "")
    echo "No command specified" >&2
    exit 1
    ;;
  *)
    echo "Unsupported command: $COMMAND" >&2
    exit 1
    ;;
esac

COMMIT=$(git rev-parse --short HEAD)
DATE=$(date +%Y%m%d%H%M%S)
PLATFORMS=linux/amd64,linux/arm64
MULTIARCH_BUILDER=${MULTIARCH_BUILDER:-alpakalypse-now}
IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-europe-docker.pkg.dev/cloudogu-backend/team-rapid-public/alpakalypse-now}
IMAGE_TAG=${IMAGE_TAG:-$DATE-$COMMIT}
IMAGE=$IMAGE_REPOSITORY:$IMAGE_TAG
IMAGE_LOCAL=alpakalypse-now

if ! docker buildx inspect "$MULTIARCH_BUILDER" >/dev/null 2>&1; then
  docker buildx create \
    --name "$MULTIARCH_BUILDER" \
    --driver docker-container >/dev/null
fi

docker buildx inspect "$MULTIARCH_BUILDER" --bootstrap >/dev/null

if [ "$COMMAND" = "push" ]; then
  docker buildx build \
    --builder "$MULTIARCH_BUILDER" \
    --platform "$PLATFORMS" \
    --tag "$IMAGE" \
    --push \
    .

  echo "Multi-arch Docker image pushed: $IMAGE ($PLATFORMS)"
else
  docker buildx build \
    --builder "$MULTIARCH_BUILDER" \
    --tag "$IMAGE" \
    --tag "$IMAGE_LOCAL" \
    --load \
    .

  echo "Local Docker image built and loaded: $IMAGE_LOCAL (host architecture)"
fi
