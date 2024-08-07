<script setup lang="ts">
import { KnownAsset } from '@/gql/graphql'
import { useSprintService } from '@/service/sprint-service'
import AnimalEnclosure from '@/components/animal/AnimalEnclosure.vue'
import { useProjectId } from '@/stores/project-id'
import { useShopService } from '@/service/shop-service'
import { computed, ref } from 'vue'

const props = defineProps<{
  newAsset: KnownAsset | null,
}>()

const { currentSprint } = useSprintService()
const { buyAndPlace, buyAndPlaceMutation } = useShopService()

const xPos = ref(0)
const yPos = ref(0)

function setAssetPosition(x: number, y: number) {
  xPos.value = x
  yPos.value = y
}

async function placeAsset() {
  if (!props.newAsset) {
    return
  }
  await buyAndPlace(useProjectId().getProjectIdOrThrow(), {
    asset: props.newAsset,
    x: Math.round(xPos.value),
    y: Math.round(yPos.value)
  })
}

const percentageComplete = computed(() => {
  const val = (currentSprint.value?.stats.percentageStoryPointsCompleted ?? 0) / 100

  return Math.min(1, val)
})
</script>

<template>
  <v-dialog activator="parent" width="700">
    <template #default="{ isActive }">
      <v-card height="600">
        <v-card-title>
          Place new object
        </v-card-title>
        <v-card-text>
          <animal-enclosure
            :animal="currentSprint?.animal ?? null"
            :percentage-complete="percentageComplete"
            :placed-assets="currentSprint?.placedAssets ?? []"
            :new-asset-to-place="newAsset"
            @place-asset="setAssetPosition"
          />
        </v-card-text>
        <v-card-actions>

          <v-btn @click="() => isActive.value = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="() => { placeAsset().then(() => isActive.value = false) }"
            :loading="buyAndPlaceMutation.loading.value || false"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped>

</style>
