import { graphql, useFragment } from '@/gql'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { apolloClient } from '@/setup/apollo-client'
import { type DefaultMeetingFragment, MeetingType } from '@/gql/graphql'
import { computed } from 'vue'
import { useErrorManager } from '@/utils/error-manager'
import { useAppStore } from '@/stores/app-store'

class MeetingService {

  public joinMeeting = async (type: MeetingType): Promise<DefaultMeetingFragment | null> => {
    const result = await this.joinMeetingMutation.mutate({ projectId: this.getProjectId(), type })
    return useFragment(meetingFragment, result?.data?.mutateProject?.joinMeeting) || null
  }

  public leaveMeeting = async (type: MeetingType): Promise<DefaultMeetingFragment | null> => {
    const result = await this.leaveMeetingMutation.mutate({ projectId: this.getProjectId(), type })
    return useFragment(meetingFragment, result?.data?.mutateProject?.leaveMeeting) || null
  }

  public promoteToMeetingLeader = async (type: MeetingType, userId: string): Promise<DefaultMeetingFragment | null> => {
    const result = await this.promoteToMeetingLeaderMutation.mutate({ projectId: this.getProjectId(), type, userId })
    return useFragment(meetingFragment, result?.data?.mutateProject?.promoteToMeetingLeader) || null
  }

  private getProjectId = () => {
    return useAppStore().getProjectIdOrThrow()
  }

  public loading = computed(() =>
    this.joinMeetingMutation.loading.value
    || this.leaveMeetingMutation.loading.value
    || this.promoteToMeetingLeaderMutation.loading.value)

  constructor() {
    this.joinMeetingMutation.onError(useErrorManager().catchError)
    this.leaveMeetingMutation.onError(useErrorManager().catchError)
    this.promoteToMeetingLeaderMutation.onError(useErrorManager().catchError)
  }

  private joinMeetingMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation JoinMeeting($projectId: UUID!, $type: MeetingType!) {
            mutateProject(id: $projectId) {
                joinMeeting(type: $type) {
                    ...DefaultMeeting
                }
            }
        }
    `))
  })

  private leaveMeetingMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation LeaveMeeting($projectId: UUID!, $type: MeetingType!) {
            mutateProject(id: $projectId) {
                leaveMeeting(type: $type) {
                    ...DefaultMeeting
                }
            }
        }
    `))
  })

  private promoteToMeetingLeaderMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation PromoteToMeetingLeader($projectId: UUID!, $type: MeetingType!, $userId: UUID!) {
            mutateProject(id: $projectId) {
                promoteToMeetingLeader(type: $type, userId: $userId) {
                    ...DefaultMeeting
                }
            }
        }
    `))
  })

}

const meetingService = new MeetingService();

export function useMeetingService() {
  return meetingService;
}

export const meetingFragment = graphql(`
    fragment DefaultMeeting on Meeting {
        meetingType
        active
        attendees {
            role
            state
            user {
                id
                username
                avatar
            }
        }
    }
`)
