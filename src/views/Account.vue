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
     <div class="margin-center  container mb-32">
        
       


  <div class="w-column text-center py-8"   >
           <div class="text-lg font-bold text-black"> User Profile  </div>

          <div class="text-md font-boring "> {{ this.profileAccountAddress }}  </div>
           
          <div  class=" "  >
 

          

          </div>


          
       </div>



           <div class="w-column"   >
          <div class="text-lg font-bold"> Owned NFTs  </div>
          
         

          <div  class=" "  >

             
            

            <div  >

              <NftTile
                v-for="item in allOwnedNFTs"
                v-bind:key="item.collectionName.concat('_').concat(item.tokenId)"

                v-bind:collectionName="item.collectionName"
                v-bind:nftTokenId="item.tokenId"
                v-bind:nftData="item"

                v-bind:clickedTileCallback="clickedTileCallback"
               />

           </div>


          </div>


          <div  class=" " v-if="!allOwnedNFTs || allOwnedNFTs.length == 0" >
              No find Monkee. 🍌 
          </div>


          
       </div>



        <hr class="my-8"> 


       <div class="w-column  "  >

          <div class="w-column text-center py-8 hidden"   >
             <div class="text-lg font-bold text-black"> Personal Activity </div>
 
         
          </div>

         <div class="w-column  mb-16 " v-if="personalBidOrders && personalBidOrders.length>0" >
          <div class="text-lg font-bold text-green-600"> Active Offers  </div>
          
           
          <div  class=" "  > 
            

            <div  class="mb-4 ">

              <GenericTable
                v-bind:labelsArray="['','Collection Name','Token Id','Bid Amount','Expires' ]"
                v-bind:rowsArray="personalBidOrders"
                v-bind:clickedRowCallback="clickedRowCallback"
                
               />

           </div>


          </div> 
       </div>


       <div class="w-column mb-16  "   v-if="personalSellOrders && personalSellOrders.length>0" >
          <div class="text-lg font-bold text-green-600" > Open Sell Orders  </div>
          
           
          <div  class=" "  > 
            

            <div class="mb-4 ">

              <GenericTable
                 v-bind:labelsArray="['','Collection Name','Token Id','Buyout','Expires']"
                v-bind:rowsArray="personalSellOrders"
                  v-bind:clickedRowCallback="clickedRowCallback"
               />


           </div>


          </div> 
       </div>

       
          
       </div>

        


     </div>
   </div>


    


    
  <Footer/>

</div>
</template>


<script>

import web3 from 'web3'

import NotConnectedToWeb3 from './components/NotConnectedToWeb3.vue'

import Web3Plug from '../js/web3-plug.js' 


import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import TabsBar from './components/TabsBar.vue';
import GenericTable from './components/GenericTable.vue';

//import BidPacketHelper from '../js/bidpacket-helper.js'
 
 import MathHelper from '../js/math-helper.js'


const envName = process.env.NODE_ENV

const FrontendConfig = require('../config/FrontendConfig.json')[envName]

 

import AssetDataHelper from '../js/asset-data-helper'
import StarflaskAPIHelper from '../js/starflask-api-helper'

import NftTile from './components/NftTile.vue'

export default {
  name: 'Account',
  props: [],
  components: {Navbar, Footer, TabsBar, GenericTable,NftTile, NotConnectedToWeb3},
  data() {
    return {
      web3Plug: new Web3Plug() ,
      activePanelId: null,
      selectedTab:"bids",
      activeBidRowsArray:[],
      inactiveBidRowsArray:[],

      profileAccountAddress: null,

      allOwnedNFTs:[ ],
       
      connectedToWeb3: false,
      currentBlockNumber: 0,

      personalBidOrders: [],
      personalSellOrders: []
    }
  },
  watch: {
   
  },
  created(){

    this.profileAccountAddress = this.$route.params.address

  },
  
  mounted: function () {
    
     this.reconnectWeb3()

      this.fetchOwnedTokens()

      this.fetchPersonalActivity()
   
  }, 
   beforeDestroy(){
    this.web3Plug.clearEventEmitter()
  },
  methods: {
          reconnectWeb3(){
            this.web3Plug.getPlugEventEmitter().on('stateChanged', async function(connectionState) {
            console.log('stateChanged',connectionState);
            
            this.activeAccountAddress = connectionState.activeAccountAddress
            this.activeNetworkId = connectionState.activeNetworkId
            this.connectedToWeb3 = this.web3Plug.connectedToWeb3()
            this.currentBlockNumber = await this.web3Plug.getBlockNumber()

            await this.fetchOwnedTokens()

            //this.fetchBidsData()
            
          }.bind(this));
             this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
            console.error('error',errormessage);
            
            this.web3error = errormessage
          
          }.bind(this));

          this.web3Plug.reconnectWeb()
          },


          setActivePanel(panelId){
              if(panelId == this.activePanelId){
                this.activePanelId = null;
                return 
              }
               this.activePanelId = panelId ;
          },
          onTabSelect(tabname){
            console.log(tabname)




          },

          async fetchOwnedTokens(){

           
   
            let filterNFTcontracts  = ['Cryptoadz','Cryptoflyz'] 


             console.log('filterNFTcontracts',filterNFTcontracts)
 
            let results = await StarflaskAPIHelper.resolveStarflaskQuery(  FrontendConfig.tokenDataApiRoot+ '/api/v1/apikey', {"requestType": "NFTTiles_by_owner", "input":{"publicAddress": this.profileAccountAddress, "filterNFTcontracts": filterNFTcontracts }  }   )

            console.log('results',results )

            this.allOwnedNFTs = []


            for(let result of results.output){ 

                
                this.allOwnedNFTs.push(result)
              
            }

          },

          async fetchPersonalActivity(){

            this.personalOrdersArray = []

            
            let filterCollections  = ['Cryptoadz','Cryptoflyz'] 

            let inputRequest = { "publicAddress": this.profileAccountAddress, "filterCollections": filterCollections  } 
 
            let results = await StarflaskAPIHelper.resolveStarflaskQuery( 
               FrontendConfig.tokenDataApiRoot+ '/api/v1/apikey',             
            {"requestType": "personal_activity",
             "input":inputRequest }   )

            console.log('findPersonalActivity',results )

            this.personalSellOrders = []
            this.personalBidOrders = []
 
 

            for(let result of results.output.recentOrders){ 

              let collectionName = AssetDataHelper.getCollectionNameForAsset( result.nftContractAddress )

                let decimals = 18 
                let currencyAmountFormatted = MathHelper.rawAmountToFormatted(result.currencyTokenAmount,decimals)
                currencyAmountFormatted = MathHelper.formatFloat(currencyAmountFormatted)
                currencyAmountFormatted = currencyAmountFormatted.toString().concat(' ♦')


                let iconURL =  AssetDataHelper.getImageURL(collectionName,result.nftTokenId) 

                let latestBlockNumber = results.output.latestBlockNumber

                let row = { 
                  icon: iconURL,
                  collectionName: collectionName, 
                  tokenId: result.nftTokenId , 
                  currencyAmountFormatted:  (currencyAmountFormatted),
                  expires: MathHelper.expirationTimeFormatted( latestBlockNumber, result.expires  )
                }  

                if(result.isSellOrder){
                  this.personalSellOrders.push(row)
                }else{
                  this.personalBidOrders.push(row)
                }
                
              
            }
            
          },


           async clickedRowCallback(row){
            console.log('clicked,',row)

             this.$router.push(`/collection/${row.collectionName}/${row.tokenId}`)
          },
        

          clickedTileCallback(row){
            console.log('clicked  ',row )

           
          }
  }
}
</script>
