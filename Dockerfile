FROM jchristn/litegraph-ui-base:v1.0.0
WORKDIR /app
COPY src/. .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD [ "npm", "run", "start" ]
