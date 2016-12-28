# README #

## Signaling server setup ##

  1. Go to ./signalingserver directory
  2. Run ´npm install´
  3. Run node server.js

## Development ##

Setup the development environment by installing the required dependencies
for webapp, signalinservice and jsapp.

´cd webservice && npm install´
´cd ../signalingservice && npm install´
´cd ../jsapp && npm install´

## Production ##

Production dependencies are installed with the ´production´-flag (´npm install --production´).

Production version should be run using a deamon, such as ´pm2´ or ´forever´.




