#! /usr/bin/bash

# Update certificate
docker-compose -f docker-compose-LE.yml up

# Update nginx configs
docker compose -f docker-compose.yml up --force-recreate -d
