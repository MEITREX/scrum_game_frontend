import { graphql, useFragment } from '@/gql'
import { provideApolloClient, useLazyQuery, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { apolloClient } from '@/setup/apollo-client'
import { useAuth } from '@/service/use-auth'
import { useProjectId } from '@/stores/project-id'
import { computed, ref } from 'vue'
import { useErrorManager } from '@/utils/error-manager'
import { useGlobalUserService } from '@/service/global-user-service'
import { useUserInProjectService } from '@/service/user-in-project-service'

class EventService {

  public events = computed(() => {
    return useFragment(eventWithChildrenFragment, this.eventQuery.result.value?.project?.events) || []
  })

  public eventsPageSize = ref(10)

  public fetchEventsOfUser = async (userId: string) => {
    if (!userId) return []

    const variables = {
      userId,
      projectId: useProjectId().projectId.value,
      page: 0,
      pageSize: 10
    }

    // load = first fetch, refetch = subsequent fetches
    await (this.eventsOfUserLazyQuery.load(null, variables)
      || this.eventsOfUserLazyQuery.refetch(variables))

    return useFragment(eventWithChildrenFragment,
      this.eventsOfUserLazyQuery.result.value?.globalUser?.userInProject?.publicEvents) || []
  }

  public likeEvent = async (eventId: string)  => {
    const result = await this.likeEventMutation.mutate({
      projectId: useProjectId().projectId.value,
      eventId
    })
    return useFragment(eventFragment, result?.data?.mutateProject?.reactToEvent) || null
  }

  public addUserComment = async (message: string, optionalParentId?: string) => {
    const result = await this.addUserCommentMutation.mutate({
      projectId: useProjectId().projectId.value,
      message,
      optionalParentId
    })
    return useFragment(eventFragment, result?.data?.mutateProject?.postComment) || null
  }

  public loading = computed(() => this.eventQuery.loading.value
    || this.eventsOfUserLazyQuery.loading.value
    || this.likeEventMutation.loading.value
    || this.addUserCommentMutation.loading.value)

  constructor() {
    this.eventQuery.onError(useErrorManager().catchError)
    this.eventsOfUserLazyQuery.onError(useErrorManager().catchError)
    this.likeEventMutation.onError(useErrorManager().catchError)
    this.addUserCommentMutation.onError(useErrorManager().catchError)

    // load new events and update stats when subscription triggers
    this.newEventSubscription.onResult(() => {
      this.eventQuery.refetch()
      useUserInProjectService().userStatsQuery.refetch()
    })
  }

  eventQuery = provideApolloClient(apolloClient)(() => {
      return useQuery(graphql(`
          query EventsOfProject($projectId: UUID!, $page: Int!, $pageSize: Int!) {
              project(id: $projectId) {
                  id
                  events(page: $page, size: $pageSize) {
                      ...EventWithChildren
                  }
              }
          }`
      ), () => ({
        projectId: useProjectId().projectId.value,
        page: 0,
        pageSize: this.eventsPageSize.value
      }), () => ({
        enabled: useAuth().isLoggedIn() && useProjectId().isProjectSelected(),
        refetchWritePolicy: 'overwrite',
        keepPreviousResult: true
      }))
    }
  )

  eventsOfUserLazyQuery = provideApolloClient(apolloClient)(() => {
    return useLazyQuery(graphql(`
        query EventsOfUser($userId: UUID!, $projectId: UUID!, $page: Int!, $pageSize: Int!) {
            globalUser(id: $userId) {
                userInProject(projectId: $projectId) {
                    publicEvents(page: $page, size: $pageSize) {
                        ...EventWithChildren
                    }
                }
            }
        }`
    ))
  })

  likeEventMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation LikeEvent($projectId: UUID!, $eventId: UUID!) {
            mutateProject(id: $projectId) {
                reactToEvent(eventId: $eventId) {
                    ...BaseEvent
                }
            }
        }`
    ), () => ({
      refetchQueries: ['EventsOfProject', 'IssueQuery']
    }))
  })

  private addUserCommentMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation AddUserComment($projectId: UUID!, $optionalParentId: UUID, $message: String!) {
            mutateProject(id: $projectId) {
                postComment(optionalParentEventId: $optionalParentId, comment: $message) {
                    ...BaseEvent
                }
            }
        }`
    ), () => ({
      refetchQueries: ['EventsOfProject']
    }))
  })

  newEventSubscription = provideApolloClient(apolloClient)(() => {
    return useSubscription(graphql(`
        subscription NewEvent($projectId: UUID!, $userId: UUID!) {
            event(projectId: $projectId, userId: $userId) {
                ...ReducedEvent
            }
        }`),
      () => ({
        projectId: useProjectId().projectId.value,
        userId: useGlobalUserService().currentGlobalUser.value?.id as string
      }), () => ({
        enabled: useAuth().isLoggedIn()
          && useProjectId().isProjectSelected()
          && useGlobalUserService().currentGlobalUser.value?.id
      }))
  })
}

const eventService = new EventService()

export function useEventService() {
  return eventService
}

export const reducedEventFragment = graphql(`
    fragment ReducedEvent on DefaultEvent {
        id
        timestamp
        user {
            id
            username
            avatar
        }
        message
        eventType {
            identifier
        }
        parent {
            userId
            message
        }
        issueId: field(name: "issueId") { value }
        issueTitle: field(name: "issueTitle") { value }
        repositoryName: field(name: "repositoryName") { value }
        repositoryUrl: field(name: "repositoryUrl") { value }
    }`
)

export const eventFragment = graphql(`
    fragment BaseEvent on DefaultEvent {
        id
        timestamp
        user {
            id
            username
            avatar
        }
        message
        eventType {
            identifier
        }
        eventData {
            key
            value
        }
        issueId: field(name: "issueId") { value }
        issueTitle: field(name: "issueTitle") { value }
        repositoryName: field(name: "repositoryName") { value }
        repositoryUrl: field(name: "repositoryUrl") { value }
        reactions {
            userId
        }
        xpForCurrentUser
    }`
)

export const eventWithChildrenFragment = graphql(`
    fragment EventWithChildren on DefaultEvent {
        ...BaseEvent
        children {
            ...BaseEvent
        }
    }`
)
