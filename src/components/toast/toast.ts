// setup toasts on various events
import { useToast } from 'vue-toastification'
import { watchImmediate } from '@vueuse/core'
import { usePlanningMeetingService } from '@/service/planning-meeting-service'
import { computed, type Ref } from 'vue'
import PlanningMeetingStartedToast from './PlanningMeetingStartedToast.vue'
import { routes } from '@/router/routes'

export function setupToast() {
  const toast = useToast()
  const { planningMeeting } = usePlanningMeetingService()

  const planningMeetingActive = computed(() => planningMeeting.value !== null)

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

}