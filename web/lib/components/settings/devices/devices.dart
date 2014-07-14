part of raxa_web;

@Component(
    selector: 'devices-settings',
    templateUrl: 'lib/components/settings/devices/devices.html',
    publishAs: 'cmp',
    useShadowDom: false
)
class DevicesSettingsComponent {
    final ModelService modelService;
    final RestService restService;

    DevicesSettingsComponent(this.modelService, this.restService);
}
