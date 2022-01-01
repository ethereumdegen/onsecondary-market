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
      
       <div class="grid md:grid-flow-col mt-32">

         


         <div class="  py-8">


             

             <div class="w-row">
             <FrontPageMedia  /> 

            </div>


            

        
 

         </div>

 
         <div class="   column-2 w-col w-col-6 text-center ">

              <div class="py-32 " style="width:50%; margin: 0 auto;"> 
              

                 <div class="pt-8 relative pb-2 mb-2" style="min-height:100px">
                       
                    <img  class=" text-2xl p-2"  src="@/assets/images/BAYC_header.png" />


                </div>

              
                 <div class=" relative pb-2 mb-12" style="min-height:200px">
                       
                    <div  class="   text-white text-2xl p-2" style="  background: #222b" > Open Source Unofficial Marketplace </div>


                </div>

                   <div> 
 

                     <div class="w-row text-center my-8"> 
                        <router-link to="/activity" class='text-orange-600 text-xl block'> View Recent Activity</router-link>
                    </div>


                  <div class="w-row text-center my-8">  
            
                      <router-link to="/collection/boredapes" class='text-gray-200 text-xl inline text-align:center' style="margin:0 auto;"> Shop Bored Apes </router-link>
                        
                    
                  </div>

                    <div class="w-row text-center my-8">  
        
                      <router-link to="/collection/mutantapes" class='text-gray-200 text-xl inline text-align:center ' style="margin:0 auto;"> Shop Mutants </router-link>
                        
                   </div>


                  </div> 

              </div>
 
         </div>
       </div>
     </div>
   </div>


   <div class="section  bg-white border-b-2 border-black hidden ">
     <div class=" w-container">
       <div class="w-row">

       </div>
       <div class="w-row"> 


         <div class="column w-col w-col-6 mt-8 py-8">

            <div>
               <SearchBar    /> 
            </div>

              <router-link to="/newbid" class='text-gray-800 text-xl block'>-> Place a Bid for an NFT</router-link>
 

               <router-link to="/startselling" class='text-gray-800 text-xl block'>-> View and Sell your NFTs</router-link>
            <br>
           
           <br>

      


         </div>

         <div class="column-2 w-col w-col-6  ">
           
                        
          
                      

         </div>

       </div>
     </div>
   </div>


   



    
  <Footer/>

</div>
</template>


<script>



import Web3Plug from '../js/web3-plug.js' 


import SearchBar from './components/legacy/SearchBar.vue';
import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import FrontPageMedia from './components/FrontPageMedia.vue'
 

export default {
  name: 'Home',
  props: [],
  components: {Navbar, Footer, FrontPageMedia, SearchBar},
  data() {
    return {
      web3Plug: new Web3Plug() ,
      activePanelId: null 
        
      
    }
  },

  created(){

 
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
    
   
   
  }, 
  methods: {
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
          

  }
}
</script>
