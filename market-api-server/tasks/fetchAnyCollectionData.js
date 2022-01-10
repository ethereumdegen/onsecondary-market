
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


import svg2img from 'node-svg2img'
 
let downloadImages = false 
let writeTraitsFile = true 
  
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const nftContractABI =  FileHelper.readJSONFile('src/contracts/ERC721ABI.json')  

let envmode = process.env.NODE_ENV

if(!envmode){
    envmode = 'production'
}

let resolution = 240
let totalSupplyOverride = null

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


    if(myArgs[2] == 'images'){
        downloadImages = true
    }
    console.log('download images: ', downloadImages)


     
   
    let tokenIds = [] 
    let failedRequestIds = []

    let traitsMap = {} 



    

    let totalSupply = await fetchTotalSupply( nftContractAddress, web3)
    
    if(totalSupplyOverride){
        totalSupply = totalSupplyOverride
    }

    for(let tokenId=0; tokenId<totalSupply; tokenId+=1){

        let metadataURI = await fetchMetadataURI( nftContractAddress, tokenId, web3 )
        

        //let URI = `${metadataURI}`
        //console.log(URI)

        try{
            await delay(1000)

            //const res = await axios.get( URI )

            //console.log(res.data) 

            let metadata = await fetchMetadataBlob(  metadataURI  )

            console.log('metadata blob ', metadata)
 
                tokenIds.push(tokenId)

                if(downloadImages){
                   // let imageIPFSHash = metadata.image.split('://')[1]

                    //`https://ipfs.io/ipfs/${imageIPFSHash}`

                    let imageURL = parseImageURI( metadata.image ) 

                    await downloadImage(nftContractAddress, tokenId, imageURL)
                } 
            
                traitsMap[tokenId] = metadata.attributes 


        // }

            /*if(!contractData){
                contractData = res.data.assets[0].asset_contract

                console.log(contractData)
            }*/
        }catch(e){
            failedRequestIds.push(tokenId)
            console.log(e)
        }



    if(writeTraitsFile)
    {
        fs.writeFileSync( path.join ( `./market-api-server/output/${nftContractAddress}.json` ) , JSON.stringify( traitsMap ) );
    }

} 
 

 
 
console.log('failed:',failedRequestIds)


}


runTask() 



async function fetchMetadataURI(nftContractAddress, tokenId, web3){
    let nftContract = await new web3.eth.Contract(nftContractABI, nftContractAddress)

    try{
        let result = await nftContract.methods.tokenURI( tokenId ).call()

        console.log('metadata uri ', result)
    
        return result
    }catch(e){
        console.log(e)
        return null
    }
    
}

async function fetchMetadataBlob( uri ){

    if (typeof uri == 'string') {

        console.log('metadata uri ', uri)
        const isURL = /^(https?|ipfs):\/\//.test(uri)
        if ( isURL ) {
            console.log('using axios ')
          return await readHTTPUrl( uri )
        }
  
        //try to parse with base64
        const split = uri.split('base64,')[1]
        let base64data = split ? split : uri
  
        const output = Buffer.from(base64data, 'base64').toString('utf-8')
  
        return JSON.parse(output)
      }


      return null
}



async function fetchTotalSupply(nftContractAddress, web3){
    let nftContract = await new web3.eth.Contract(nftContractABI, nftContractAddress)

    let result = await nftContract.methods.totalSupply(  ).call()

    console.log('total supply ', result)

    return result
}
 
async function readHTTPUrl(url , tokenId )  {
 
    const res = await axios.get( parseHTTPURI(url) )

    return res.data
}

function parseHTTPURI(url , tokenID  ) {

    if (url.startsWith("https://api.opensea.io/api/v1/metadata")) {
        return url.replace("0x{id}", tokenID);
      } else {
        url = url.replace("{id}", tokenID);
      } 

      // https://ipfs.io/ipfs/
      // https://gateway.pinata.cloud/ipfs/ 
    return url.replace(/^ipfs:\/\/(ipfs\/)?/, 'https://ipfs.io/ipfs/')
  }


  function parseImageURI( url ){
            // let imageIPFSHash = metadata.image.split('://')[1]

                    //`https://ipfs.io/ipfs/${imageIPFSHash}`

            const isData = /^data:.+/.test(url)
            if(isData){
                return url
            }

            const isURL = /^(https?|ipfs):\/\//.test(url)
            if(isURL){
                //let imageIPFSHash = url.split('://')[1]
                //return `https://ipfs.io/ipfs/${imageIPFSHash}`
                return url 
            }

            return url 
  }



async function downloadImage(nftContractAddress, tokenId, url){

    if(typeof url == 'undefined'){
        console.log('Not downloading image for ',tokenId, ' : url is ',url)
        return 
    }
  
    
    let image_path = path.join ( `./market-api-server/output/images/${nftContractAddress}/${tokenId}.jpg` )

    try{ 
        fs.mkdirSync( path.join ( `./market-api-server/output/images/${nftContractAddress}` ))
    }catch(e){
        console.log(e)
    }
        
    let existingImage = fs.existsSync(image_path ); 
    if(existingImage) { 
        console.log(tokenId,' already exists')
        return
     }


    const isData = /^data:.+/.test(url)
    if(isData){

        let imageBuffer = await new Promise((resolve, reject) => { 
            let dataStr = url 
            

            if (/^data:image\/svg\+xml;base64,/.test(dataStr)) {

                 // dataStr = dataStr.split('base64,')[1]
                console.log('svg2img ', dataStr)

                svg2img(dataStr, { format: 'jpg', width: resolution, height: resolution  }, (err, buffer) => {
                    if (err) return reject(err) 
                     
                    resolve(buffer)
                }) 
                

            }
                
         
            })

        console.log('imageBuffer',imageBuffer)
        fs.writeFileSync(image_path, imageBuffer)
            
        return 
    }

    const isURL = /^(https?|ipfs):\/\//.test(url)
    if(isURL){
        console.log('using axios 2', url)

         
         
        let result = await new Promise(async (resolve, reject) => {
            const writer = fs.createWriteStream(image_path)
    
           
            let response = null 

            try{ 
                response =  await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                }) 

                response.data.pipe(writer)  
            }catch(e){
                console.error(e)
                reject()
            }

            
    
            writer.on('finish', () => resolve())
            writer.on('error', reject)
        })
  

        return  
    }

    console.error('unrecognized image url: ',url)
    return 

}