import {ModuleWithProviders, NgModule} from '@angular/core';
import {NgxElectronCoreModule} from '@ngx-electron/core';
import {NgxElectronDataService} from './ngx-electron-data.service';

@NgModule({
    imports: [
        NgxElectronCoreModule,
    ],
    declarations: [],
    exports: []
})
export class NgxElectronDataModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxElectronDataModule,
            providers: [
                NgxElectronDataService
            ]
        };
    }
}
