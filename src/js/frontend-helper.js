 



 


export default class FrontendHelper {


  static lookupContractAddress(contractName, contractData){

    if(!contractData)return null 

    for(let key of Object.keys(contractData)){
      if(key.toLowerCase() == contractName.toLowerCase()){
        return contractData[key].address
      }
    }

    return null
  }

  static envName(){

    return process.env.NODE_ENV
  }

  static getNetworkNameForEnv(){

    let envmode = FrontendHelper.envName()

    if(envmode == 'production') return 'mainnet'

    return 'rinkeby'
  }


  static getNetworkIdForEnv(){

    let envmode = FrontendHelper.envName()

    if(envmode == 'production') return 1

    return 4
  }

  

  



}