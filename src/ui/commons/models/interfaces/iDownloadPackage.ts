export interface IDownloadPackage {
  url: string;
  downloadKey: string;
  newFileName: string;
  savedFilePath: string;
  originalFileName: string;
  downloadType: 'PackageOnly' | 'WithAllDependency';
  status: {
    isDownloading: boolean;
    isCompleted: boolean;
    isStarted: boolean;
    isPaused: boolean;
    isFailed: boolean;
    failedReason: string;
    progress: number;
    progressStatus?: string;
  };
}
