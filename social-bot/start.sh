docker run -d \
    --name social-bot \
    --restart=on-failure \
    -p 80:80 \
    -v `pwd`:/serve \
    `docker build . -q`