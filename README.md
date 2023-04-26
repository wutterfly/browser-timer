# Browser Timer
 



## Start Up

Needs TLS Certs in certbot/conf/. Get them via certbot. Copy /etc/letsencrypt/ to certbot/conf/.
Start with 

    docker-compose up

The certbot container will exit while the nginx container should continue to run.

## Renew Certificate
<b>Important:</b> The nginx Server(on port 80) has to be running.

    docker-compose run --rm certbot renew
    docker-compose restart

This should be done daily. Certbot will check if new certs are needed, afterwards nginx is restarted to load new certs.

# References
[Certbot](https://certbot.eff.org/instructions)

[Setup Guide](https://mindsers.blog/post/https-using-nginx-certbot-docker/)