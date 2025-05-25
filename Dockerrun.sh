if [ -z "${IMG_TAG}" ]; then
  IMG_TAG='v1.0.0'
fi

echo Using image tag $IMG_TAG

if [ ! -f "config.ts" ]
then
  echo Configuration file config.ts not found.
  exit
fi

# Items that require persistence
#   config.ts

# Argument order matters!

docker run \
  -p 3000:3000 \
  -t \
  -i \
  -e "TERM=xterm-256color" \
  -v ./config.ts:/app/constants/config.ts \
  jchristn/litegraph-ui:$IMG_TAG
