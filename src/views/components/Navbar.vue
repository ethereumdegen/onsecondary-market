<template>
  <div data-collapse="small" data-animation="default" data-duration="400" class="navbar w-nav">
    <div class=" bg-transparent bg-gray-700">
    <div class="container w-container margin-center">
      <div class="w-full flex flex-row">
        <div class="brand">
        
        </div>
        <router-link to="/" class='brand w-nav-brand w--current flex-grow inline text-xl text-gray-200 font-bold no-underline'>
        🍌 BAYC Market
        </router-link>

 
 
       <div class="hidden lg:inline-block text-black  " >
          
         <UpperNav
          v-bind:web3Plug="web3Plug"
          />

          <div v-if="hasIncorrectNetworkId()" class="  text-center bg-gray-600 text-yellow-400 font-boring">  Please switch to the {{getPrimaryNetworkName()}} network </div>
       </div>


       <div class="inline-block lg:hidden  pull-right p-4"  >

         <button @click="showResponsiveMenu=!showResponsiveMenu" class="flex items-right px-3 py-2 border rounded text-black border-teal-400 hover:text-white hover:border-white">
          <svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
        </button>

        <div v-if="showResponsiveMenu" class="w-full absolute left-0 block flex-grow lg:flex lg:items-center lg:w-auto bg-gray-200" style="z-index: 10;">
          <div class="text-sm lg:flex-grow">
             <AccordionNav 
             v-bind:web3Plug="web3Plug"
             />

          </div>

        </div>

       </div>

      </div>

    </div>
    </div>
  </div>
</template>


<script>
import UpperNav from './UpperNav.vue';
import AccordionNav from './AccordionNav.vue';

import FrontendHelper from '../../js/frontend-helper.js';

export default {
  name: 'Navbar',
  props: ['web3Plug'],
  components: {UpperNav,AccordionNav},
  data() {
    return {
      showResponsiveMenu: false,
    }
  },
  mounted(){



  },
  methods: {

    hasIncorrectNetworkId(){

      let activeNetworkId = this.web3Plug.getActiveNetId() 
      if(activeNetworkId && activeNetworkId != FrontendHelper.getNetworkIdForEnv()){

        return true 
      }

      return false 

    },

    getPrimaryNetworkName( ){
      return FrontendHelper.getNetworkNameForEnv()
    }


  }
}
</script>