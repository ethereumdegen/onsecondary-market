
 

import FileHelper from './lib/file-helper.js'

import WebServer from './lib/web-server.js'
 

let envmode = process.env.NODE_ENV

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]
 
 

  async function start(){
 
      
     console.log('server config: ',serverConfig)

     let customFolderName = 'images' 

     let webServer = new WebServer(serverConfig, customFolderName )
      
      

}

 
 start()