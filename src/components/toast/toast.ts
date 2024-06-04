// setup toasts on various events
import { useToast } from 'vue-toastification'
import { watchImmediate } from '@vueuse/core'
import { usePlanningMeetingService } from '@/service/planning-meeting-service'
import { computed, type Ref } from 'vue'
import PlanningMeetingStartedToast from './PlanningMeetingStartedToast.vue'
import { routes } from '@/router/routes'
import { useStandupMeetingService } from '@/service/standup-meeting-service'
import StandupMeetingStartedToast from '@/components/toast/StandupMeetingStartedToast.vue'
import { reducedEventFragment, useEventService } from '@/service/event-service'
import { useFragment } from '@/gql'
import { useGlobalUserService } from '@/service/global-user-service'
import { getDisplayUserName } from '@/utils/user-utils'
import { abbreviate } from '@/utils/string-utils'

export function setupToast() {
  const toast = useToast()
  const { planningMeeting } = usePlanningMeetingService()
  const { standupMeeting } = useStandupMeetingService()

  const planningMeetingActive = computed(() => planningMeeting.value !== null)
  const standupMeetingActive = computed(() => standupMeeting.value !== null)

  function showToastWhenMeetingStarts(routeName: string, component: any, active: Ref<boolean>) {
    watchImmediate(active, (value) => {
      const route = window.location.pathname // no access to useRoute here
      if (route.includes(routeName)) { // user is already in the planning meeting
        return
      }

      if (value) {
        toast.info(component, {
          timeout: 30_000
        })
      }
    })
  }

  showToastWhenMeetingStarts(routes.projectSubRoutes.planningLive, PlanningMeetingStartedToast, planningMeetingActive)
  showToastWhenMeetingStarts(routes.projectSubRoutes.standupLive, StandupMeetingStartedToast, standupMeetingActive)

  const { newEventSubscription } = useEventService()
  newEventSubscription.onResult((result) => {
    const event = useFragment(reducedEventFragment, result?.data?.event)
    if (event?.eventType.identifier === 'XP_GAIN') {
      toast.success(event.message)
    }
    if (event?.eventType.identifier === 'EVENT_REACTION') {
      if (event.parent?.userId === useGlobalUserService().currentGlobalUser.value?.id) {
        const message = '❤️ from ' + getDisplayUserName(event.user) + ' on "' + abbreviate(event?.parent?.message, 40) + '"'
        toast.info(message,
          {
            timeout: 4_000
          })
      }
    }
    // add other toasts here if needed
  })
}
