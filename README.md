# Onsecondary Market  
 
 Deployed at https://market.onsecondary.com
 
  
 Monolithic repo for api server, image server, web server 


### TODO  
 
 -build a bot for api (like genie ) 
 -implement all mutant images 
 



 mogrify -resize 631x631 ./*.jpg


 -- need to be able to easily do 'GenerateContractDataLookupTask' on web server 
-- failed doodles -> [ 183, 184, 185, 186, 187, 4398 ]

 


 -write a custom ERC721 indexer for vibegraph that will build mini-nft tiles as it goes , so i never need to poll ERC721 balance records . this will enable me to add many more NFT projects without detriment to polling 

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


