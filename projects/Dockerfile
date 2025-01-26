FROM node

WORKDIR /app/projects

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8005

CMD ["npm", "run", "dev"]