import {service} from '@ember/service';
import {action} from '@ember/object';
import {equal, and, readOnly} from '@ember/object/computed';
import Controller from '@ember/controller';
import JIPT from 'accent-webapp/services/jipt';
import GlobalState from 'accent-webapp/services/global-state';
import Session from 'accent-webapp/services/session';
import {tracked} from '@glimmer/tracking';

export default class ProjectsController extends Controller {
  @service('jipt')
  declare jipt: JIPT;

  @service('global-state')
  declare globalState: GlobalState;

  @service('session')
  declare session: Session;

  queryParams = ['query', 'page'];

  @tracked
  query = '';

  @tracked
  page = 1;

  @readOnly('model.permissions')
  permissions: any;

  @equal('model.projects.entries', undefined)
  emptyEntries: boolean;

  @and('emptyEntries', 'model.loading')
  showLoading: boolean;

  constructor(...args: any) {
    super(...args);

    this.jipt.redirectIfEmbedded();
  }

  @action
  changeQuery(query: string) {
    this.query = query;
  }

  @action
  selectPage(page: number) {
    window.scrollTo(0, 0);

    this.page = page;
  }
}
