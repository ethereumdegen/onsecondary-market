<template>

<div>

   <div class="section    border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug"
       />
     </div>


   </div>

  
   <div class="section  border-b-2 border-black ">
     <div class=" container mb-16 margin-center">
      
       <div class="grid md:grid-cols-4 gap-4 p-4 ">
 

          <div class="bg-gray-200 p-2 border-4 border-black text-gray-800" style="min-height:500px">
            
                <TreeList 
                  v-bind:inputArray="filterTraitsList"
                  v-bind:onClickCallback="onClickTraitCallback"
                /> 
            
            </div>
          <div class="md:col-span-3 p-2"> 
            
            
                <TiledTokenBrowser
                  ref="TokenBrowser"  
                  v-bind:collectionName="collectionName"
                  v-bind:currentFilter="tokenBrowserFilter"
                  v-bind:updatedCurrentPageCallback="updatedCurrentPageCallback"
                  v-bind:clearFiltersCallback="clearFiltersCallback"

                /> 
            
            
            
            
            </div>


        



 
       </div>
     </div>
   </div>


   

   



    
  <Footer/>

</div>
</template>


<script>



import Web3Plug from '../js/web3-plug.js' 


//import SearchBar from './components/legacy/SearchBar.vue';
import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import TreeList from './components/TreeList.vue';

import TiledTokenBrowser from './components/TiledTokenBrowser.vue';
 
 
import StarflaskApiHelper from '../js/starflask-api-helper.js'

const envName = process.env.NODE_ENV

const FrontendConfig = require('../config/FrontendConfig.json')[envName]

export default {
  name: 'Home',
  props: [],
  components: {Navbar, Footer,TreeList,TiledTokenBrowser},
  data() {
    return {
      collectionName: 'boredapes',
      
      web3Plug: new Web3Plug() ,
      activePanelId: null ,
        
      filterTraitsList: {},
      tokenBrowserFilter: {},

      currentPage: 1
    }
  },

  created(){

    let queryCollectionName =  this.$route.params.collectionName
    if(queryCollectionName){
      
         this.collectionName = queryCollectionName.toLowerCase()
       
    }


    let queryFilterTraitName =  this.$route.query.traitName
    let queryFilterTraitValue  =  this.$route.query.traitValue

    if(queryFilterTraitName && queryFilterTraitValue){ 

        
        this.tokenBrowserFilter = { traitName:queryFilterTraitName , traitValue: queryFilterTraitValue } 
    }

 
    this.web3Plug.getPlugEventEmitter().on('stateChanged', function(connectionState) {
        console.log('stateChanged',connectionState);
         
        this.activeAccountAddress = connectionState.activeAccountAddress
        this.activeNetworkId = connectionState.activeNetworkId
 

         
      }.bind(this));
   this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
        console.error('error',errormessage);
         
        this.web3error = errormessage
       
      }.bind(this));

      this.web3Plug.reconnectWeb()
  

  },
  mounted: function () {
    
      this.fetchTraits()
   
  }, 
  methods: {

          async fetchTraits( ){

              let uri = FrontendConfig.marketApiRoot+'/api/v1/apikey'
              
              let result = await StarflaskApiHelper.resolveStarflaskQuery(uri,{"requestType": "all_collection_traits", "input": {collectionName: this.collectionName}})
 

              this.filterTraitsList = this.computeFilterTraitsList(  result.output  )
              console.log('this.filterTraitsList',this.filterTraitsList)

          },

          computeFilterTraitsList(filterTraitsList){

            let map = {}

            for(let trait of filterTraitsList){
              if(!map[trait.traitType]) map[trait.traitType] = [] 
              map[trait.traitType].push( trait.value )
            }

            let output = []
   
            for(let key of Object.keys(map)){
              output.push(  {title: key,  children:  map[key].map(v =>  ({"title": v}) ) }  )
            }
            
            return  {title:"All Traits", children: output}
          },

          onClickTraitCallback(result){ 
 
            //set page to 1 
            this.currentPage = 1

             this.$refs.TokenBrowser.forceSetPage( this.currentPage )  

            this.tokenBrowserFilter = { traitName: result.parent , traitValue: result.leaf } 
           
            this.updateRouteParams()

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

              this.selectedTab = tabname.toLowerCase() 

          },

          clearFiltersCallback(){
             this.currentPage = 1

             this.$refs.TokenBrowser.forceSetPage( this.currentPage )  

            this.tokenBrowserFilter = { traitName: undefined , traitValue: undefined } 
           
            this.updateRouteParams()
          }, 

          updatedCurrentPageCallback(currentPage){
             this.currentPage = currentPage  
             this.updateRouteParams()
          },

          updateRouteParams(){
             this.$router.replace({ query: {
               page: this.currentPage,
               traitName: this.tokenBrowserFilter.traitName,
               traitValue: this.tokenBrowserFilter.traitValue
             } }); 
          }
          

  }
}
</script>
