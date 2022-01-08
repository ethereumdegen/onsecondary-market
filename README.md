# Onsecondary Market  
 
 Deployed at https://market.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### Description
 
 
 


 
  

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
