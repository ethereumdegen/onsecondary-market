
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
  
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
 
const collectionName = 'coolcats'

async function runTask(){

    const myArgs = process.argv.slice(2);
    console.log('myArgs',myArgs)
    if(myArgs[0] == 'images'){
        downloadImages = true
    }
    console.log('download images: ', downloadImages)

    let startIndex = 9930
    let totalSupply = 10000

    let tokenIds = [] 
    let failedRequestIds = []

    let traitsMap = {} 
    

    for(let tokenId=startIndex; tokenId<=totalSupply; tokenId+=1){

    
        //let URI = `https://api.opensea.io/api/v1/assets?order_direction=desc&offset=${offset}&limit=50&collection=${collectionName}`

        
        let URI = `https://api.coolcatsnft.com/cat/${tokenId}`
        console.log(URI)

        try{
            await delay(1000)

            const res = await axios.get( URI )

            console.log(res.data) 

                
                tokenIds.push(tokenId)

                if(downloadImages){
                    //let imageIPFSHash = res.data.image.split('://')[1]

                    let imageURL = res.data.ipfs_image //`https://ipfs.io/ipfs/${imageIPFSHash}`
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

    if(!url) { 
        console.log('WARN image url is ', url)
        return
     }
        
    let existingImage = fs.existsSync(image_path ); 
    if(existingImage) { 
        console.log(tokenId,' already exists')
        return
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