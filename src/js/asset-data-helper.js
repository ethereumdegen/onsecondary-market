
 

const assetLookup = require('../config/generated/contractlookup.json')

const envName = process.env.NODE_ENV
const FrontendConfig = require('../config/FrontendConfig.json')[envName]
  
/*
const assetLookup = {

    "0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6":{name:"Cryptoadz",chainId:1}, 
  
    "0x70BC4cCb9bC9eF1B7E9dc465a38EEbc5d73740FB":{name:"Cryptoadz",chainId:4} 
   
} */


export default class AssetDataHelper {


  static getCollectionNameForContractAddress(contractAddress, chainId){

    return AssetDataHelper.getCollectionNameForAsset(contractAddress)

  }

    static getCollectionNameForAsset( contractAddress, tokenId   )
    {

      
        if(!contractAddress) return 'Unknown'
        contractAddress = contractAddress.toLowerCase()
        
        let assetLookupData = assetLookup[contractAddress]


        //console.log('alalla2',assetLookupData)

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
  //  if( cName && cName.toLowerCase() == 'mutantapes' ) return 'mutantapes'

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
/*
  static async fetchProjectDataForProjectId(projectId){
    let previewTokenId = projectId * 1000000 

    return await  AssetDataHelper.fetchProjectDataForTokenId( previewTokenId  )

    
    }


  static async fetchProjectDataForTokenId(tokenId){

    return axios.get(`https://token.artblocks.io/${tokenId}`);

  }*/
 





}