FROM node

WORKDIR /app/task

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8006

CMD ["npm", "run", "dev"]