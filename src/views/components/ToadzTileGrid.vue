<template> 
<div class="pt-8 relative pb-2 mb-12" style="min-height:300px;width:256px;margin:0 auto;" >
            
            
            
    <img v-for="tokenId of toadTokenIds" v-bind:src="'/images/toadz/'+tokenId+'.jpg'" width="64" class="inline-block select-none"  > </img>


 </div>
 </template>




<script>
    export default {
    name: 'ToadzTileGrid',
    props: [ ],
    data() {
        return {
             toadTokenIds:[11,28,50,51,78,88,155,182,232,297,323,380,431,451,457,483]
        }
    },
    created(){
         
    },
    methods: {
         update(){
             this.$forceUpdate()
         },
          
    }
    }
</script>
