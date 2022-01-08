# Onsecondary Market  
 
 Deployed at https://market.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### Description
 
 This NFT Marketplace is operated by three separate servers.  The API server, the HTML web server and the image server.  
 


#### Pre-requisites 

> Recommended: Linux OS

> NodeJS V14

> MongoDB 



#### Testing this code locally
Clone this repo.  In one terminal,  run 'npm install' to intall packages then run 'npm run dev' to run the hot reloading web server on localhost:8080 and in the other, 'npm run api-dev' to boot a development API server on localhost:4000.   These will talk to one another automatically.  You will need to configure market-api-server/config/serverconfig.json with your RPC URL for web3 connection (rec. your own node, infura, or alchemyapi.)  

 
#### Deploying to the image server 
Use the /nginx/static.txt configuration for Nginx to statically host NFT images from any folder on the server.  The images can be fetched manually by running the scripts in market-api-server/tasks.   They should be organized in folders by collection name and named '0.jpg' for token 0 and so on.  

You must point the webcode at this image server (imageApiRoot) by using the config file 'src/config/FrontEndConfig.json'.



#### Deploying to the api server
The most complex server to commission and maintain, the api server is unique in that is runs active processes and scripts continuously.  
Clone this repo and run the 'npm run api' command to boot the api server.  You will need to set up certain configuration files.

You must point the webcode at this api server (marketApiRoot) by using the config file 'src/config/FrontEndConfig.json'.

#### Deploying to the web server 
Clone this repo and run the 'npm run build' command to compile web code into /dist.  Use the /nginx/static.txt configuration for Nginx to statically host this /dist folder.
  
  

### Development commands
```
npm install
npm run api-dev  (in terminal 1 - backend server)
npm run dev  (in terminal 2 - frontend server)
```

### Production commands
```
npm install
npm run build
npm run api
```
 



## run fetch scripts 
npm run fetchCoolcatsData -- images



 ### Start with pm2 
 pm2 start pm2.config.json --env production 
 
 
 ## Useful Commands
 
#resize image files 
mogrify -resize 631x631 ./*.jpg

## copy images to dist 
cd dist/images
cp -r ../../../images/doodles/* doodles/
cp -r ../../../images/coolcats/* coolcats/
