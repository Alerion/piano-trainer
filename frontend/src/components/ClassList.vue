<template>
  <v-item-group>
    <v-container>
      <v-row>
        <v-col
           v-for="item in items"
           :key=item.name
           cols="12"
           md="4"
           lg="3"
        >
          <v-item>
            <v-card
              class="mx-auto"
              outlined
              :color = isLearnt(item.name)
            >
              <v-list-item three-line>
                <v-list-item-content>
                  <div class="overline mb-4">{{item.group}}</div>
                  <v-list-item-title class="headline mb-1">
                    {{item.title}}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{item.description}}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-avatar
                  tile
                  size="80"
                  color="green"
                ></v-list-item-avatar>
              </v-list-item>

              <v-card-actions>
                <v-btn text>Start!</v-btn>
              </v-card-actions>
            </v-card>
          </v-item>
        </v-col>
      </v-row>
    </v-container>
  </v-item-group>
</template>

<script>
const learnt = ['class1']
export default {
  name: 'ClassList',

  data() {
    return {
      items: [
        {
          title: 'Class 1',
          name: 'class1',
          group: 'GROUP 1',
          description: 'The short (I think short, but I\'m no sure) description',
        },
        {
          title: 'Class 2',
          name: 'class2',
          group: 'GROUP 1',
          description: 'The short (I think short, but I\'m no sure) description',
        },
        {
          title: 'Class 3',
          name: 'class3',
          group: 'GROUP 1',
          description: 'The short (I think short, but I\'m no sure) description',
        },
      ],
      isLearnt(name) {
        return learnt.includes(name) ? 'grey' : ''
      },
    }
  },
}
</script>
