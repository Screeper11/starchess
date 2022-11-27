FROM jarredsumner/bun:edge

RUN mkdir /backend
COPY . /backend
WORKDIR /backend

RUN bun install

CMD ["bun", "start"]
