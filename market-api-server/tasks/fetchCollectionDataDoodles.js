
/*
A script that you run manually to pull data out of opensea's api 

> npm run fetchCollectionData

*/


import axios from 'axios'

import fs from 'fs'
import path from 'path'
 
import FileHelper from '../lib/file-helper.js'
 
let downloadImages = false 
let writeTraitsFile = true 
 
//let fetchConfig = FileHelper.readJSONFile('./market-api-server/tasks/fetchConfig.json')
 
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
 

const collectionName = 'doodles'


async function runTask(){

    const myArgs = process.argv.slice(2);
 
    if(myArgs[0] == 'images'){
        downloadImages = true
    }

    let totalSupply = 10000
    


    let tokenIds = [] 
    let failedRequestIds = []

    let traitsMap = {} 
    

    for(let tokenId=0; tokenId<=totalSupply; tokenId+=1){

        let metadataIPFSHash = 'QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS'
    
        let URI = `https://ipfs.io/ipfs/${metadataIPFSHash}/${tokenId}`
        console.log(URI)

        try{
            await delay(1000)

            const res = await axios.get( URI )

            console.log(res.data) 

                
                tokenIds.push(tokenId)

                if(downloadImages){
                    let imageIPFSHash = res.data.image.split('://')[1]

                    let imageURL = `https://ipfs.io/ipfs/${imageIPFSHash}`
                    await downloadImage(tokenId, imageURL)
                } 
            
                traitsMap[tokenId] = res.data.attributes 


        
        }catch(e){
            failedRequestIds.push(tokenId)
            console.log(e)
        }

    } 
    


    if(writeTraitsFile)
    {
        fs.writeFileSync( path.join ( `./market-api-server/output/${collectionName}.json` ) , JSON.stringify( traitsMap ) );
    }
    
    console.log('failed:',failedRequestIds)


}


runTask() 




async function  downloadImage(tokenId, url){
  
   
    let image_path = path.join ( `./market-api-server/output/images/${collectionName}/${tokenId}.jpg` )


        
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