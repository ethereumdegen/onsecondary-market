
/*
A script that you run manually to pull data out of opensea's api 

> npm run fetchCollectionData

*/


import axios from 'axios'

import fs from 'fs'
import path from 'path'
 
import FileHelper from '../lib/file-helper.js'
 
 const downloadImages = false 
 const writeTraitsFile = true 
 
let fetchConfig = FileHelper.readJSONFile('./market-api-server/tasks/fetchConfig.json')
 



async function runTask(){



let totalSupply = fetchConfig.totalSupply

let collectionName = fetchConfig.collectionName
 
let contractData


let tokenIds = [] 


let traitsMap = {} 
  

for(let offset=0; offset<totalSupply; offset+=50){


    let URI = `https://api.opensea.io/api/v1/assets?order_direction=desc&offset=${offset}&limit=50&collection=${collectionName}`
    
    console.log(URI)

    try{
        const res = await axios.get( URI )

        console.log(res) 

        for(let asset of res.data.assets){ 
            
            tokenIds.push(asset.token_id)

            if(downloadImages){
                await downloadImage(asset.token_id, asset.image_url)
            } 
        
            traitsMap[asset.token_id] = asset.traits 


        }

        if(!contractData){
            contractData = res.data.assets[0].asset_contract

            console.log(contractData)
        }
    }catch(e){
        console.log(e)
    }

} 
 


if(writeTraitsFile)
{
    fs.writeFileSync( path.join ( "./market-api-server/output/outputconfig.json" ) , JSON.stringify( traitsMap ) );
}
 



}


runTask() 




async function  downloadImage(tokenId, url){
  
    //console.log('dl images', tokenId)
   // if(tokenId == 2484 || tokenId== 3875 || tokenId == 2160 || tokenId == 4700 
   //     || tokenId == 2841) return 

    let image_path = path.join ( `./market-api-server/output/images/${tokenId}.jpg` )


        
    let existingImage = fs.existsSync(image_path ); 
    if(existingImage) { 
        console.log(tokenId,' already exists')
     }


    return new Promise(async (resolve, reject) => {
        const writer = fs.createWriteStream(image_path)

         
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)
    

        writer.on('finish', () => resolve())
        writer.on('error', reject)
    })

}