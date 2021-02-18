FROM node
RUN mkdir -p /serve
WORKDIR /serve
COPY package.json /serve
RUN npm install
COPY . /serve
EXPOSE 80
CMD ["npm", "start", "--prod"]