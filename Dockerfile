FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN yarn build
EXPOSE 8002
CMD ["yarn", "start"]