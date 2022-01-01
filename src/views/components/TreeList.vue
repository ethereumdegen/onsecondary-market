<template>

    <div class="tree-list-children pl-2">

      <div class="mr-2 pb-2 px-2">
        <input   v-model ="searchQuery" class="shadow appearance-none border rounded w-full mr-2 py-0 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-xs" > </input>
      </div>

      <div  >

      
      <TreeListItem
        v-for="item in inputArray.children"
        :key="item.title"

        v-bind:parentTitle="inputArray.title"
        v-bind:itemData="item"
        v-bind:onClickCallback="onClickCallback"
        v-bind:searchQuery="searchQuery"

       />
    </div>

    </div>

</template>


<script>
//const treelistdata = require('../../../../shared/worlddata/itemtreelist.json')
import TreeListItem from './TreeListItem'
export default {
  name: 'TreeList',
  props: ['onClickCallback','inputArray'],
  components: {
    TreeListItem
  },
  data() {
    return {
      itemData: {},
      searchQuery:''
    }
  },
  mounted() {
     
  },
  methods: {
    updatedSearchQuery: function()
    {
      /*if(this.searchQuery && this.searchQuery.length > 0)
      {
      }else{
      }*/
    }
  }
}
</script>