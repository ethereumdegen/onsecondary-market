 
import FileHelper from '../lib/file-helper.js'

 import AppHelper from '../lib/app-helper.js'

let outputConfig = FileHelper.readJSONFile('./market-api-server/config/baycOutputData.json')
 
export default class PopulateCachedNFTTilesTask {


static async runTask(inputs, mongoInterface ){

    
let collectionName = inputs.collectionName 

if(collectionName.toLowerCase() == 'boredapes'){
    outputConfig = FileHelper.readJSONFile('./market-api-server/config/baycOutputData.json')
}
if(collectionName.toLowerCase() == 'mutantapes'){
    outputConfig = FileHelper.readJSONFile('./market-api-server/config/maycOutputData.json')
}



let tokenDataArray = []
  

for(let [tokenId,traitsArray] of Object.entries(outputConfig)){

  console.log('meep', tokenId)

    let contractAddress = AppHelper.contractCollectionNameToContractAddress(collectionName)
    contractAddress = AppHelper.toChecksumAddress(contractAddress)

    tokenDataArray.push({
          collectionName:  collectionName,
          contractAddress: contractAddress,
          tokenId: parseInt(tokenId),
          nftTraits:traitsArray,
          combinedAssetId: AppHelper.getCombinedAssetId(contractAddress,parseInt(tokenId))
     })

}   

console.log('tokenDataArray',tokenDataArray)
 
const nftTilesModel =  mongoInterface.cachedNFTTileModel
 

  
   let inserted = await nftTilesModel.insertMany(tokenDataArray,{ ordered: false })
   console.log('inserted',inserted)


  let tilesMissingContractAddress = await nftTilesModel.find({contractAddress: {$exists:false}})
  for(let tile of tilesMissingContractAddress){

    let contractAddress = AppHelper.contractCollectionNameToContractAddress(tile.collectionName)
    contractAddress = AppHelper.toChecksumAddress(contractAddress)

    await nftTilesModel.updateOne({_id:tile._id}  , {contractAddress:contractAddress} )

  }

  let tilesMissingCombinedAssetId = await nftTilesModel.find({combinedAssetId: {$exists:false}})
  for(let tile of tilesMissingCombinedAssetId){

    let combinedAssetId = AppHelper.getCombinedAssetId(tile.contractAddress,tile.tokenId)

    await nftTilesModel.updateOne({_id:tile._id}  , {combinedAssetId:combinedAssetId} )

  }
 
  
 console.log(`PopulateCachedNFTTilesTask ${collectionName}: task complete.`)
    

}


} 


 