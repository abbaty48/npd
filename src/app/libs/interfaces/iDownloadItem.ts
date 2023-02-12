export interface IDownloadStatus {
  readonly progressStatus?: string;
  readonly isDownloading: boolean;
  readonly failedReason: string;
  readonly isCompleted: boolean;
  readonly isStarted: boolean;
  readonly isFailed: boolean;
  readonly isPaused: boolean;
}

export interface IDownloadItem {
  /**  size of the file in unit e.g 1BN */
  readonly fileSize: string;
  /**  size of the file in byte */
  readonly fileSizeByte: number;
  /** current date and time of the download event. */
  readonly dateTimeToISO: string;
  /** original server name */
  readonly originalFileName: string;
  /** */
  // status: IDownloadStatus;
  /** resume/pause the download */
  pauseResume: (isPaused?: boolean) => void;
  /** */
  stop: () => void;
  /** */
  downloadPackageOnly: (
    /** get download status */
    onStatus: (status: IDownloadStatus) => void,
    /** fired on every download progress */
    onProgress: (percentage: number) => void,
    /** fire when the download is completed */
    onCompleted: () => void,
    /** fire when the download failed */
    onFailed: (reason: string) => void
  ) => void;
  /* */
  downloadWithAllDependency: (
    // dependencies
    dependencies: Record<string, string> | undefined,
    // devDependencies
    devDependencies: Record<string, string> | undefined,
    /** get download status */
    onStatus: (status: IDownloadStatus) => void,
    /** fired on every download progress */
    onProgress: (percentage: number) => void,
    /** fire when the download is completed */
    onCompleted: () => void,
    /** fire when the download failed */
    onFailed: (reason: string) => void
  ) => void;
}
