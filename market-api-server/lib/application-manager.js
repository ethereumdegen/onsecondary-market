  

    import web3utils from 'web3-utils'
 
    
   const MAX_APP_COUNT = 25 
 
    export default class ApplicationManager  {
    
        constructor(   ){
           
           
        }
 
            
            static async generateNewApplicationForUser(publicAddress, mongoInterface)
            {

                let allApps = await ApplicationManager.findAllApplicationsForUser(publicAddress,mongoInterface)

                if(allApps.count >= 25){
                    return {success: false, message: 'User has exceeded application limit.'}
                }

                publicAddress = web3utils.toChecksumAddress(publicAddress)

                let appId = web3utils.randomHex(20)
                let newApp = await mongoInterface.apiApplicationModel.insertOne( {publicAddress: publicAddress, applicationId: appId } )
 
                return {success:true, appId: appId};

            }

            static async findAllApplicationsForUser(publicAddress, mongoInterface){
                publicAddress = web3utils.toChecksumAddress(publicAddress)

                return await mongoInterface.apiApplicationModel.find( {publicAddress: publicAddress } )
 
            }

            static async findApplicationById(appId, mongoInterface){

                appId = ApplicationManager.sanitizeString(appId) 

                return await mongoInterface.apiApplicationModel.find( {applicationId: appId } )
 
            }


            static async validateAppId(appId, mongoInterface){
                let matchingApp = await ApplicationManager.findApplicationById(appId,mongoInterface)

                if(!matchingApp){
                    return {success:false, message:'Invalid app id'}
                }

                //do rate limit checking here ! 
                let recentRequestCount = await ApplicationManager.findRecentLoggedRequestCountForUser(matchingApp.publicAddress, mongoInterface)


                let maxRequestsAllowed = await ApplicationManager.getMaximumDailyRequestsForUser(matchingApp.publicAddress, mongoInterface)
                if(recentRequestCount > maxRequestsAllowed){
                    return {success:false, message:'Exceeded rate limit' }
                }

                
                return {success:true}
                
            }


            //returns hours since epoch start 
            static getCurrentEpochHour( ){
                return (Date.now() / 1000 / 60 / 60 )
            }

            static async getMaximumDailyRequestsForUser(publicAddress, mongoInterface){
                return 9000
            }

            static async findRecentLoggedRequestCountForUser( publicAddress, mongoInterface ){
                publicAddress = web3utils.toChecksumAddress( publicAddress  ) 

                let totalCount = 0

                let maxEpochHour = ApplicationManager.getCurrentEpochHour()
                let minEpochHour = ApplicationManager.getCurrentEpochHour() - 24 
 
                let matchingEpochCountersArray = await mongoInterface.appEpochCounterModel.find( {publicAddress: publicAddress, epochHour: { $lte: maxEpochHour, $gt: minEpochHour } })
            
                for (let epochCounter of matchingEpochCountersArray){

                    totalCount += parseInt( epochCounter.requestCount ) 
                }
                
                return totalCount
            }
            
            static async logNewRequest(appId, requestType, inputs, outputs, mongoInterface){

                let applicationData = await ApplicationManager.findApplicationById( appId , mongoInterface)

                let publicAddress = web3utils.toChecksumAddress( applicationData.publicAddress  ) 


                //add to rate counter somehow 
                let epochHour = ApplicationManager.getCurrentEpochHour()
    
                let existingApplicationEpochCounter = await mongoInterface.findOne('app_epoch_counter', {applicationId: appId, epochHour: epochHour })
                if(existingApplicationEpochCounter){
                    await mongoInterface.updateCustomAndFindOne('app_epoch_counter', {applicationId: appId, epochHour: epochHour }, {$inc: {requestCount:1} })
                }else{
                    await mongoInterface.insertOne('app_epoch_counter', {applicationId: appId,  publicAddress:publicAddress, epochHour: epochHour,  requestCount: 1 })
                }
    
                await mongoInterface.insertOne('logged_requests',{applicationId: appId,requestType: requestType, inputs:inputs, outputs:outputs  })
            
                return true 
            }
            
            static sanitizeString(s){
                if(!s) return s
    
                return s.replace('$','')
            }
         
            
    }