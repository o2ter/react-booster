#!/bin/bash
set -e

usage() { echo "Usage: $0 [-p] [-w]" 1>&2; exit 1; }

while getopts "pw" o; do
  case "${o}" in
    p)
      PRODUCTION=true
      ;;
    w)
      WATCH=true
      ;;
    *)
      usage
      ;;
  esac
done
shift $((OPTIND-1))

SCRIPT="npx webpack -c $( dirname $( realpath "${BASH_SOURCE[0]}" ) )/../webpack.js"

if [ $PRODUCTION ]; then
   SCRIPT="$SCRIPT --mode production"
else
   SCRIPT="$SCRIPT --mode development"
fi

if [ $WATCH ]; then
   SCRIPT="$SCRIPT --watch"
fi

exec $SCRIPT
