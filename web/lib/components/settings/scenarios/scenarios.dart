part of raxa_web;

@Component(
    selector: 'scenarios-settings',
    templateUrl: 'lib/components/settings/scenarios/scenarios.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class ScenariosSettingsComponent {
    final ModelService modelService;

    ScenariosSettingsComponent(this.modelService);
}
