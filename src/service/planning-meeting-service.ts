import { graphql, useFragment } from '@/gql'
import { provideApolloClient, useMutation, useSubscription } from '@vue/apollo-composable'
import { apolloClient } from '@/setup/apollo-client'
import { useProjectId } from '@/stores/project-id'
import { computed } from 'vue'
import { useAuth } from '@/service/use-auth'
import {
  Animal,
  type DefaultPlanningMeetingFragment,
  type DefaultSprintFragment,
  type PlanningMeetingInput,
  type PlanningMeetingPage,
  TShirtSizeEstimation
} from '@/gql/graphql'
import { sprintFragment } from '@/service/sprint-service'
import { useErrorManager } from '@/utils/error-manager'

class PlanningMeetingService {

  public planningMeeting = computed(() => {
    return useFragment(defaultPlanningMeetingFragment,
      this.planningMeetingSubscription.result.value?.planningMeeting) || null
  })

  public createPlanningMeeting = async (input: PlanningMeetingInput): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.createPlanningMeetingMutation.mutate({
      projectId: useProjectId().projectId.value,
      input
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.createPlanningMeeting) || null
  }

  public changePage = async (page: PlanningMeetingPage): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.changePageMutation.mutate({
      projectId: useProjectId().projectId.value,
      page
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.changePage) || null
  }

  public voteAnimal = async (animal: Animal): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.voteAnimalMutation.mutate({
      projectId: useProjectId().projectId.value,
      animal
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.voteAnimal) || null
  }

  public endAnimalVoting = async (): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.endAnimalVotingMutation.mutate({
      projectId: useProjectId().projectId.value
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.endAnimalVoting) || null
  }

  public addName = async (name: string): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.addNameMutation.mutate({
      projectId: useProjectId().projectId.value,
      name
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.addName) || null
  }

  public voteName = async (name: string): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.voteNameMutation.mutate({
      projectId: useProjectId().projectId.value,
      name
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.voteName) || null
  }

  public endNameVoting = async (): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.endNameVotingMutation.mutate({
      projectId: useProjectId().projectId.value
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.endNameVoting) || null
  }

  public voteEstimation = async (estimation: TShirtSizeEstimation): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.voteEstimationMutation.mutate({
      projectId: useProjectId().projectId.value,
      estimation
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.voteEstimation) || null
  }

  public restartEstimation = async (): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.restartEstimationMutation.mutate({
      projectId: useProjectId().projectId.value
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.restartEstimation) || null
  }

  public selectIssue = async (issueId: string | null): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.nextIssueMutation.mutate({
      projectId: useProjectId().projectId.value,
      issueId
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.nextIssue) || null
  }

  public startCountdown = async (seconds: number): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.startCountdownMutation.mutate({
      projectId: useProjectId().projectId.value,
      seconds
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.startCountdown) || null
  }

  public endEstimation = async (): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.endEstimationMutation.mutate({
      projectId: useProjectId().projectId.value
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.endEstimation) || null
  }

  public setFinalResult = async (
    estimation: TShirtSizeEstimation,
    assignUserIds: string[]
  ): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.setFinalResultMutation.mutate({
      projectId: useProjectId().projectId.value,
      estimation,
      assignUserIds
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.setFinalResult) || null
  }

  public addSprintIssue = async (issueId: string): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.addSprintIssueMutation.mutate({
      projectId: useProjectId().projectId.value,
      issueId
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.addSprintIssue) || null
  }

  public removeSprintIssue = async (issueId: string): Promise<DefaultPlanningMeetingFragment | null> => {
    const result = await this.removeSprintIssueMutation.mutate({
      projectId: useProjectId().projectId.value,
      issueId
    })
    return useFragment(defaultPlanningMeetingFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.removeSprintIssue) || null
  }

  public finishMeeting = async (): Promise<DefaultSprintFragment | null> => {
    const result = await this.finishMeetingMutation.mutate({
      projectId: useProjectId().projectId.value
    })
    return useFragment(sprintFragment,
      result?.data?.mutateProject?.mutatePlanningMeeting?.finishMeeting) || null
  }

  public loading = computed(() =>
    // exclude planningMeetingSubscription from loading state,
    // because it is always enabled when no active planning meetings exists
    this.createPlanningMeetingMutation.loading.value
    || this.changePageMutation.loading.value
    || this.voteAnimalMutation.loading.value
    || this.endAnimalVotingMutation.loading.value
    || this.addNameMutation.loading.value
    || this.voteNameMutation.loading.value
    || this.endNameVotingMutation.loading.value
    || this.voteEstimationMutation.loading.value
    || this.restartEstimationMutation.loading.value
    || this.nextIssueMutation.loading.value
    || this.startCountdownMutation.loading.value
    || this.endEstimationMutation.loading.value
    || this.setFinalResultMutation.loading.value
    || this.addSprintIssueMutation.loading.value
    || this.removeSprintIssueMutation.loading.value
    || this.finishMeetingMutation.loading.value
  )

  constructor() {
    this.createPlanningMeetingMutation.onError(useErrorManager().catchError)
    this.changePageMutation.onError(useErrorManager().catchError)
    this.voteAnimalMutation.onError(useErrorManager().catchError)
    this.endAnimalVotingMutation.onError(useErrorManager().catchError)
    this.addNameMutation.onError(useErrorManager().catchError)
    this.voteNameMutation.onError(useErrorManager().catchError)
    this.endNameVotingMutation.onError(useErrorManager().catchError)
    this.voteEstimationMutation.onError(useErrorManager().catchError)
    this.restartEstimationMutation.onError(useErrorManager().catchError)
    this.nextIssueMutation.onError(useErrorManager().catchError)
    this.startCountdownMutation.onError(useErrorManager().catchError)
    this.endEstimationMutation.onError(useErrorManager().catchError)
    this.setFinalResultMutation.onError(useErrorManager().catchError)
    this.addSprintIssueMutation.onError(useErrorManager().catchError)
    this.removeSprintIssueMutation.onError(useErrorManager().catchError)
    this.finishMeetingMutation.onError(useErrorManager().catchError)

    this.planningMeetingSubscription.onError(e => {
      useErrorManager().catchError(e)
    })
  }

  createPlanningMeetingMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation CreatePlanningMeeting($projectId: UUID!, $input: PlanningMeetingInput!) {
            mutateProject(id: $projectId) {
                createPlanningMeeting(input: $input) {
                    ...DefaultPlanningMeeting
                }
            }
        }`
    ))
  })

  changePageMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation ChangePage($projectId: UUID!, $page: PlanningMeetingPage!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    changePage(page: $page) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  voteAnimalMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation VoteAnimal($projectId: UUID!, $animal: Animal!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    voteAnimal(animal: $animal) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  endAnimalVotingMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation EndAnimalVoting($projectId: UUID!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    endAnimalVoting {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  addNameMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation AddName($projectId: UUID!, $name: String!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    addName(name: $name) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  voteNameMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation VoteName($projectId: UUID!, $name: String!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    voteName(name: $name) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  endNameVotingMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation EndNameVoting($projectId: UUID!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    endNameVoting {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  voteEstimationMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation VoteEstimation($projectId: UUID!, $estimation: TShirtSizeEstimation!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    voteEstimation(estimation: $estimation) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  restartEstimationMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation RestartEstimation($projectId: UUID!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    restartEstimation {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  nextIssueMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation NextIssue($projectId: UUID!, $issueId: String) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    nextIssue(issueId: $issueId) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  startCountdownMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation StartCountdown($projectId: UUID!, $seconds: Int!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    startCountdown(seconds: $seconds) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  endEstimationMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation EndEstimation($projectId: UUID!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    endEstimation {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ), () => ({
      refetchQueries: ['BoardQuery']
    }))
  })

  setFinalResultMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation SetFinalResult($projectId: UUID!, $estimation: TShirtSizeEstimation!, $assignUserIds: [UUID!]!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    setFinalResult(estimation: $estimation, assignUserIds: $assignUserIds) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ), () => ({
      refetchQueries: ['BoardQuery']
    }))
  })

  addSprintIssueMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation AddSprintIssue($projectId: UUID!, $issueId: String!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    addSprintIssue(issueId: $issueId) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  removeSprintIssueMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation RemoveSprintIssue($projectId: UUID!, $issueId: String!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    removeSprintIssue(issueId: $issueId) {
                        ...DefaultPlanningMeeting
                    }
                }
            }
        }`
    ))
  })

  finishMeetingMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation FinishMeeting($projectId: UUID!) {
            mutateProject(id: $projectId) {
                mutatePlanningMeeting {
                    finishMeeting {
                        ...DefaultSprint
                    }
                }
            }
        }`
    ), () => ({
      refetchQueries: ['Sprint']
    }))
  })

  planningMeetingSubscription = provideApolloClient(apolloClient)(() => {
    return useSubscription(graphql(`
        subscription PlanningMeeting($projectId: UUID!) {
            planningMeeting(projectId: $projectId) {
                ...DefaultPlanningMeeting
            }
        }`
    ), () => ({
      projectId: useProjectId().projectId.value
    }), () => ({
      enabled: useAuth().isLoggedIn() && useProjectId().isProjectSelected()
    }))
  })

}

const planningMeetingService = new PlanningMeetingService()

export function usePlanningMeetingService() {
  return planningMeetingService
}

export const defaultPlanningMeetingFragment = graphql(`
    fragment DefaultPlanningMeeting on PlanningMeeting {
        ...DefaultMeeting
        currentPage
        animalVoting {
            finished
            votableAnimals
            votingResult
            animalVotingStates {
                votedFor
                totalVotes
                userVotes {
                    user {
                        id
                        username
                    }
                }
            }
        }
        nameVoting {
            finished
            votableNames
            votingResult
            nameVotingStates {
                votedFor
                totalVotes
                userVotes {
                    user {
                        id
                        username
                    }
                }
            }
        }
        issueEstimation {
            finished
            countdownSeconds
            estimationStats {
                max
                min
                median
                mode
            }
            finalResult
            issueId # remark: in subscription context, requesting issues is not allowed, so we only get the id
            votes {
                totalVotes
                votedFor
                userVotes {
                    user {
                        id
                        username
                    }
                }
            }
        }
        sprintGoalVoting {
            finished
            nonSprintIssueIds
            sprintIssueIds
        }
    }`)

