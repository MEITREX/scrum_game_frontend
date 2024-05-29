<script setup lang="ts">
import {
  type IssueBaseFragment,
  TShirtSizeEstimation
} from '@/gql/graphql'
import { isPresent } from '@/utils/types'
import { computed } from 'vue'
import IssueTypeIcon from '@/components/issue/IssueTypeIcon.vue'
import IssuePriorityIcon from '@/components/issue/IssuePriorityIcon.vue'

const props = defineProps<{
  issue: IssueBaseFragment
}>()

const emit = defineEmits<{
  (e: 'click', issue: IssueBaseFragment): void
}>()

const color = computed(() => {
  if (isPresent(props.issue.effortEstimation)) {
    switch (props.issue.effortEstimation) {
      case 'XS':
        return 'purple'
      case 'S':
        return 'green'
      case 'M':
        return 'blue'
      case 'L':
        return 'orange'
      case 'XL':
        return 'red'
    }
  }
  return 'grey'
})

function getEmoji(estimation: TShirtSizeEstimation) {
  switch (estimation) {
    case TShirtSizeEstimation.Xs:
      return '🐞'
    case TShirtSizeEstimation.S:
      return '🍏'
    case TShirtSizeEstimation.M:
      return '🍗'
    case TShirtSizeEstimation.L:
      return '🥩'
    case TShirtSizeEstimation.Xl:
      return '🦃'
  }
}

</script>

<template>
  <v-card
    width="280px"
    hover
    draggable="true"
    variant="elevated"
    density="compact"
    @click="() => emit('click', issue)"
  >
    <v-card-title>
      <div class="d-flex flex-row align-center justify-space-between w-100">
        <div class="d-flex flex-row align-center">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <issue-type-icon :type="issue.type" v-bind="props" style="height: 25px; width: 25px"/>
            </template>
            <span>{{ issue.type.name }}</span>
          </v-tooltip>

          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                <issue-priority-icon :priority="issue.priority" style="height: 25px; width: 25px"/>
              </span>
            </template>
            <span>{{ issue.priority }}</span>
          </v-tooltip>
        </div>

        <div class="d-flex flex-row align-center">
          <template v-for="(assignee, index) of issue.assignees" :key="index">
            <v-tooltip location="bottom" v-if="assignee !== null">
              <template v-slot:activator="{ props }">
                <v-avatar
                  density="compact"
                  :image="assignee?.user.avatar ?? undefined"
                  :size="25"
                  v-bind="props">
                </v-avatar>
              </template>
              <span>{{ assignee?.user.username }}</span>
            </v-tooltip>
          </template>
        </div>
      </div>
    </v-card-title>

    <v-card-text class="pb-1">
      {{ issue.title }}
    </v-card-text>

    <div class="pa-3 d-flex flex-row justify-space-between">
      <v-chip v-if="isPresent(issue.effortEstimation)"
              :color="color" density="comfortable">
        <b>{{ issue.effortEstimation }}</b> {{ getEmoji(issue.effortEstimation) }}
      </v-chip>
      <v-tooltip location="bottom" v-if="isPresent(issue.sprintNumber)">
        <template v-slot:activator="{ props }">
          <v-chip v-bind="props" color="grey" density="comfortable">
            <b>{{ issue.sprintNumber }}</b>
          </v-chip>
        </template>
        <span>Sprint number</span>
      </v-tooltip>
    </div>
  </v-card>
</template>

<style scoped>

</style>