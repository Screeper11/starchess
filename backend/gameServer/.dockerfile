FROM jarredsumner/bun:edge

RUN mkdir /backend
COPY . /backend
WORKDIR /backend

RUN bun install

EXPOSE 4001

CMD ["bun", "start"]
