node dockerfile.js > Dockerfile.gen
docker build . -f Dockerfile.gen -t raxa
