 
import FileHelper from './file-helper.js'

import VibeGraph from 'vibegraph'

import IndexerBlockStore from './IndexerBlockStore.js' 
import IndexerERC721Custom from './IndexerERC721Custom.js'

import Web3 from 'web3'

let envmode = process.env.NODE_ENV
 

let dataghostConfigFile = FileHelper.readJSONFile('./market-api-server/config/dataghostconfig.json')
let dataghostConfig = dataghostConfigFile[envmode]

let ERC721ABI = FileHelper.readJSONFile('./src/contracts/ERC721ABI.json')
let BlockStoreABI = FileHelper.readJSONFile('./src/contracts/BlockStoreABI.json')
 
 

export default class DataGhost  {


  async init(web3, customDBName){

    console.log('dataghost config: ',dataghostConfig)

    if(!customDBName){
      customDBName = dataghostConfig.vibeGraphConfig.dbName
    }
 
   
    let vibeGraphConfig = {  
      contracts:dataghostConfig.vibeGraphConfig.contracts,
       
      dbName: customDBName,
      //url: web3Config.dbURI,
      //port: parseInt(web3Config.dbPort),
      indexRate: 10*1000,
      fineBlockGap: dataghostConfig.vibeGraphConfig.fineBlockGap,
      courseBlockGap: dataghostConfig.vibeGraphConfig.courseBlockGap,
      logging: dataghostConfig.vibeGraphConfig.logging,
      subscribe:true,
       
      customIndexers:[{
          type:'BlockStore', 
          abi: BlockStoreABI ,  
          handler: IndexerBlockStore 
       },{
        type:'ERC721Custom', 
        abi: ERC721ABI ,  
        handler: IndexerERC721Custom 
     }]
  }  

    let vibeGraph = new VibeGraph()
    await vibeGraph.init( vibeGraphConfig )
    vibeGraph.startIndexing( web3, vibeGraphConfig )   

} 

}
 