# Browser Timer
 



## Start Up

Needs TLS Certs in certbot/conf/. Get them via certbot. Copy /etc/letsencrypt/ to certbot/conf/.
Start with 

    docker-compose up

Starts the https servers and a proxy that will redirect certificate renewal traffic to certbot.

## Renew Certificate
<b>Important:</b> The nginx Server (on port 80) has to be running.

Execute the update.sh script. This should be done daily.

# References
[Certbot](https://certbot.eff.org/instructions)

[Setup Guide](https://stackoverflow.com/questions/66638368/how-to-do-auto-renewal-of-tls-certificates-with-certbot)