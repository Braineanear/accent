import {service} from '@ember/service';
import {readOnly, equal, and} from '@ember/object/computed';
import Controller from '@ember/controller';
import GlobalState from 'accent-webapp/services/global-state';

export default class TranslationController extends Controller {
  @service('global-state')
  declare globalState: GlobalState;

  @readOnly('globalState.permissions')
  permissions: any;

  @equal('model.translation', undefined)
  emptyTranslation: boolean;

  @and('emptyTranslation', 'model.loading')
  showSkeleton: boolean;
}
