<template>
  <div class="home">
      <ClassList msg="It's classes list"/>
  </div>
</template>

<script>
// @ is an alias to /src
import ClassList from '@/components/ClassList.vue'

export default {
  name: 'classes',
  components: {
    ClassList,
  },
}
</script>
