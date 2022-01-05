  import FileHelper from './file-helper.js'


    import web3utils from 'web3-utils'
    import ObjectId from 'mongodb';
 

    const envmode = process.env.NODE_ENV
   const contractData = FileHelper.readJSONFile('./market-api-server/config/contractdata.json')
   const contractLookup = FileHelper.readJSONFile('./market-api-server/config/generated/contractlookup.json')
         
   
    export default class AppHelper  {
    
      

        static toChecksumAddress(address){  
            if(!address)return address          
            return web3utils.toChecksumAddress(address)
        }

        static getCombinedAssetId(contractAddress,tokenId){  
            contractAddress = web3utils.toChecksumAddress(contractAddress)

            if(!contractAddress) return null 

            return contractAddress.toString().concat('_').concat(tokenId.toString())
        }

        static contractCollectionNameToContractAddress(collectionName){

            let networkName = AppHelper.getNetworkName() 

           let contractDataForNetwork = contractData[networkName].contracts

           for(let [contractName,data] of Object.entries(contractDataForNetwork)){
                 
               if( collectionName && collectionName.toLowerCase() == data.name.toLowerCase()   ){
                   return data.address
               } 
           } 

           console.error('ERROR: could not resolve contract address ',collectionName )

           return  null
       }  

         
        static contractAddressToCollectionName(contractAddress){
            if(!contractAddress) return contractAddress
          

            let matchingContract = contractLookup[ contractAddress.toLowerCase()  ]

              
            if(matchingContract ){
                return matchingContract.name
            } 
            
            console.error('ERROR: could not resolve contract name ',contractAddress ) 
            return  null
        }  

        static getNetworkName(){

            if(envmode == 'production') return 'mainnet'

            return 'rinkeby'
        }
        
        
        static mongoIdToNumber(mongoId){
            return mongoId.valueOf()

        }

        static numberToMongoId(n){
            return ObjectId(n)
        }
    }