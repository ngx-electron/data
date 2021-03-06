import {Inject, Injectable, NgZone} from '@angular/core';
import {Action, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {concat, Observable} from 'rxjs';
import {NgxElectronService} from '@ngx-electron/core';

@Injectable({
  providedIn: 'root'
})
export class NgxElectronDataService {
    constructor(private store$: Store<any>,
                private ngZone: NgZone,
                private router: Router,
                private electronService: NgxElectronService) {
        this.electronService.ipcRenderer.on(`ngx-electron-action-shared-${this.electronService.remote.getCurrentWindow().id}`,
            (event, action) => this.ngZone.run(() => this.store$.dispatch(action)));
        this.electronService.ipcRenderer.send(`ngx-electron-win-init-${this.electronService.remote.getCurrentWindow().id}`);
    }

    /**
     * 发送action id用来指定要发送的win对象 需要指定
     */
    dispatch(action: Action, ...ids: number[]);
    /**
     * 发送action key用来指定要发送的win对象 调用此方法需要主进程初始化@ngx-electron/electron-main模块
     */
    dispatch(action: Action, ...keys: string[]);

    dispatch(action: Action, ...idKeys: any[]) {
        if (this.electronService.isElectron()) {
            if (idKeys && idKeys.length) {
                idKeys.filter(idKey => idKey)
                    .map(idKey => {
                        switch (typeof idKey) {
                            case 'number': {
                                return idKey;
                            }
                            case 'string': {
                                return this.electronService.isLoadElectronMain && this.electronService.getWinIdByKey(idKey);
                            }
                            default: return null;
                        }
                    })
                    .filter(id => id)
                    .map(id => this.electronService.remote.BrowserWindow.fromId(id))
                    .filter(win => win)
                    .forEach(win => win.webContents.send(`ngx-electron-action-shared-${win.id}`, action));
            } else {
                this.electronService.remote.BrowserWindow.getAllWindows()
                    .forEach(win => win.webContents.send(`ngx-electron-action-shared-${win.id}`, action));
            }
        } else {
            this.store$.dispatch(action);
        }
    }

    openPage(routerUrl: string, options: any/*BrowserWindowConstructorOptions*/ = {}, {
        key = routerUrl,
        actions = [],
        webHandler = () => this.router.navigateByUrl(routerUrl),
        complete = () => {},
        created = () => {}
    }: {
        key?: string,
        actions?: Observable<Action>[],
        webHandler?: () => void,
        complete?: () => void,
        created?: (any) => void
    } = {
        key: routerUrl,
        actions: [],
        webHandler: () => this.router.navigateByUrl(routerUrl),
        complete: () => {},
        created: () => {}
    }): any/*BrowserWindow*/ {
        if (this.electronService.isElectron()) {
            if (this.electronService.isLoadElectronMain) {
                const winId = this.electronService.getWinIdByKey(key);
                console.log(`获得窗口${key}的窗口ID:${winId}`);
                if (winId) {
                    const win = this.electronService.remote.BrowserWindow.fromId(winId);
                    win.focus();
                    return win;
                }
            }
            const win2 = this.electronService.createWindow(routerUrl, key, options, created);
            console.log(`创建窗口成功`);
            this.electronService.remote.ipcMain.on(`ngx-electron-win-init-${win2.id}`, event =>
                concat(...actions).subscribe(action =>
                        win2.webContents.send(`ngx-electron-action-shared-${win2.id}`, action),
                    () => {},
                    () => complete()));
            return win2;
        } else {
            webHandler();
        }
    }
}
