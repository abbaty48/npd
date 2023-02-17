import fs from 'fs';
import { tmpdir } from 'os';
import shell from 'shelljs';
import request from 'request';
import { sep, join } from 'path';
import compressor from 'compressing';
import { IDownloadItem, IDownloadStatus } from './interfaces/iDownloadItem';

export class PackageDownloader implements IDownloadItem {
  readonly fileSize: string;
  readonly fileSizeByte: number;
  readonly dateTimeToISO: string;
  readonly originalFileName: string;
  private _status = {
    progressStatus: '',
    isDownloading: false,
    failedReason: '',
    isCompleted: false,
    isStarted: false,
    isFailed: false,
    isPaused: false,
  };
  private _shouldEndStream = false;
  private _shouldPauseStream = false;
  private _stream: fs.WriteStream = null;
  private _response: request.Request = undefined;
  constructor(
    public url: string,
    public newFileName: string,
    public oldFileName: string,
    public savedFilePath: string
  ) {
    // create a write stream to write the download file, using append flag with binary encoding
    this._stream = fs.createWriteStream(this.savedFilePath, {
      flags: 'a',
      encoding: 'binary',
    });
  }
  /* PAUSE/RESUME DOWNLOADING */
  pauseResume = (isPaused?: boolean) => {
    if (isPaused !== undefined) {
      this._shouldPauseStream = isPaused;
    } else {
      this._shouldPauseStream = !this._shouldPauseStream;
    }
    if (this._shouldPauseStream) {
      this._response.pause();
    } else {
      this._response.resume();
    }
  };
  /* STOP DOWNLOADING */
  stop = () => {
    this._shouldEndStream = true;
    this._stream.close(() => {
      console.log('CLOSED');
    });
  };
  /* STATES */
  onChangeStatus = (
    keys: string[],
    values: any[],
    callBack: (status: IDownloadStatus) => void
  ) => {
    keys.forEach((keyName, keyIndex) => {
      const keyValue = values[keyIndex];
      this._status = Object.assign(this._status, { [keyName]: keyValue });
    });
    callBack(this._status);
  };
  /* HELPER FUNCTIONS */
  // Held javascript execution flow for a duration
  private _sleep = (
    callback: () => void,
    durationMS = 1000,
    excuteCallback = true
  ) =>
    new Promise((resolve) => {
      setTimeout(() => {
        if (excuteCallback) {
          callback();
        }
        resolve(undefined);
      }, durationMS);
    });
  private async _compressToTarget(
    _targetExtension: string,
    _dir: string,
    _tempPackageDir: string
  ) {
    switch (_targetExtension) {
      case '.tgz':
        await compressor.tgz.compressDir(
          join(_dir, _tempPackageDir),
          this.savedFilePath
        );
        break;
      case '.tar':
        await compressor.tar.compressDir(
          join(_dir, _tempPackageDir),
          this.savedFilePath
        );
        break;
      case '.tar.gz':
        await compressor.tgz.compressDir(
          join(_dir, _tempPackageDir),
          this.savedFilePath
        );
        break;
      default:
        await compressor.tgz.compressDir(
          join(_dir, _tempPackageDir),
          this.savedFilePath
        );
        break;
    }
  }
  /**
   * fetchTarball
   * fetch the tarball from the server and return a stream data as the response
   */
  public downloadPackageOnly = (
    onStatus: (status: IDownloadStatus) => void,
    onProgress: (percentage: number) => void,
    onCompleted: () => void,
    onFailed: (reason: string) => void,
    onStarted: () => void
  ) => {
    try {
      //
      onStarted();
      //
      this.onChangeStatus(
        ['progressStatus', 'isStarted'],
        ['Initiating download', true],
        onStatus
      );
      // keep track of the tatalByte of the file and the number of byte recieved
      let receiveBytes = 0,
        totalBytes = 0;
      //#region  SLEEP#1
      this._sleep(() => {
        //#region  SLEEP#2
        this.onChangeStatus(
          ['progressStatus'],
          [`Requesting package at ${this.url}`],
          onStatus
        );
        this._sleep(() => {
          this._response = request.get(this.url);
          //
          this._response.on(
            'response',
            (_response) => {
              //
              totalBytes = parseInt(_response.headers['content-length']);

              _response.on('data', (chunk: string | any[]) => {
                // determine to end downloading
                if (this._shouldEndStream) {
                  // console.log('IN SHOUDLENDSTREAM');
                  this._stream.end(() => {
                    // console.log('END SHOUDLENDSTREAM');
                    this.onChangeStatus(
                      ['isStarted', 'isDownloading'],
                      [false, false],
                      onStatus
                    );
                  });
                  return;
                }
                // Toggle Download Pause/Continue
                if (this._shouldPauseStream) {
                  this.onChangeStatus(
                    ['isPaused', 'isDownloading'],
                    [true, false],
                    onStatus
                  );
                } else {
                  this.onChangeStatus(
                    ['isPaused', 'isDownloading'],
                    [false, true],
                    onStatus
                  );
                }
                // update recieve bytes
                receiveBytes += chunk.length;
                //
                this._stream.write(chunk);
                //
                this.onChangeStatus(
                  ['isDownloading', 'progressStatus'],
                  [true, `Downloading ${this.oldFileName}`],
                  onStatus
                );
                //
                onProgress(
                  Math.floor(Math.round((receiveBytes * 100) / totalBytes))
                );
              });
              //
              _response.on('end', () => {
                this.onChangeStatus(
                  [
                    'isStarted',
                    'isCompleted',
                    'isDownloading',
                    'progressStatus',
                  ],
                  [false, true, false, 'Download Completed.'],
                  onStatus
                );
                onCompleted();
                // close the stream
                this._stream.close();
              });
              //
              _response.on('error', (e: Error) => {
                this.onChangeStatus(
                  [
                    'isFailed',
                    'isStarted',
                    'isCompleted',
                    'isDownloading',
                    'failedReason',
                  ],
                  [true, true, false, false, e.message],
                  onStatus
                );
                onFailed(e.message);
              });
            } // end onResponse
          ); // end on
        }, 1500); // end sleep#2
        //#endregion
      }, 1500); // end sleep#1
      //#endregion
    } catch (error) {
      // reject(error)
      this.onChangeStatus(
        ['isFailed', 'failedReason'],
        [true, error.message],
        onStatus
      );
      onFailed(error.message);
    }
  };
  public downloadWithAllDependency = async (
    dependencies: Record<string, string> | undefined,
    devDependencies: Record<string, string> | undefined,
    onStatus: (status: IDownloadStatus) => void,
    onProgress: (percentage: number) => void,
    onCompleted: () => void,
    onFailed: (reason: string) => void,
    onStarted: () => void
  ) => {
    try {
      this.onChangeStatus(
        ['progressStatus'],
        ['Initiating download'],
        onStatus
      );

      if (!dependencies || !devDependencies) {
        throw new Error(
          'The package you are trying to download is not supported because it does not have dependencies/devDependencies list associated to it.'
        );
      } // end NOT dependencies/DevDependencies
      let totalBytes = 0,
        receiveBytes = 0,
        totalProgress = 0;
      // SLEEP#1
      await this._sleep(() => {
        // alarm the start of the download
        onStarted();
        // set isStarted
        this.onChangeStatus(
          ['isStarted', 'progressStatus'],
          [true, 'Creating a temporary folder.'],
          onStatus
        );
        // create a temporary folder and  download the package to the inside it first
        fs.mkdtemp(`${tmpdir}${sep}`, (err, _dir) => {
          if (err) {
            throw new Error(
              `Unable to create a temporary directory, reason: ${err.message}`
            );
          }
          this.onChangeStatus(
            ['progressStatus'],
            [`'${_dir}' temporary directory created.`],
            onStatus
          );
          // make 5% progress
          onProgress((totalProgress += 5));
          //
          let _downloadedTgzFilePath = join(_dir, this.newFileName);
          // console.log('TEMPORARY DIR: ', _dir);
          // console.log('TEMP FILE PATH', _downloadedTgzFilePath);
          this._stream = fs.createWriteStream(_downloadedTgzFilePath, {
            flags: 'a',
            encoding: 'binary',
          });
          /* DOWNLOAD MAIN PACKAGE */
          this.onChangeStatus(
            ['progressStatus'],
            [`Requesting package at ${this.url}`],
            onStatus
          );
          // SLEEP#2
          this._sleep(() => {
            this._response = request.get(this.url);
            this._response.on('response', (resp) => {
              totalBytes = parseInt(resp.headers['content-length']);
              //
              resp.on('data', (chunk) => {
                // Toggle Download Pause/Continue
                if (this._shouldPauseStream) {
                  this.onChangeStatus(
                    ['isPaused', 'isDownloading', 'progressStatus'],
                    [true, false, 'Download Paused'],
                    onStatus
                  );
                } else {
                  this.onChangeStatus(
                    ['isPaused', 'isDownloading', 'progressStatus'],
                    [false, true, 'Downloading Resumed'],
                    onStatus
                  );
                }
                //
                this.onChangeStatus(
                  ['isDownloading', 'progressStatus'],
                  [true, `Downloading ${this.oldFileName}`],
                  onStatus
                );
                // update recieve bytes
                receiveBytes += chunk.length;
                // write the data received from the server
                this._stream.write(chunk);
                // increment totalProgress
                totalProgress += Math.floor(
                  Math.round((receiveBytes * 100) / totalBytes)
                );
                onProgress(totalProgress);
              });
              //
              resp.on('error', (err: Error) => {
                this.onChangeStatus(
                  ['isFailed', 'failedReason', 'progressStatus'],
                  [true, err.message, 'Download Failed'],
                  onStatus
                );
                // forcly and recursively delete the temp folder
                // fs.rmSync(_dir, {
                //   force: true,
                //   recursive: true,
                // });
                // // delete the local saved file
                // fs.rmSync(join(this.savedFilePath, this.newFileName), {
                //   force: true,
                // });
                throw new Error(
                  `Something went wrong while downloading the package, reason: ${err.message}`
                );
              });
              //
              resp.on('end', () => {
                //
                this._stream.end(async () => {
                  // if closed then terminate
                  if (this._shouldEndStream) {
                    this.onChangeStatus(
                      ['isStarted', 'isDownloading', 'progressStatus'],
                      [false, false, 'Downloading stopped'],
                      onStatus
                    );
                    return;
                  }
                  //
                  this.onChangeStatus(
                    ['isDownloading', 'progressStatus'],
                    [
                      false,
                      `Downloading ${this.oldFileName} package completed.`,
                    ],
                    onStatus
                  );
                  // SLEEP#3
                  await this._sleep(
                    async () => {
                      // EXTRACT FILE TO A TEMP FOLDER
                      this.onChangeStatus(
                        ['progressStatus'],
                        ['Extracting downloaded package to a temp folder.'],
                        onStatus
                      );
                      //#region SLEEP#4
                      await this._sleep(() => {
                        compressor.tgz
                          .uncompress(_downloadedTgzFilePath, _dir)
                          .then(() => {
                            // total 3 for uncompress
                            onProgress((totalProgress += 3)); // end onProgress
                            // rename the package folder to the newFile by strip out the extension (.tar|tgz|tar.gz)
                            const _tempPackageDir = this.newFileName.replace(
                              /\.[tar|tgz|tar.gz]+$/g,
                              ''
                            );
                            fs.rename(
                              join(_dir, 'package'),
                              join(_dir, _tempPackageDir),
                              async () => {
                                //#region SLEEP#5
                                await this._sleep(async () => {
                                  // get inside the extract package and install package dependencies
                                  onProgress((totalProgress += 2));
                                  // RUN 'NPM INSTALL' SCRIPT TO INSTALL THE PACKAGE DEPENDENCIES
                                  this.onChangeStatus(
                                    ['progressStatus'],
                                    ['Installing package dependencies.'],
                                    onStatus
                                  );
                                  //#region SLEEP#6
                                  await this._sleep(() => {
                                    shell.exec(
                                      `cd ${join(
                                        _dir,
                                        _tempPackageDir
                                      )} && npm install`,
                                      async (code, stdout, stderr) => {
                                        if (code === 0) {
                                          this.onChangeStatus(
                                            ['progressStatus'],
                                            [
                                              `Installing ${this.oldFileName} package dependencies successfully.`,
                                            ],
                                            onStatus
                                          );
                                          onProgress(95);
                                          //#region SLEEP#7
                                          this.onChangeStatus(
                                            ['progressStatus'],
                                            [`Finalizing....`],
                                            onStatus
                                          );
                                          await this._sleep(async () => {
                                            // COMPRESS THE FOLDER TO A TARGET COMPRESS
                                            // get file extension
                                            const _targetExtension =
                                              this.oldFileName.match(
                                                /[tar|tgz|tar.gz]+$/g
                                              )[0];
                                            await this._compressToTarget(
                                              _targetExtension,
                                              _dir,
                                              _tempPackageDir
                                            );
                                            onProgress(100);
                                            //#region SLEEP#8
                                            await this._sleep(() => {
                                              // Delete the temp folder
                                              fs.rmSync(_dir, {
                                                force: true,
                                                recursive: true,
                                              });
                                              //
                                              this.onChangeStatus(
                                                [
                                                  'isCompleted',
                                                  'isStarted',
                                                  'progressStatus',
                                                ],
                                                [true, false, 'Done.'],
                                                onStatus
                                              );
                                              onCompleted();
                                              // close the stream
                                              this._stream.close();
                                            }, 500); //en sleep#8
                                            //#endregion sleeep#8
                                          }, 500); //
                                          //#endregion end sleep#7
                                        } // if code
                                      } // end shell.exec callback
                                    ); // end shell.exec
                                  }); // end sleep#6
                                  //#endregion sleep#6
                                }, 500); // end sleep#5
                                //#endregion sleep#5
                              } // end fs.rename callback
                            ); // end fs.rename
                          })
                          .catch((reason) => {
                            throw new Error(reason);
                          }); // end uncompress-then
                      }, 1500); // end sleep#4
                      //#endregion
                    },
                    1500,
                    !this._shouldEndStream
                  ); // end sleep#3
                }); // end stream.end()
              }); // end on-end
            }); // end on-response
          }, 1500); // end sleep#2;
        }); // end mkdtemp
      }, 1500); // end sleep#1
    } catch (error) {
      this.onChangeStatus(
        ['isFailed', 'failedReason', 'progressStatus'],
        [true, error, 'An error occured, reason: ' + error],
        onStatus
      );
      onFailed(error);
    } // end catch
  }; // end downloadWithAllDependency
} // end class
