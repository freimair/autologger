#!/bin/sh

# if the server name is undefined, lets default to 'Some-Server'
SERVER="${1:-Some-Server}"

CORPORATION=My-Corp
GROUP=My-Corporate-Group
CITY=City
STATE=State
COUNTRY=US

CERT_AUTH_PASS=`openssl rand -base64 32`
echo $CERT_AUTH_PASS > cert_auth_password
CERT_AUTH_PASS=`cat cert_auth_password`

# create the certificate authority
openssl \
  req \
  -subj "/CN=$SERVER.ca/OU=$GROUP/O=$CORPORATION/L=$CITY/ST=$STATE/C=$COUNTRY" \
  -new \
  -x509 \
  -passout pass:$CERT_AUTH_PASS \
  -keyout ca-cert.key \
  -out ca-cert.crt \
  -days 36500

# create client private key (used to decrypt the cert we get from the CA)
openssl genrsa -out $SERVER.key

# create the CSR(Certitificate Signing Request)
openssl \
  req \
  -new \
  -nodes \
  -subj "/CN=$SERVER/OU=$GROUP/O=$CORPORATION/L=$CITY/ST=$STATE/C=$COUNTRY" \
  -key $SERVER.key \
  -out $SERVER.csr \
  -addext "subjectAltName=DNS:$SERVER" \
  -addext "extendedKeyUsage=serverAuth,clientAuth"

# sign the certificate with the certificate authority
openssl \
  x509 \
  -req \
  -days 36500 \
  -in $SERVER.csr \
  -CA ca-cert.crt \
  -CAkey ca-cert.key \
  -CAcreateserial \
  -out $SERVER.crt \
  -passin pass:$CERT_AUTH_PASS \
  -extfile <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:$SERVER\nextendedKeyUsage=serverAuth,clientAuth")) \
  -extensions SAN

cp  $SERVER.key privkey.pem
cat $SERVER.crt > fullchain.pem
cat ca-cert.crt >> fullchain.pem
