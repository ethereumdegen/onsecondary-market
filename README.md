# Onsecondary Market  
 
 Deployed at https://doodles.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### TODO  
 
 

 mogrify -resize 631x631 ./*.jpg

 

### Development commands
```
npm install
npm run server-dev  (in terminal 1 - backend server)
npm run dev  (in terminal 2 - frontend server)
```

### Production commands
```
npm install
npm run build
npm run server
```
 
## copy images to dist 
cd dist/images
cp -r ../../../images/doodles/* doodles/
cp -r ../../../images/coolcats/* coolcats/




 ### Start with pm2 
 pm2 start pm2.config.json --env production 


