import {action} from '@ember/object';
import {service} from '@ember/service';
import {gt} from '@ember/object/computed';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import {tracked} from '@glimmer/tracking';
import {timeout, restartableTask} from 'ember-concurrency';

const DEBOUNCE_OFFSET = 1000; // ms

interface Args {
  query: string;
  document: any;
  documents: any[];
  version: any;
  versions: any[];
  revisions: any[];
  meta: any;
  withAdvancedFilters: boolean;
  isTextEmptyFilter: boolean;
  isTextNotEmptyFilter: boolean;
  isAddedLastSyncFilter: boolean;
  isCommentedOnFilter: boolean;
  isConflictedFilter: boolean;
  isTranslatedFilter: boolean;
  jipt?: boolean;
  onChangeQuery: (query: string) => void;
  onChangeDocument: () => void;
  onChangeVersion: () => void;
  onChangeAdvancedFilterBoolean: () => void;
}

export default class TranslationsFilter extends Component<Args> {
  @service('intl')
  declare intl: IntlService;

  @gt('args.documents.length', 1)
  showDocumentsSelect: boolean;

  @gt('args.versions.length', 0)
  showVersionsSelect: boolean;

  @tracked
  debouncedQuery = this.args.query;

  @tracked
  displayAdvancedFilters = this.args.withAdvancedFilters;

  get mappedDocuments() {
    if (!this.args.documents) return [];

    const documents = this.args.documents.map(
      ({id, path}: {id: string; path: string}) => ({
        label: path,
        value: id
      })
    );

    documents.unshift({
      label: this.intl.t(
        'components.translations_filter.document_default_option_text'
      ),
      value: ''
    });

    return documents;
  }

  get documentValue() {
    return this.mappedDocuments.find(
      ({value}: {value: string}) => value === this.args.document
    );
  }

  get mappedVersions() {
    const versions = this.args.versions.map(
      ({id, tag}: {id: string; tag: string}) => ({
        label: tag,
        value: id
      })
    );

    versions.unshift({
      label: this.intl.t(
        'components.translations_filter.version_default_option_text'
      ),
      value: ''
    });

    return versions;
  }

  get versionValue() {
    return this.mappedVersions.find(
      ({value}: {value: string}) => value === this.args.version
    );
  }

  @action
  setDebouncedQuery(event: Event) {
    const target = event.target as HTMLInputElement;

    this.debounceQuery.perform(target.value);
  }

  debounceQuery = restartableTask(async (query: string) => {
    this.debouncedQuery = query;

    await timeout(DEBOUNCE_OFFSET);

    this.args.onChangeQuery(query);
  });

  @action
  submitForm(event: Event) {
    event.preventDefault();

    this.args.onChangeQuery(this.debouncedQuery);
  }

  @action
  toggleAdvancedFilters() {
    this.displayAdvancedFilters = !this.displayAdvancedFilters;
  }

  @action
  autofocus(input: HTMLInputElement) {
    input.focus();
  }
}
