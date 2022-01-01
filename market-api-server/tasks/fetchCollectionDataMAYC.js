
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
 
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
 


async function runTask(){


  

let tokenIds = [] 
let failedRequestIds = []

let traitsMap = {} 
  

for(let tokenId=0; tokenId<20000; tokenId+=1){


    //let URI = `https://api.opensea.io/api/v1/assets?order_direction=desc&offset=${offset}&limit=50&collection=${collectionName}`

    
    let URI = `https://boredapeyachtclub.com/api/mutants/${tokenId}`
    console.log(URI)

    try{
        await delay(1000)

        const res = await axios.get( URI )

        console.log(res.data) 

       // for(let asset of res.data.assets){ 
            
            tokenIds.push(tokenId)

            if(downloadImages){
                let imageIPFSHash = res.data.image.split('://')[1]

                let imageURL = `https://ipfs.io/ipfs/${imageIPFSHash}`
                await downloadImage(imageURL)
            } 
        
            traitsMap[tokenId] = res.data.attributes 


       // }

        /*if(!contractData){
            contractData = res.data.assets[0].asset_contract

            console.log(contractData)
        }*/
    }catch(e){
        failedRequestIds.push(tokenId)
        console.log(e)
    }

} 
 


if(writeTraitsFile)
{
    fs.writeFileSync( path.join ( "./market-api-server/output/outputconfig.json" ) , JSON.stringify( traitsMap ) );
}
 
console.log('failed:',failedRequestIds)


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