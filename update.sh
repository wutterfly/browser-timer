#! /usr/bin/bash

# Update certificate
docker-compose run --rm certbot renew

# Restart nginx
docker-compose restart