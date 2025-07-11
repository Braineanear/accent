import {service} from '@ember/service';
import {action} from '@ember/object';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import GlobalState from 'accent-webapp/services/global-state';
import {tracked} from '@glimmer/tracking';
import {dropTask} from 'ember-concurrency';

interface Args {
  project: any;
  onCreate: ({email, role}: {email: string; role: string}) => Promise<void>;
}

const invalidEmail = (email: string) => !email.match(/@/);

export default class CreateForm extends Component<Args> {
  @service('intl')
  declare intl: IntlService;

  @service('global-state')
  declare globalState: GlobalState;

  @tracked
  isCreating = false;

  @tracked
  email = '';

  @tracked
  role = this.possibleRoles[0];

  @tracked
  invalidEmail = invalidEmail(this.email);

  get possibleRoles() {
    return this.globalState.roles.map(({slug}: {slug: string}) => slug);
  }

  get mappedPossibleRoles() {
    return this.possibleRoles.map((value) => ({
      label: this.intl.t(`general.roles.${value}`),
      value
    }));
  }

  get roleValue() {
    return this.mappedPossibleRoles.find(({value}) => value === this.role);
  }

  submitTask = dropTask(async () => {
    if (!this.email || !this.role) return;

    this.isCreating = true;

    await this.args.onCreate({email: this.email, role: this.role});

    this.email = '';
    this.isCreating = false;
  });

  @action
  setRole({value}: {value: string}) {
    this.role = value;
  }

  @action
  emailChanged(event: any) {
    this.email = event.target.value;
    this.invalidEmail = invalidEmail(event.target.value);
  }
}
