import { selector } from 'recoil';
import localforage from 'localforage';
import { PackageDownloadAtom } from '@recoils/packageDownloaderAtom';
import { IDownloadPackage } from '@commons/models/interfaces/iDownloadPackage';

export const PackageDownloadsSelector = selector({
  key: 'PackageDownloadsSelector',
  get: async ({ get }) => {
    try {
      return get<IDownloadPackage[]>(await PackageDownloadAtom);
    } catch (error) {}
  },
  set({ get, set }, newValue: IDownloadPackage[]) {
    try {
      localforage.setItem('PackageDownloads', newValue, (err, value) => {
        if (err) return;
        set(PackageDownloadAtom, value);
      });
    } catch (error) {}
  },
});
