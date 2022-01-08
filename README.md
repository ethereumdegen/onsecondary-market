# Onsecondary Market  
 
 Deployed at https://market.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### Description
 
 This NFT Marketplace is operated by three separate servers.  The API server, the HTML web server and the image server.  
 


#### Pre-requisites 
Recommended: Linux OS
NodeJS V14
MongoDB 


 
#### Deploying to the image server 
Use the /nginx/static.txt configuration for Nginx to statically host NFT images from any folder on the server.  The images can be fetched manually by running the scripts in market-api-server/tasks.   They should be organized in folders by collection name and named '0.jpg' for token 0 and so on.  

You must point the webcode at this image server (imageApiRoot) by using the config file 'src/config/FrontEndConfig.json'.



#### Deploying to the api server
The most complex server to commission and maintain, the api server is unique in that is runs active processes and scripts continuously.  




#### Deploying to the web server 
run the 'npm run build' command to compile web code into /dist.  Use the /nginx/static.txt configuration for Nginx to statically host this /dist folder.
  
  

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
