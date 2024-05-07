# TinyGS satellite monitor

This project is based on NASA OpenMCT. Currently the monitor can only track one satellite at a time. Future versions may include new functions and improvements. The docker in its default configuration, broadcasts its Web server on localhost:8080.

How to build:
```
docker volume create sat-db
docker build -t openmct-tinygs .
```

How to run:
```
docker run -ti -dp 127.0.0.1:8080:8080 --mount type=volume,src=sat-db,target=/etc/db openmct-tinygs
```

Attach to stream (skip this step if not needed):
```
docker exec -it <docker-id> /bin/sh
```

Resources used in this project:
- TinyGS Cesium viewer, [link](https://viewer.tinygs.com)
- TinyGS API, [link](https://api.tinygs.com)
- OpenMCT tutorial base project, [link](https://github.com/nasa/openmct-tutorial)
