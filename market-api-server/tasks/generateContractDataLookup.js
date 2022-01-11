 
import FileHelper from '../lib/file-helper.js'
 
import fs from 'fs'
import path from 'path'
import AppHelper from '../lib/app-helper.js'

const assetDataTable =FileHelper.readJSONFile('./shared/contractdata.json')

let currentNetworkName = AppHelper.getNetworkName( )
 
export default class GenerateContractDataLookupTask {




static generateAssetDataLookup(dataTable){
    let records = {} 
    
  
    for(let [networkName,contractsList] of Object.entries(dataTable)){
     
      for(let [contractName,contractInfo] of Object.entries(contractsList.contracts)){
   
  
        let contractAddress = contractInfo.address.toLowerCase()

        if(networkName == currentNetworkName){
          records[contractAddress] = {name: contractInfo.name, address: contractInfo.address , networkName: networkName}
        }
  
          
  
      }  
   
    } 

    return records
  }

  

static async runTask( ){ 

   let dataLookup =  GenerateContractDataLookupTask.generateAssetDataLookup(assetDataTable)
   

  // fs.writeFileSync( path.join ( "./src/config/generated/contractlookup.json" ) , JSON.stringify( dataLookup ) );
   fs.writeFileSync( path.join ( "./market-api-server/config/generated/contractlookup.json" ) , JSON.stringify( dataLookup ) );
  
   console.log(`generateAssetDataLookup: task complete.`) 
     

}


} 


 