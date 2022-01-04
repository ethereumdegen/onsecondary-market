<template>

<div>

   <div class="section  bg-white border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug"
       />
     </div>


   </div>

  

   <div class="section  bg-white border-b-2 border-black">

     <div class=" container  margin-center">

     
     <div class="grid md:grid-cols-3 gap-4 p-4  text-gray-800">
        
       <div class=" ">
          <div class="m-4 p-4 border-2 border-gray-500" style="min-height:50px; "> 

             <img v-bind:src="getImageURL()"   style="width:100%; max-height:300px;object-fit: scale-down;"  />

  

          </div>


          <div class="m-4 p-4 border-2 border-gray-500 font-boring" style="min-height:50px; "> 
            <table class="table-auto" > 

              <thead>
              <tr>
                <th> </th>
                <th> </th>
                
              </tr>
          </thead>
          <tbody>
            <tr v-for="trait in nftTraitsArray" v-bind:key="trait.trait_type">

              <td class="px-2 font-bold">{{ trait.trait_type }}</td>
              <td class="px-2"> <router-link  :to="getProjectURL(trait.trait_type,trait.value)"  >   {{ trait.value }} </router-link> </td>
             
            </tr> 
              </tbody>
            </table>
  

          </div>

       </div>

         <div class="col-span-2 p-2">

          <div class="py-2">

            <div class="text-lg"> {{getAssetName() }} </div>

            <a class="text-sm font-bold" v-bind:href="getProjectURL()"> {{getCollectionName() }} </a>

            <div v-if="getOwnerAddress()"> 
              Owned By 
              
              <router-link  :to="'/account/'+tokenOwnerAddress"  >  {{getOwnerAddress()}}   </router-link> 
              
            </div>

          </div>

        <div class="my-32">
           <div class="py-2" v-if="ownedByLocalUser()">

                <div v-if="bestSellOrder " class='my-2'>
                    <div class="p-2 border-2 border-black inline-block rounded bg-gray-700 text-white hover:bg-gray-600  select-none"  > For Sale: <span class="wide-letters">{{ getBuyoutPrice() }}</span> ETH </div>
          
                  
                 </div>

                  <div v-if="bestSellOrder " class='my-2'>
                   
                  <div class=" p-1 border-2 border-black cursor-pointer inline-block rounded bg-red-500 text-white hover:bg-red-400  select-none" @click="cancelBuyout( bestSellOrder )"  > Cancel </div>

                   <div class="mx-2 p-2 border-2 border-black inline cursor-pointer rounded hover:bg-purple-200 select-none" @click="interactionMode='lowerPrice'"> Lower Price </div>
          
                 </div>
                 


             <div v-if="!bestSellOrder " class='my-2'>
                <div class="p-2 border-2 border-black inline cursor-pointer rounded hover:bg-purple-200 select-none" @click="interactionMode='makeSellOrder'"> Sell This Item </div>
            </div>
          </div>

           <div class="py-2" v-if="!ownedByLocalUser()">


            <div v-if="bestSellOrder && getBuyoutPrice()" class='my-2'>
               <div class="p-2 border-2 border-black inline-block cursor-pointer rounded bg-blue-500 text-white hover:bg-blue-400  select-none"  @click="buyoutNow"> Buyout For <span class="wide-letters">{{ getBuyoutPrice() }}</span> ETH </div>
            </div>
 

            
                <div class="p-2 my-2 border-2 border-black inline-block cursor-pointer rounded hover:bg-purple-200  select-none"  @click="interactionMode='makeBuyOrder'"> Bid For This Item </div>
   
           
          </div>
       </div>

       </div>
        </div>

     </div>
     
   </div>


    
   <div class="section  bg-white border-b-2 border-black">

    

     <div class="autospacing container  grid md:grid-cols-2 margin-center">
        
       <div class=" ">

          
            <OffersList 
            ref="OffersList" 
            v-bind:web3Plug="web3Plug"
            v-bind:nftContractAddress="nftContractAddress"
            v-bind:nftTokenId="nftTokenId"
            v-bind:tokenOwnerAddress="tokenOwnerAddress"
            v-bind:activeAccountAddress="activeAccountAddress"
            
            /> 


       </div>

         <div class="  m-4 p-4 bg-gray-200 rounded" v-if="interactionMode=='makeSellOrder' || interactionMode=='lowerPrice' || interactionMode=='makeBuyOrder'">

          <div class="py-2 " v-if="interactionMode=='makeSellOrder' || interactionMode=='lowerPrice'">

            <SellOrderForm 
            v-bind:web3Plug="web3Plug"
            v-bind:nftContractAddress="nftContractAddress"
            v-bind:nftTokenId="nftTokenId"
            v-bind:orderSubmittedCallback="onOrderSubmitted"
            v-bind:interactionMode="interactionMode"
            v-bind:bestSellOrder="bestSellOrder"
            />
 

          </div>


           <div class="py-2" v-if="interactionMode=='makeBuyOrder'">
 
            <BuyOrderForm 
            v-bind:web3Plug="web3Plug"
            v-bind:nftContractAddress="nftContractAddress"
            v-bind:nftTokenId="nftTokenId"
            v-bind:orderSubmittedCallback="onOrderSubmitted"
            
            />

           
             

          </div>

            


       </div>

     </div>
   </div>


    
  <Footer/>

</div>
</template>


<script>



import Web3Plug from '../../js/web3-plug.js' 


import Navbar from '../components/Navbar.vue';
 
import Footer from '../components/Footer.vue';

import OffersList from '../components/OffersList.vue'

import BuyOrderForm from '../components/BuyOrderForm.vue'
import SellOrderForm from '../components/SellOrderForm.vue';

import StarflaskAPIHelper from '../../js/starflask-api-helper'
import AssetDataHelper from '../../js/asset-data-helper'

import FrontendHelper from '../../js/frontend-helper'

const web3utils = require('web3').utils

const BN = web3utils.BN 


const envName = process.env.NODE_ENV

const FrontendConfig = require('../../config/FrontendConfig.json')[envName]

const StoreContractABI = require( '../../contracts/BlockStoreABI.json'  )

export default {
  name: 'Show',
  props: [],
  components: {Navbar, Footer, SellOrderForm, BuyOrderForm, OffersList},
  data() {
    return {
      web3Plug: new Web3Plug() ,
      nftContractAddress: null,
      nftTokenId: null,
      tokenOwnerAddress: null,
      interactionMode: null ,

      activeAccountAddress: null,

      bestSellOrder:null,

      nftTraitsArray:[],

      collectionName: undefined,
      imagesReadyToLoad: false

    }
  },
  mounted:   function () {


    this.collectionName = this.$route.params.collectionName

      
   // this.nftContractAddress = FrontendHelper.getContractAddressFromCollectionName(collectionName)
    this.nftTokenId = parseInt( this.$route.params.tokenId )


      //assume network is mainnet 
     this.nftContractAddress = FrontendHelper.lookupContractAddress(  this.collectionName, this.web3Plug.getContractDataForNetworkID(1)  )
      
      this.fetchTokenData() 

      this.fetchOrdersForToken()

    
    
    this.web3Plug.getPlugEventEmitter().on('stateChanged', async function(connectionState) {
        console.log('stateChanged',connectionState);
         
        this.activeAccountAddress = connectionState.activeAccountAddress
        this.activeNetworkId = connectionState.activeNetworkId


        if(!this.activeNetworkId) this.activeNetworkId = 1;

        let contractData = this.web3Plug.getContractDataForNetworkID(this.activeNetworkId)

        this.nftContractAddress = FrontendHelper.lookupContractAddress(  this.collectionName, contractData  )
          console.log('found nftContractAddress',this.nftContractAddress)
 
       
     
        await this.fetchTokenData() 

        await this.fetchOrdersForToken() 


        this.imagesReadyToLoad = true 
        this.$forceUpdate();  
       


      }.bind(this));
   this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
        console.error('error',errormessage);
         
        this.web3error = errormessage
        // END CUSTOM CODE
      }.bind(this));
    this.web3Plug.reconnectWeb()
    
  }, 
  methods: {
              
      getLinkUrl(){ 
         
        return `/collection/${this.collectionName}/${this.nftTokenId}` 
      },

     
      getImageURL(){
        if(!this.imagesReadyToLoad)return ''

        return AssetDataHelper.getImageURL(this.collectionName,this.nftTokenId) 
 
      },

       

      getAssetName(){
        //make this come from a giant config file that uses contract address and token id to look up 
        let typeName = this.getCollectionName()
        let tokenId = this.nftTokenId


        if(typeName == 'boredapes'){typeName = 'Bored Ape'}
        if(typeName == 'mutantapes'){typeName = 'Mutant Ape'}
        
        return typeName + ' ' + '#' + tokenId

        //return 'unknown asset'
      },

      getCollectionExplorerURL(){
        return this.web3Plug.getExplorerLinkForAddress(this.nftContractAddress)
      },


      getProjectURL(traitType,traitValue){  

        const collectionName = this.collectionName

        if(traitType && traitValue){
          return '/collection/'+collectionName+'?'+`traitName=${traitType}&traitValue=${traitValue}`
        }
       
        return '/collection/'+collectionName
      },

      getCollectionName(){
          //make this come from a giant config file that uses contract address and token id to look up 
      
        return this.collectionName
      },

     

       getOwnerAddress(){ 

         if(this.ownedByLocalUser()) return 'You'
        
        return this.tokenOwnerAddress
      },

      ownedByLocalUser(){
        if(!this.tokenOwnerAddress || !this.activeAccountAddress ) return false 


        return this.tokenOwnerAddress.toLowerCase() == this.activeAccountAddress.toLowerCase()
      },

      async onOrderSubmitted(){

        // await this.fetchTokenData() 

        await this.fetchOrdersForToken()

      },


      getBuyoutPrice(){

        if(this.bestSellOrder){
          let formattedAmount = this.web3Plug.rawAmountToFormatted( this.bestSellOrder.currencyTokenAmount ,18  ) 

           
          return  parseFloat(  formattedAmount )
        }

        return null
      },

      async buyoutNow(){

        if(!this.web3Plug.connectedToWeb3()){
          this.web3Plug.connectWeb3()
          return 
        }
         

        let orderToFulfill = this.bestSellOrder

        let contractData = this.web3Plug.getContractDataForActiveNetwork() ;

        let storeContractAddress = contractData['blockstore'].address
 
        let orderInputs = [
          orderToFulfill.orderCreator, 
          orderToFulfill.nftContractAddress,
          orderToFulfill.nftTokenId,
          orderToFulfill.currencyTokenAddress,
         
           new BN( orderToFulfill.currencyTokenAmount.toString()),

          orderToFulfill.nonce,
          orderToFulfill.expires,
          orderToFulfill.signature
        ]

        let txEthValue = 0 

        const NATIVE_ETH = "0x0000000000000000000000000000000000000010"

        
        if(orderToFulfill.currencyTokenAddress == NATIVE_ETH){
          txEthValue = parseInt( orderToFulfill.currencyTokenAmount )
        }
        

        let storeContract = this.web3Plug.getCustomContract( StoreContractABI, storeContractAddress )
  
        let response = await storeContract.methods.buyNFTUsingSellOrder(  ...orderInputs  )
        .send({from: this.web3Plug.getActiveAccountAddress() , value:  txEthValue  })

        console.log('response',response)


      },


      async cancelBuyout( orderToCancel ){
        let contractData = this.web3Plug.getContractDataForActiveNetwork() ;

        let storeContractAddress = contractData['blockstore'].address


        //solve bn parsing 

          
 
        let orderInputs = [
          orderToCancel.orderCreator, 
          orderToCancel.isSellOrder,
          orderToCancel.nftContractAddress,
          orderToCancel.nftTokenId.toString(),
          orderToCancel.currencyTokenAddress,
          new BN(orderToCancel.currencyTokenAmount.toString()),
          orderToCancel.nonce ,
          orderToCancel.expires,
            
          orderToCancel.signature
        ]

        console.log('orderInputs',orderInputs)

         let storeContract = this.web3Plug.getCustomContract( StoreContractABI, storeContractAddress )
  
        let response = await storeContract.methods.cancelOffchainOrder(  ...orderInputs  )
        .send({from: this.web3Plug.getActiveAccountAddress()   })

        console.log('response',response)

      },
      

       async fetchTokenData(){  

          

            let collectionName = this.collectionName

            
            console.log('fetchTokenData', FrontendConfig.tokenDataApiRoot, collectionName)

            let results = await StarflaskAPIHelper.resolveStarflaskQuery( FrontendConfig.tokenDataApiRoot+'/api/v1/apikey', {"requestType": "NFTTile_by_token_id", "input":{"collectionName":collectionName,"tokenId":  this.nftTokenId}  }    )

            console.log('fetchedTokenData',results )

            let output = results.output

            if(output){
              this.tokenOwnerAddress = output.ownerPublicAddress

              this.nftTraitsArray = output.nftTraits
            }
            

      },

 

      async fetchOrdersForToken(){

        if(!this.nftContractAddress){
          console.error('invalid network connection')
          return 
        }else(
          console.log('addy is ', this.nftContractAddress)
        )
        
        if(this.$refs.OffersList){
          await this.$refs.OffersList.checkForApproval() 

          //update the buy offers list 
         await this.$refs.OffersList.fetchBuyOffers() 

        }
         

        //update the buyout button 
         let response = await StarflaskAPIHelper.resolveStarflaskQuery( FrontendConfig.marketApiRoot+'/api/v1/apikey', {"requestType": "get_orders_for_token", "input":{"contractAddress":this.nftContractAddress,"tokenId":  this.nftTokenId}  }    )

        
         let ordersForNFT = response.output.slice(0,5000)

          
          
         let ordersFromOwner = ordersForNFT.filter(x => x.orderCreator.toLowerCase() == this.tokenOwnerAddress.toLowerCase()  )
        
 

         let buyOrders = ordersFromOwner.filter(x => x.isSellOrder == false  )
         let sellOrders = ordersFromOwner.filter(x => x.isSellOrder == true  )

          
         this.bestSellOrder = await this.getBestSellOrder( sellOrders )


      },



      async getBestSellOrder(allSellOrders){

          let unexpiredOrders = allSellOrders 

        try{
            let currentBlockNumber = await this.web3Plug.getBlockNumber()

             unexpiredOrders = unexpiredOrders.filter(x => x.expires > currentBlockNumber)
          }catch(e){
              console.error('Could not get block number')
          }
        

        if(unexpiredOrders.length > 0 ){
       
           unexpiredOrders.sort( (a,b) => { return a.currencyTokenAmount - b.currencyTokenAmount  }   )

           console.log('unexpiredOrders',unexpiredOrders  )

          let bestPrice = unexpiredOrders[0]

          
           
          return bestPrice
        }

        return null 

      }



  }
}
</script>
