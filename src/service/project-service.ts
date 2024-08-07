import { graphql, useFragment } from '@/gql'
import { provideApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import { apolloClient } from '@/setup/apollo-client'
import { computed, type ComputedRef } from 'vue'
import type { CreateProjectInput, ProjectBaseFragment, ProjectMainFragment, UpdateProjectInput } from '@/gql/graphql'
import { isPresent, type Nullable } from '@/utils/types'
import { useAuth } from '@/service/use-auth'
import { useProjectId } from '@/stores/project-id'
import { useErrorManager } from '@/utils/error-manager'

/**
 * Service for managing projects.
 */
class ProjectService {

  /**
   * Reference to the currently selected project.
   * This is undefined if no project is selected.
   */
  public project: ComputedRef<Nullable<ProjectMainFragment>> = computed(() => {
    return useFragment(this.ProjectMainFragment,
      this.projectMainQueryResult.result.value?.project) || null
  })

  /**
   * Reference to all projects.
   */
  public allProjects: ComputedRef<readonly ProjectBaseFragment[]> = computed(() => {
    return useFragment(this.ProjectBaseFragment,
      this.allProjectsQueryResult.result.value?.projects) || []
  })

  public refetchAllProjects = async () => this.allProjectsQueryResult.refetch()

  public createProject = async (createProjectInput: CreateProjectInput) => {
    const result = await this.createProjectMutation.mutate({ input: createProjectInput })
    return useFragment(this.ProjectMainFragment, result?.data?.createProject)
  }

  public updateProject = async (updateProjectInput: UpdateProjectInput) => {
    const result = await this.updateProjectMutation.mutate({
      projectId: this.projectId.value,
      input: updateProjectInput
    })
    return useFragment(this.ProjectMainFragment, result?.data?.updateProject)
  }

  public deleteProject = async (projectId: string) => {
    this.projectMainQueryResult.refetch()
    await this.deleteProjectMutation.mutate({ projectId })
  }

  public loading = computed(() =>
    this.projectMainQueryResult.loading.value
    || this.allProjectsQueryResult.loading.value
    || this.createProjectMutation.loading.value
    || this.updateProjectMutation.loading.value
    || this.deleteProjectMutation.loading.value)

  public error = computed(() =>
    this.projectMainQueryResult.error.value
    || this.allProjectsQueryResult.error.value
    || this.createProjectMutation.error.value
    || this.updateProjectMutation.error.value
    || this.deleteProjectMutation.error.value)

  constructor() {
    this.projectMainQueryResult.onError(useErrorManager().catchError)
    this.allProjectsQueryResult.onError(useErrorManager().catchError)
    this.createProjectMutation.onError(useErrorManager().catchError)
    this.updateProjectMutation.onError(useErrorManager().catchError)
    this.deleteProjectMutation.onError(useErrorManager().catchError)
  }

  private projectId = useProjectId().projectId

  ProjectMainFragment = graphql(`
      fragment ProjectMain on Project {
          id
          name
          description
          currentSprintNumber

          projectSettings {
              imsSettings {
                  imsName
                  imsIcon {
                      path
                  }
                  imsProjectUrl
                  issueStates {
                      name
                      type
                  }
                  issueTypes {
                      name
                  }
              }
              codeRepositorySettings {
                  repositories {
                      name
                      url
                      icon {
                          mdiIcon
                      }
                  }
              }
              definitionOfDone {
                  text
                  required
                  implies {
                      text
                      required
                      implies {
                          text
                          required
                      }
                  }
              }
          }
      }
  `)

  ProjectBaseFragment = graphql(`
      fragment ProjectBase on Project {
          id
          name
          description

          currentUser {
              roles {
                  projectPrivileges
              }
          }
      }
  `)

  projectMainQueryResult = provideApolloClient(apolloClient)(() => {
    return useQuery(graphql(`
        query ProjectMainQuery($projectId: UUID!) {
            project(id: $projectId) {
                ... ProjectMain
            }
        }
    `), () => ({
      projectId: this.projectId.value
    }), () => ({
      enabled: useAuth().isLoggedIn() && isPresent(this.projectId.value)
    }))
  })

  allProjectsQueryResult = provideApolloClient(apolloClient)(() => {
    return useQuery(graphql(`
        query AllProjectsQuery {
            projects {
                ... ProjectBase
            }
        }
    `), {}, () => ({
      enabled: useAuth().isLoggedIn()
    }))
  })

  createProjectMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation CreateProject($input: CreateProjectInput!) {
            createProject(input: $input) {
                ... ProjectMain
            }
        }
    `),  () => ({
      refetchQueries: ['AllProjectsQuery']
    }))
  })

  updateProjectMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation UpdateProject($projectId: UUID!, $input: UpdateProjectInput!) {
            updateProject(id: $projectId, input: $input) {
                ... ProjectMain
            }
        }
    `),() => ({
      refetchQueries: ['AllProjectsQuery', 'ProjectMainQuery']
    }))
  })

  deleteProjectMutation = provideApolloClient(apolloClient)(() => {
    return useMutation(graphql(`
        mutation DeleteProject($projectId: UUID!) {
            deleteProject(id: $projectId)
        }
    `), () => ({
      refetchQueries: ['AllProjectsQuery']
    }))
  })

}

const projectServiceInstance = new ProjectService()

export function useProjectService() {
  return projectServiceInstance
}
