import {action} from '@ember/object';
import {service} from '@ember/service';
import Route from '@ember/routing/route';

import projectEditQuery from 'accent-webapp/queries/project-edit';
import RouteParams from 'accent-webapp/services/route-params';
import ApolloSubscription, {
  Subscription
} from 'accent-webapp/services/apollo-subscription';
import Transition from '@ember/routing/transition';

export default class BadgesRoute extends Route {
  @service('apollo-subscription')
  declare apolloSubscription: ApolloSubscription;

  @service('route-params')
  declare routeParams: RouteParams;

  subscription: Subscription;

  model(_params: any, transition: Transition) {
    if (this.subscription)
      this.apolloSubscription.clearSubscription(this.subscription);

    this.subscription = this.apolloSubscription.graphql(
      () => this.modelFor(this.routeName),
      projectEditQuery,
      {
        props: (data) => ({
          project: data.viewer.project
        }),
        options: {
          fetchPolicy: 'cache-and-network',
          variables: {
            projectId: this.routeParams.fetch(transition, 'logged-in.project')
              .projectId
          }
        }
      }
    );

    return this.subscription.currentResult();
  }

  deactivate() {
    this.apolloSubscription.clearSubscription(this.subscription);
  }

  @action
  onRefresh() {
    this.refresh();
  }
}
