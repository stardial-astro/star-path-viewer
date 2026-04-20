#!/bin/bash

MODE=$1  # dev | dev:ssl | preview | preview:ssl

SSL_ARGS="--local-protocol https --https-cert-path localhost.pem --https-key-path localhost-key.pem"

cleanup() {
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null
    wait $VITE_PID 2>/dev/null
  fi
}

run_dev() {
  local extra_args=$1
  vite build --mode preview --watch &
  VITE_PID=$!
  trap cleanup EXIT INT TERM
  wrangler pages dev dist --live-reload --ip 0.0.0.0 $extra_args
}

case $MODE in
  dev)
    run_dev
    ;;

  dev:ssl)
    run_dev "$SSL_ARGS"
    ;;

  preview)
    vite build --mode preview && wrangler pages dev dist --ip 0.0.0.0
    ;;

  preview:ssl)
    vite build --mode preview && wrangler pages dev dist --ip 0.0.0.0 $SSL_ARGS
    ;;

  *)
    echo "Usage: $0 [dev|dev:ssl|preview|preview:ssl]"
    exit 1
    ;;
esac