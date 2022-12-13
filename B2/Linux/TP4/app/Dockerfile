FROM node:alpine
WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY package*.json .
COPY pnpm*.yaml .
RUN pnpm install

COPY . .

RUN pnpx prisma generate

RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "run", "start"]