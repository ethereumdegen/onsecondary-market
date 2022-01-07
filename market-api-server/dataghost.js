


import MongoInterface from './lib/mongo-interface.js'

import DataGhost from './lib/dataghost.js' 

import FileHelper from './lib/file-helper.js'

import ApiServer from './lib/api-server.js'

 

import Web3 from 'web3'
import NFTTileManager from './lib/nft-tile-manager.js'

let envmode = process.env.NODE_ENV

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]

let dataghostConfigFile = FileHelper.readJSONFile('./market-api-server/config/dataghostconfig.json')
let dataghostConfig = dataghostConfigFile[envmode]

 
  async function start(){


    let customDBName = dataghostConfig.vibeGraphConfig.dbName 
    
    customDBName = "vibegraph_prod3"
    
   
    console.log('boot vibegraph interface ', customDBName)

    let vibegraphInterface =  new MongoInterface() 
    await vibegraphInterface.init( customDBName )
 
 

    let web3 = new Web3(new Web3.providers.WebsocketProvider( serverConfig.web3provider, {
      clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
      }
    }));


    let dataghost = new DataGhost()
    dataghost.init( web3 , customDBName ) 
 


}

 
 start()