import {service} from '@ember/service';
import Route from '@ember/routing/route';
import Exporter from 'accent-webapp/services/exporter';
import ExportController from 'accent-webapp/controllers/logged-in/project/versions/export';

export default class ExportRoute extends Route {
  @service('exporter')
  declare exporter: Exporter;

  queryParams = {
    revisionFilter: {
      refreshModel: true
    },
    documentFilter: {
      refreshModel: true
    },
    documentFormatFilter: {
      refreshModel: true
    },
    orderByFilter: {
      refreshModel: true
    }
  };

  model({versionId}: {versionId: string}) {
    return {
      projectModel: this.modelFor('logged-in.project'),
      versionModel: this.modelFor('logged-in.project.versions'),
      versionId
    };
  }

  resetController(controller: ExportController, isExiting: boolean) {
    controller.exportLoading = true;

    if (isExiting) {
      controller.fileRender = null;
    }
  }
}
