<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BaseGlobalUserFragment, StandupMeetingInput } from '@/gql/graphql'
import { isPresent } from '@/utils/types'
import router from '@/router'
import { routes } from '@/router/routes'
import { useProjectId } from '@/stores/project-id'
import { useStandupMeetingService } from '@/service/standup-meeting-service'
import UserSelect from '@/components/user/UserSelect.vue'

const meetingLeader = ref<BaseGlobalUserFragment | null>(null)
const meetingLeaderId = computed(() => meetingLeader.value?.id ?? null)

const projectId = computed(() => useProjectId().projectId.value)

const countdownSecondsSetting = ref(60)
const useCountdownPerAttendee = ref(false)

const countdownPerAttendee = computed(() => {
  if (useCountdownPerAttendee.value) {
    return countdownSecondsSetting.value
  }
  return null
})

const input = computed<StandupMeetingInput | null>(() => {
    if (!meetingLeaderId.value || !projectId.value) {
      return null
    }

    const result: StandupMeetingInput = {
      standupMeetingSettings: {
        countdownPerAttendee: countdownPerAttendee.value,
      },
      meetingLeaderId: meetingLeaderId.value
    }

    return result
  }
)

const valid = computed(() => isPresent(input.value))

const { createStandupMeeting, loading } = useStandupMeetingService()

function createMeeting() {
  if (input.value === null) {
    return
  }
  createStandupMeeting(input.value).then(() => {
    router.push(routes.project(useProjectId().getProjectIdOrThrow()).liveStandup)
  })
}
</script>

<template>
  <v-row class="pa-5">
    <v-col>
      <v-form>

        <h3>
          Standup meeting
        </h3>
        <v-row>
          <v-col>
            Timer
          </v-col>
          <v-col>
            <v-checkbox v-model="useCountdownPerAttendee" label="Use a timer per attendee" />
            <p>
              The timer will start for each attendee when they start their turn.
              Use this option if previous meetings have taken too long.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            Timer (seconds)
          </v-col>
          <v-col>
            <v-slider
              :disabled="!useCountdownPerAttendee"
              min="15"
              max="300"
              v-model="countdownSecondsSetting"
              thumb-label="always"
              step="5" />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            Meeting leader
          </v-col>
          <v-col>
            <user-select v-model="meetingLeader" initialize-with-current-user />
          </v-col>
        </v-row>

        <v-row>
          <v-btn
            :disabled="!valid"
            :loading="loading"
            @click="createMeeting()"
          >
            Create meeting
          </v-btn>
        </v-row>
      </v-form>

    </v-col>
  </v-row>
</template>

<style scoped>

</style>
