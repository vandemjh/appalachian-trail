FROM node
RUN mkdir -p /serve
WORKDIR /serve
COPY package.json /serve
RUN npm install
COPY . /serve
CMD ["npm", "start", "--prod"]