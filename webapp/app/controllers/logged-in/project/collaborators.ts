import {service} from '@ember/service';
import {action} from '@ember/object';
import {readOnly, equal, and} from '@ember/object/computed';
import Controller from '@ember/controller';

import collaboratorCreateQuery from 'accent-webapp/queries/create-collaborator';
import collaboratorDeleteQuery from 'accent-webapp/queries/delete-collaborator';
import collaboratorUpdateQuery from 'accent-webapp/queries/update-collaborator';
import IntlService from 'ember-intl/services/intl';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import ApolloMutate from 'accent-webapp/services/apollo-mutate';
import GlobalState from 'accent-webapp/services/global-state';

const FLASH_MESSAGE_PREFIX = 'pods.project.edit.flash_messages.';
const FLASH_MESSAGE_COLLABORATOR_ADD_SUCCESS = `${FLASH_MESSAGE_PREFIX}collaborator_add_success`;
const FLASH_MESSAGE_COLLABORATOR_ADD_ERROR = `${FLASH_MESSAGE_PREFIX}collaborator_add_error`;
const FLASH_MESSAGE_COLLABORATOR_REMOVE_SUCCESS = `${FLASH_MESSAGE_PREFIX}collaborator_remove_success`;
const FLASH_MESSAGE_COLLABORATOR_REMOVE_ERROR = `${FLASH_MESSAGE_PREFIX}collaborator_remove_error`;
const FLASH_MESSAGE_COLLABORATOR_UPDATE_SUCCESS = `${FLASH_MESSAGE_PREFIX}collaborator_update_success`;
const FLASH_MESSAGE_COLLABORATOR_UPDATE_ERROR = `${FLASH_MESSAGE_PREFIX}collaborator_update_error`;

export default class CollaboratorsController extends Controller {
  @service('intl')
  declare intl: IntlService;

  @service('flash-messages')
  declare flashMessages: FlashMessages;

  @service('apollo-mutate')
  declare apolloMutate: ApolloMutate;

  @service('global-state')
  declare globalState: GlobalState;

  @readOnly('model.project')
  project: any;

  @readOnly('project.collaborators')
  collaborators: any[];

  @readOnly('globalState.permissions')
  permissions: any;

  @equal('model.project.name', undefined)
  emptyData: boolean;

  @and('emptyData', 'model.loading')
  showLoading: boolean;

  @action
  async createCollaborator({email, role}: {email: string; role: string}) {
    const project = this.project;

    return this.mutateResource({
      mutation: collaboratorCreateQuery,
      successMessage: FLASH_MESSAGE_COLLABORATOR_ADD_SUCCESS,
      errorMessage: FLASH_MESSAGE_COLLABORATOR_ADD_ERROR,
      variables: {
        projectId: project.id,
        email,
        role
      }
    });
  }

  @action
  async updateCollaborator(collaborator: {id: string}, {role}: {role: string}) {
    return this.mutateResource({
      mutation: collaboratorUpdateQuery,
      successMessage: FLASH_MESSAGE_COLLABORATOR_UPDATE_SUCCESS,
      errorMessage: FLASH_MESSAGE_COLLABORATOR_UPDATE_ERROR,
      variables: {
        collaboratorId: collaborator.id,
        role
      }
    });
  }

  @action
  async deleteCollaborator(collaborator: {id: string}) {
    return this.mutateResource({
      mutation: collaboratorDeleteQuery,
      successMessage: FLASH_MESSAGE_COLLABORATOR_REMOVE_SUCCESS,
      errorMessage: FLASH_MESSAGE_COLLABORATOR_REMOVE_ERROR,
      variables: {
        collaboratorId: collaborator.id
      }
    });
  }

  private async mutateResource({
    mutation,
    variables,
    successMessage,
    errorMessage
  }: {
    mutation: any;
    variables: any;
    successMessage: string;
    errorMessage: string;
  }) {
    const response = await this.apolloMutate.mutate({
      mutation,
      variables,
      refetchQueries: ['ProjectCollaborators']
    });

    if (response.errors) {
      this.flashMessages.error(this.intl.t(errorMessage));
    } else {
      this.flashMessages.success(this.intl.t(successMessage));
    }

    return response;
  }
}
