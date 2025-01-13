FROM node:latest
WORKDIR /runner
COPY . .
RUN npm install -g nodemon
WORKDIR /runner/ctk 
RUN npm install
CMD ["nodemon", "index.js", "--ignore", "pmtest.json", "--ignore", "TMFENV.json", "--ignore", "*environment.json"]