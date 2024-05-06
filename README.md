How to build:
```
docker volume create sat-db
docker build -t openmct-tinygs .
```

How to run:
```
docker run -ti -dp 127.0.0.1:8080:8080 --mount type=volume,src=sat-db,target=/etc/db openmct-tinygs
```

Attach to stream:
```
docker exec -it <docker-id> /bin/sh
```