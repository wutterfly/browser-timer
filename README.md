# Browser Timer
 



## Start Up

Needs TLS Certs in certbot/conf/. Get them via certbot. Copy /etc/letsencrypt/ to certbot/conf/.
Start with 

    docker-compose up

The certbot container will exit while the nginx container should continue to run.

## Renew Certificate
<b>Important:</b> The nginx Server(on port 80) has to be running.

Execute the update.sh script. This should be done daily.

# References
[Certbot](https://certbot.eff.org/instructions)

[Setup Guide](https://mindsers.blog/post/https-using-nginx-certbot-docker/)