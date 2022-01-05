# Onsecondary Market  
 
 Deployed at https://market.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### TODO  
 
 -build a bot for api (like genie ) 
 -implement all mutant images 
 



 mogrify -resize 631x631 ./*.jpg


 -- need to be able to easily do 'GenerateContractDataLookupTask' on web server 
-- failed doodles -> [ 183, 184, 185, 186, 187, 4398 ]

 


 BUG: posting a new order -> it does not show up on tile . Only after clearing that new orders's LastPolledAt will the tile update .   .. odd

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


## run fetch scripts 
npm run fetchCoolcatsData -- images



 ### Start with pm2 
 pm2 start pm2.config.json --env production 


