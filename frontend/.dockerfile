FROM jarredsumner/bun:edge

RUN mkdir /frontend
COPY . /frontend
WORKDIR /frontend

RUN bun install

EXPOSE 3000

CMD ["bun", "start"]
