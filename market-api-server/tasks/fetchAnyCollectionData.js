
/*
A script that you run manually to pull data out of opensea's api 

> npm run fetchCollectionData

*/


import axios from 'axios'

import fs from 'fs'
import path from 'path'
import AppHelper from '../lib/app-helper.js'

import Web3 from 'web3'
import FileHelper from '../lib/file-helper.js'
 
let downloadImages = true 
let writeTraitsFile = true 
  
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const nftContractABI =  FileHelper.readJSONFile('src/contracts/ERC721ABI.json')  

let envmode = process.env.NODE_ENV

if(!envmode){
    envmode = 'production'
}

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]

async function runTask(){


    let web3 = new Web3(new Web3.providers.WebsocketProvider( serverConfig.web3provider, {
        clientConfig: {
          maxReceivedFrameSize: 100000000,
          maxReceivedMessageSize: 100000000,
        }
      }));

    const myArgs = process.argv.slice(2);


    if(!myArgs[0]){
        console.log('ERROR: Must specify an nft contract address')
        return
    }

    let nftContractAddress = AppHelper.toChecksumAddress(myArgs[0])


    if(myArgs[1] == 'images'){
        downloadImages = true
    }
    console.log('download images: ', downloadImages)


     
   
    let tokenIds = [] 
    let failedRequestIds = []

    let traitsMap = {} 



    let metadataURI = fetchMetadataURI( nftContractAddress, web3 )

    let totalSupply = fetchTotalSupply( nftContractAddress, web3)
    

    for(let tokenId=0; tokenId<totalSupply; tokenId+=1){


        

        let URI = `${metadataURI}/${tokenId}`
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
                    await downloadImage(nftContractAddress, tokenId, imageURL)
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
        fs.writeFileSync( path.join ( `./market-api-server/output/${nftContractAddress}.json` ) , JSON.stringify( traitsMap ) );
    }
    
 
console.log('failed:',failedRequestIds)


}


runTask() 



async function fetchMetadataURI(nftContractAddress, web3){
    let nftContract = await new web3.eth.Contract(nftContractABI, nftContractAddress)

    let result = await nftContract.methods.tokenURI( 1 ).call()

    console.log('metadata uri ', result)

    return result
}



async function fetchTotalSupply(nftContractAddress, web3){
    let nftContract = await new web3.eth.Contract(nftContractABI, nftContractAddress)

    let result = await nftContract.methods.totalSupply(  ).call()

    console.log('total supply ', result)

    return result
}



async function  downloadImage(nftContractAddress, tokenId, url){
  
   
    let image_path = path.join ( `./market-api-server/output/images/${nftContractAddress}/${tokenId}.jpg` )


        
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