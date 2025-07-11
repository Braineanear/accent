import Component from '@glimmer/component';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {dropTask} from 'ember-concurrency';
import Apollo from 'accent-webapp/services/apollo';

import improveTextPromptMutation from 'accent-webapp/queries/improve-text-prompt';
import projectPrompts from 'accent-webapp/queries/project-prompts';
import {IntlService} from 'ember-intl';
import FlashMessages from 'ember-cli-flash/services/flash-messages';

const FLASH_MESSAGE_PREFIX = 'components.improve_prompt.flash_messages.';
const FLASH_MESSAGE_PROMPT_IMPROVE_ERROR = `${FLASH_MESSAGE_PREFIX}improve_error`;

interface Args {
  text: string;
  project: {id: string};
  prompts: any[];
  onUpdatingText: () => void;
  onUpdateText: (value: string) => void;
}

interface Prompt {
  id: string;
  name: string;
}

interface PromptOption {
  label: string;
  value: string;
}

export default class ImprovePrompt extends Component<Args> {
  @service('apollo')
  declare apollo: Apollo;

  @service('intl')
  declare intl: IntlService;

  @service('flash-messages')
  declare flashMessages: FlashMessages;

  @tracked
  promptOptions: PromptOption[] = [];

  @tracked
  promptOptionValue: PromptOption | null;

  @tracked
  promptResult: string | null;

  @tracked
  promptResultUnchanged = true;

  @tracked
  promptOpened = false;

  get isSubmitting() {
    return this.submitTask.isRunning;
  }

  @action
  onSelectPromptOption(option: PromptOption) {
    this.promptOptionValue = option;
  }

  get quickAccessPrompts() {
    return this.args.prompts.filter((prompt) => prompt.quickAccess);
  }

  @action
  onAcceptText() {
    if (!this.promptResult) return;

    this.args.onUpdateText(this.promptResult);
    this.promptOpened = false;
  }

  fetchPromptOptions = dropTask(async () => {
    const variables = {projectId: this.args.project.id};
    const {data} = await this.apollo.client.query({
      query: projectPrompts,
      fetchPolicy: 'network-only',
      variables
    });

    if (!data.viewer.project.prompts) return;

    this.promptOptions = data.viewer.project.prompts.map((prompt: Prompt) => ({
      label: prompt.name,
      value: prompt.id
    }));
    this.promptOptionValue = this.promptOptions[0];
  });

  @action
  onPromptClose() {
    this.args.onUpdateText(this.args.text);
    this.promptOpened = false;
  }

  @action
  onPromptClick() {
    this.promptOpened = true;
  }

  submitTask = dropTask(async (promptId?: string) => {
    if (!promptId && !this.promptOptionValue) return;
    if (!this.promptOpened) this.args.onUpdatingText();

    this.promptResult = null;
    this.promptResultUnchanged = true;

    const variables = {
      text: this.args.text,
      promptId: promptId || this.promptOptionValue?.value
    };
    const {data} = await this.apollo.client.mutate({
      mutation: improveTextPromptMutation,
      variables
    });

    if (data.improveTextWithPrompt?.text) {
      if (this.promptOpened) {
        this.promptResult = data.improveTextWithPrompt.text;
        this.promptResultUnchanged = this.promptResult === this.args.text;
      } else {
        this.args.onUpdateText(data.improveTextWithPrompt.text);
      }
    } else if (data.improveTextWithPrompt?.errors) {
      this.args.onUpdateText(this.args.text);
      this.flashMessages.error(this.intl.t(FLASH_MESSAGE_PROMPT_IMPROVE_ERROR));
    }
  });
}
