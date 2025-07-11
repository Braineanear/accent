import {service} from '@ember/service';
import Route from '@ember/routing/route';
import Exporter from 'accent-webapp/services/exporter';
import JIPTController from 'accent-webapp/controllers/logged-in/project/files/jipt';

export default class JIPTRoute extends Route {
  @service('exporter')
  declare exporter: Exporter;

  queryParams = {
    documentFormatFilter: {
      refreshModel: true
    }
  };

  model({fileId}: {fileId: string}) {
    return {
      projectModel: this.modelFor('logged-in.project'),
      fileModel: this.modelFor('logged-in.project.files'),
      fileId
    };
  }

  resetController(controller: JIPTController, isExiting: boolean) {
    controller.exportLoading = true;

    if (isExiting) {
      controller.fileRender = null;
    }
  }
}
