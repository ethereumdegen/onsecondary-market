import axios from 'axios'

import fs from 'fs'
import path from 'path'
  
  
import MongoInterface from '../lib/mongo-interface.js'

import FileHelper from '../lib/file-helper.js' 
  
let envmode = process.env.NODE_ENV

if(!envmode) envmode = 'development'

console.log('envmode: ', envmode)

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]
 

async function runTask(){

  


let mongoInterface = new MongoInterface() 
await mongoInterface.init(  serverConfig.dbName )


let marketOrders = await mongoInterface.marketOrdersModel.find()
 
let output = [] 

for(let order of marketOrders){

    output.push(order) 
}  

 
fs.writeFileSync( path.join ( "./market-api-server/output/marketordersexport.json" ) , JSON.stringify( output ) );
  

console.log('task complete')
return 

}


runTask() 



 