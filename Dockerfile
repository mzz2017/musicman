FROM node
MAINTAINER mzz2017
RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY 8vy0e26uvw11w4k
ENV PM2_SECRET_KEY weot16tvbn11yto

WORKDIR /app/
ADD app.js /app/
RUN npm install express
RUN npm install body-parser
RUN npm install axios

EXPOSE 9000
ENTRYPOINT ["pm2","start","--no-daemon","app.js"]
