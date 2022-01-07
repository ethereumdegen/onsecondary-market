 
  
import MongoInterface from '../lib/mongo-interface.js'

import FileHelper from '../lib/file-helper.js' 
  
let envmode = process.env.NODE_ENV

if(!envmode) envmode = 'development'

console.log('envmode: ', envmode)

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]
 


let marketOrders = FileHelper.readJSONFile('./market-api-server/output/marketordersexport.json')

async function runTask(){
 

let mongoInterface = new MongoInterface() 
await mongoInterface.init(  serverConfig.dbName )

  
for(let order of marketOrders){

    let insert = await mongoInterface.marketOrdersModel.insertMany({

        chainId: order.chainId,
        storeContractAddress: order.storeContractAddress,
        orderCreator: order.orderCreator,
        isSellOrder: order.isSellOrder,
        nftContractAddress: order.nftContractAddress,
        nftTokenId: order.nftTokenId,
        currencyTokenAddress: order.currencyTokenAddress,
        currencyTokenAmount: order.currencyTokenAmount,
        nonce: order.nonce,
        expires: order.expires,
        signature: order.signature,
        lastPolledAt: order.lastPolledAt,
        createdAt: order.createdAt,
        status: order.status ,
        orderUUID: order.orderUUID

    })

    console.log(insert)
}  

  

console.log('task complete')
return 

}


runTask() 



 