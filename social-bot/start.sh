docker run -d \
    --name social-bot \
    --restart=on-failure \
    -p 443:443 \
    -v `pwd`/pictures.json:/serve/pictures.json \
    `docker build . -q`