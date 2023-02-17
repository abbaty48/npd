import { atom } from 'recoil';
import localforage from 'localforage';
import { IDownloadPackage } from '@commons/models/interfaces/iDownloadPackage';

const PackageDownloads = async () => {
  return (
    (await localforage.getItem<IDownloadPackage[]>('PackageDownloads')) ?? []
  );
};

export const PackageDownloadAtom = atom<IDownloadPackage[]>({
  key: 'PackageDownloadAtom',
  default: PackageDownloads(),
});
