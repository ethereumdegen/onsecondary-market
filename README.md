# BAYC Market Web
 
 Deployed at https://baycmarket.io
 
  
 


### TODO  
 
- build a bot that can be run locally (easily) with html frontend for placing bids on certain types of toadz 
 

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
cp -r ../../../images/boredapes/* boredapes/
cp -r ../../../images/mutantapes/* mutantapes/




 ### Start with pm2 
 pm2 start pm2.config.json --env production 


