import {action} from '@ember/object';
import {service} from '@ember/service';
import {readOnly} from '@ember/object/computed';
import Controller from '@ember/controller';
import Peeker from 'accent-webapp/services/peeker';
import Merger from 'accent-webapp/services/merger';
import GlobalState from 'accent-webapp/services/global-state';
import IntlService from 'ember-intl/services/intl';
import FlashMessages from 'ember-cli-flash/services/flash-messages';
import {tracked} from '@glimmer/tracking';
import RouterService from '@ember/routing/router-service';

const FLASH_MESSAGE_CREATE_SUCCESS =
  'pods.document.merge.flash_messages.create_success';
const FLASH_MESSAGE_CREATE_ERROR =
  'pods.document.merge.flash_messages.create_error';

export default class AddTranslationsController extends Controller {
  @tracked
  model: any;

  @service('peeker')
  declare peeker: Peeker;

  @service('merger')
  declare merger: Merger;

  @service('global-state')
  declare globalState: GlobalState;

  @service('intl')
  declare intl: IntlService;

  @service('flash-messages')
  declare flashMessages: FlashMessages;

  @service('router')
  declare router: RouterService;

  @tracked
  revisionOperations: any = null;

  @readOnly('globalState.permissions')
  permissions: any;

  @readOnly('model.projectModel.project')
  project: any;

  @readOnly('project.revisions')
  revisions: any;

  @readOnly('project.versions.entries')
  versions: any;

  @readOnly('model.fileModel.documents.entries')
  documents: any;

  get documentFormatItem() {
    if (!this.globalState.documentFormats) return {};

    return this.globalState.documentFormats.find(({slug}) => {
      return slug === this.document.format;
    });
  }

  get document() {
    if (!this.documents) return;

    return this.documents.find(
      ({id}: {id: string}) => id === this.model.fileId
    );
  }

  @action
  closeModal() {
    this.send('onRefresh');

    this.router.transitionTo('logged-in.project.files', this.project.id);
  }

  @action
  cancelFile() {
    this.revisionOperations = null;
  }

  @action
  async peek({
    fileSource,
    documentFormat,
    revision,
    version,
    mergeType,
    mergeOptions
  }: {
    fileSource: any;
    documentFormat: string;
    revision: any;
    version: any;
    mergeType: string;
    mergeOptions: string[];
  }) {
    const file = fileSource;
    const project = this.project;
    const documentPath = this.document.path;

    const revisionOperations = await this.peeker.merge({
      project,
      revision,
      version,
      file,
      documentPath,
      documentFormat,
      mergeType,
      mergeOptions
    });

    this.revisionOperations = revisionOperations;
  }

  @action
  async merge({
    fileSource,
    revision,
    documentFormat,
    mergeType,
    mergeOptions
  }: {
    fileSource: any;
    revision: any;
    documentFormat: string;
    mergeType: string;
    mergeOptions: string[];
  }) {
    const file = fileSource;
    const project = this.project;
    const documentPath = this.document.path;

    try {
      await this.merger.merge({
        project,
        revision,
        file,
        documentPath,
        documentFormat,
        mergeType,
        mergeOptions
      });

      this.flashMessages.success(this.intl.t(FLASH_MESSAGE_CREATE_SUCCESS));
      this.send('closeModal');
    } catch (error) {
      this.flashMessages.error(this.intl.t(FLASH_MESSAGE_CREATE_ERROR));
    }
  }
}
