
 
 import express from 'express'
 
 import cors from 'cors'
import fs from 'fs'
import path from 'path'

 
 
import http from 'http'
import https from 'https'
 

export default class ExpressServer  {

    constructor( serverConfig ,customFolderName ){
      
        this.serverConfig=serverConfig;

 

        const app = express()
 

        let envmode = process.env.NODE_ENV

        var apiPort = 4000

        if(serverConfig.useHTTPS == true ){
          var server = https.createServer({
            cert: fs.readFileSync(`/home/andy/deploy/cert/${serverConfig.TLSCertName}.pem`),
            key: fs.readFileSync(`/home/andy/deploy/cert/${serverConfig.TLSCertName}.key`)
          });
          console.log('--using https--')
         
        }else{
          
          var server = http.createServer(app);
        }
        
 
         app.use(cors());

  
 

        this.startWebServer(app, apiPort, customFolderName)
 
      
    }


    async startWebServer(app, apiPort, customFolderName){

     
      app.use(express.json());

      
      if(!customFolderName){
        customFolderName = 'dist'
      }
 
      app.use(express.static(customFolderName))
     

      app.listen(apiPort, () => {
        console.log(`Static File Server listening at http://localhost:${apiPort}`)
      })
 
 

    }
 

}