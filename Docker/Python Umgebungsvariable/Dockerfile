# Ubuntu als Basis
FROM ubuntu

# Umgebungsvariable ARG
ARG install_software=python3

RUN apt-get update && apt-get install -y $install_software
WORKDIR /project
COPY ./main.py .

# Umgebungsvariable ENV
ENV PROGRAM=python3

# CMD ["PROGRAM","main.py"] funktioniert nicht, sondern es muss eine Shell dazwischen geschaltet werden
# CMD in Shell-Form ausführen, aber mit JSON-Argumenten für bessere Signalbehandlung
CMD ["/bin/sh", "-c", "$PROGRAM main.py"]
