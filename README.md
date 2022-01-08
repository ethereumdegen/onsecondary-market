# Onsecondary Market  
 
 Deployed at https://market.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### Description
 
 This NFT Marketplace is operated by three separate servers.  The API server, the HTML web server and the image server.  
 
 
 
#### Deploying to the image server 



#### Deploying to the web server 



#### Deploying to the api server
 


 
  

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
