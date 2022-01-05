
 

const assetLookup = require('../config/generated/contractlookup.json')

const envName = process.env.NODE_ENV
const FrontendConfig = require('../config/FrontendConfig.json')[envName]
   



export default class AssetDataHelper {

  static collectionNameToAssetName(name){
    
    if(name == 'boredapes'){name = 'Bored Ape'}
    if(name == 'mutantapes'){name = 'Mutant Ape'}
    if(name == 'coolcats'){name = 'Cool Cat'}
    if(name == 'doodles'){name = 'Doodle'}
    if(name == 'cryptoadz'){name = 'Cryptoadz'}
    if(name == 'cryptoflyz'){name = 'Cryptoflyz'}

    return name

  }


  static getCollectionNameForContractAddress(contractAddress, chainId){

    return AssetDataHelper.getCollectionNameForAsset(contractAddress)

  }

    static getCollectionNameForAsset( contractAddress, tokenId   )
    {

      
        if(!contractAddress) return 'Unknown'
        contractAddress = contractAddress.toLowerCase()
        
        let assetLookupData = assetLookup[contractAddress]

 
        if(assetLookupData){
            let contractName = assetLookupData.name 

            return contractName
        }
  
          return 'Unknown'
  
      }

   static getImageURL( collectionName,tokenId   )
  {
    let imageAPIRoot = FrontendConfig.imageApiRoot

    let folderName = AssetDataHelper.getImageFolderNameFromCollectionName( collectionName )

    return `${imageAPIRoot}/images/${folderName}/${tokenId}.jpg` 

  }  

  static getImageFolderNameFromCollectionName(cName){
   

    return cName.toLowerCase()
  } 

  static getProjectNameForAsset( contractAddress, tokenId   )
  {

    if(!contractAddress) return 'Unknown'

    let assetLookupData = assetLookup[contractAddress]

    console.log('assetLookupData',assetLookupData)

    if(assetLookupData){
        let contractName = assetLookupData.name 
 
        if(contractName) return contractName 

        return 'Unknown'

    }

    contractAddress = contractAddress.toLowerCase()

     
  }


  static getProjectDataForProjectId(projectId){

    return {name: AssetDataHelper.getProjectNameForProjectId(projectId) }

  } 



}