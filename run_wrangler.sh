#!/bin/bash

MODE=$1  # dev | dev:ssl | preview | preview:ssl

IP_ARGS='--ip 0.0.0.0 --port 8788'
SSL_ARGS='--local-protocol https --https-cert-path localhost.pem --https-key-path localhost-key.pem'

cleanup() {
  if [ -n "$VITE_PID" ]; then
    echo '> Cleaning up process group...'
    kill -$VITE_PID 2>/dev/null
    echo '> Cleaning background jobs...'
    jobs -p | xargs -r kill
    wait
    # Verify (should be empty)
    pgrep -fl "$(pwd).*vite.* build.* --watch"
    jobs -l
    echo 'Completed.'
  fi
}

run_dev() {
  local extra_args=$1
  prev_vite=$(pgrep -fl "$(pwd).*vite.* build.* --watch")
  if [ -n "$prev_vite" ]; then
    echo '> Cleaning up previous process:'
    echo $prev_vite
    pkill -f "$(pwd).*vite.* build.* --watch" 2>/dev/null
    echo 'Completed.'
  fi
  NODE_ENV=development vite build --mode development --watch &
  VITE_PID=$!
  trap cleanup EXIT INT TERM
  wrangler pages dev dist --live-reload $IP_ARGS $extra_args
}

case $MODE in
  dev)
    run_dev
    ;;

  dev:ssl)
    run_dev "$SSL_ARGS"
    ;;

  preview)
    vite build --mode preview && wrangler pages dev dist $IP_ARGS
    ;;

  preview:ssl)
    vite build --mode preview && wrangler pages dev dist $IP_ARGS $SSL_ARGS
    ;;

  *)
    echo "Usage: $0 [dev|dev:ssl|preview|preview:ssl]"
    exit 1
    ;;
esac
