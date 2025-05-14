# Offizielles Ubuntu 18.04 als Basis
FROM ubuntu:18.04

# Installiere nginx und curl 
# durch '&&' einem Layer / Schicht
RUN apt-get update \
   && apt-get upgrade -y \
   && apt-get install -y nginx curl \
   && rm -rf /var/lib/apt/lists/*

#COPY ./html /usr/share/nginx/html
COPY ./html /var/www/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
