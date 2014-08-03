part of raxa_web;

@Component(
    selector: 'actions-settings',
    templateUrl: 'lib/components/settings/actions/actions.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class ActionsSettingsComponent {
    final ModelService modelService;

    ActionsSettingsComponent(this.modelService);
}
