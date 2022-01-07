<template>
  <div class="    text-xs" style=" ">

 
    <div  v-if="itemData && !hiddenForSearch">
      <div class="tree-list-row cursor-pointer" @click="clickedButton" :class="{'text-gray-600':isFolder()}">


         <span v-if="isFolder() && collapsed" class="inline   ">
           <svg class="svg-icon inline" viewBox="0 0 20 20">
							<path d="M14.613,10c0,0.23-0.188,0.419-0.419,0.419H10.42v3.774c0,0.23-0.189,0.42-0.42,0.42s-0.419-0.189-0.419-0.42v-3.774H5.806c-0.23,0-0.419-0.189-0.419-0.419s0.189-0.419,0.419-0.419h3.775V5.806c0-0.23,0.189-0.419,0.419-0.419s0.42,0.189,0.42,0.419v3.775h3.774C14.425,9.581,14.613,9.77,14.613,10 M17.969,10c0,4.401-3.567,7.969-7.969,7.969c-4.402,0-7.969-3.567-7.969-7.969c0-4.402,3.567-7.969,7.969-7.969C14.401,2.031,17.969,5.598,17.969,10 M17.13,10c0-3.932-3.198-7.13-7.13-7.13S2.87,6.068,2.87,10c0,3.933,3.198,7.13,7.13,7.13S17.13,13.933,17.13,10"></path>
						</svg> </span>


           <span class="hover:bg-gray-500 w-full font-serious text-lg"  :class="{'inline-block': !isFolder()}"  >   {{ itemData.title  }} </span>

      </div>
      <div class="tree-list-children pl-2" v-if="itemData.children && !collapsed">
        <TreeListItem
          v-for="item in itemData.children"
          :key="item.title"
          v-bind:parentTitle="itemData.title"
          v-bind:itemData="item"
          v-bind:onClickCallback="onClickCallback"
          v-bind:searchQuery="searchQuery"
         />
      </div>
    </div>

  </div>
</template>


<script>
export default {
  name: 'TreeListItem',
  props: ['onClickCallback','itemData','searchQuery','parentTitle'],
  components: {
  },
  data() {
    return {
      myPlayer: null,
      focusItemSlot: null,
      collapsed:true,
      hiddenForSearch:false
    }
  },
  watch: {
      	searchQuery: function(newVal, oldVal) { // watch it
          // console.log('Prop changed: ', newVal, ' | was: ', oldVal)
          // console.log(this.itemData.title.toString())
          if(newVal && newVal.length > 0)
          {
            this.hiddenForSearch = !this.itemData.title.toString().toLowerCase().includes( newVal.toLowerCase() ) && !this.isFolder()
          }else{
            this.hiddenForSearch = false;
          }
        }
  },
  
  
  methods: {
    setCollapsed: function(collapsed){
        this.collapsed=collapsed
    },
    isFolder: function(){
      return (this.itemData.children && this.itemData.children.length > 0)
    },
    clickedButton: function( )
    {
      //bubble out to a callback
      if(this.isFolder()){ //has children
        this.setCollapsed(  !this.collapsed  )//toggle me
      }else{
          this.onClickCallback( {parent: this.parentTitle , leaf: this.itemData.title} )
          //bubbles up the chain to the tree list
      }
    }
  }
}
</script>