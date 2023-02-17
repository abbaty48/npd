import Async from 'react-async'
import { Tag } from 'primereact/tag'
import { Badge } from 'primereact/badge'
import { Panel } from 'primereact/panel'
import { Toast } from 'primereact/toast'
import { useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { useRecoilStateLoadable } from 'recoil'
import { ProgressBar } from 'primereact/progressbar'
import { SplitButton } from 'primereact/splitbutton'
import { ProgressSpinner } from 'primereact/progressspinner'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup'
import { PackageDownloadsSelector } from '@recoils/packageDownloaderSelector'
import { IDownloadPackage } from '@commons/models/interfaces/iDownloadPackage'

enum FILTERS {
   ALL,
   COMPLETED,
   DOWNLOADING
}

const DownloadsHistory = () => {
   // HOOKS
   const toastRef = useRef<Toast>(null)
   const [filters, setFilters] = useState<FILTERS>(FILTERS.ALL)
   const [{ contents, state }, setPackageDownloadStore] = useRecoilStateLoadable<IDownloadPackage[]>(PackageDownloadsSelector)

   // METHODS
   /**
    * 
   const changeStates = (keys: string[], values: unknown[], callBack?: () => void) => {
      let newStates = states
      keys.forEach((keyName, keyIndex) => {
         newStates = Object.assign(states, { [keyName]: values[keyIndex] })
      })
      setStates({ ...newStates });
      callBack?.call(this)
   }
   */
   /** */
   const onAction = async function (action: 'STOP' | 'PAUSE' | 'RESUME' | 'RETRY', dlItem: IDownloadPackage) {
      switch (action) {
         case 'STOP': Renderer.downloadOnStop(dlItem.downloadKey); break;
         case 'PAUSE': Renderer.downloadOnPauseResume(dlItem.downloadKey, true); break;
         case 'RESUME': Renderer.downloadOnPauseResume(dlItem.downloadKey, false); break;
         case 'RETRY': Renderer.download(dlItem.downloadKey, dlItem.url, dlItem.originalFileName, dlItem.newFileName, dlItem.savedFilePath, dlItem.downloadType); break;
      } // end switch
   } // onAction

   /** DELETE ALL DOWNLOAD HISTORY */
   const onDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      confirmPopup({
         accept() {
            setPackageDownloadStore([])
         },
         target: event.currentTarget,
         icon: 'pi pi-exclamation-traingle',
         message: "You're about to delete all the downloading history, are you sure to proceed."
      });
   }
   /** FILTER DOWNLOAD STATUS */
   const statusFilter = (item: IDownloadPackage) => {
      switch (filters) {
         case FILTERS.ALL:
            return item.status.isCompleted || item.status.isDownloading
         case FILTERS.COMPLETED:
            return item.status.isCompleted
         case FILTERS.DOWNLOADING:
            return item.status.isDownloading
         default: return item.status.isCompleted || item.status.isDownloading
      }
   }

   return (
      <div className='flex flex-col justify-between overflow-hidden max-h-[560px]'>
         {
            contents?.length > 0 && (
               <div className='flex justify-end items-baseline py-3 px-1'>
                  {/* FILTER COMPLETED/ONGOING DOWNLOADS */}
                  <SplitButton label='Filter' icon={'pi pi-filter'} className='p-button-outlined p-button-secondary mr-2 mb-2' model={[
                     /* Use Strict Search */
                     {
                        label: 'All',
                        icon: 'pi pi-asterick',
                        command(event) {
                           setFilters(FILTERS.ALL)
                        },
                     },
                     {
                        label: 'Completed',
                        icon: 'pi pi-check',
                        command(event) {
                           setFilters(FILTERS.COMPLETED)
                        },
                     },
                     {
                        label: 'OnGoing',
                        icon: 'pi pi-download',
                        command(event) {
                           setFilters(FILTERS.DOWNLOADING)
                        },
                     }
                  ]} />
                  {/* CLEAR ALL DOWNLOAD LIST */}
                  <Button icon={'pi pi-trash'} className='pi-button-text' onClick={(e) => onDelete(e)} />
               </div>
            )
         }
         <ConfirmPopup />
         <Toast ref={toastRef} position='bottom-right' className='w-fit max-w-fit' style={{ width: 'max-content' }} />
         <div className='flex-1 justify-items-center my-2 overflow-y-auto'>
            {/* DOWNLOAD LIST */}
            {
               state === 'loading' ? <ProgressSpinner className='place-self-center my-2' /> :
                  state === 'hasError' ? <p className='text-center my-2 text-sm'>Sorry something is amiss, an error occured, can't get download list.</p> :
                     state === 'hasValue' && (
                        contents?.length > 0 ?
                           contents?.filter((filter: IDownloadPackage) => statusFilter(filter)).map((item: IDownloadPackage) => {
                              {
                                 if (item.status.isCompleted) {
                                    toastRef.current?.show({
                                       life: 8000,
                                       severity: 'success',
                                       summary: 'Download Completed',
                                       detail: `Download for '${item.originalFileName}' completed, saved as '${item.newFileName}' located at '${item.savedFilePath}'`
                                    })
                                 }
                              }
                              return <Panel key={item.downloadKey} className='w-full my-1 rounded-md text-sm'
                                 headerTemplate={
                                    <div className='flex flex-row justify-between items-center py-2 px-1 w-full'>
                                       <div className='flex flex-row space-x-2'>
                                          <strong>{item.newFileName}</strong>
                                          <Badge severity='info' value={item.version} />
                                       </div>
                                       <p>
                                          {item.status.isPaused && <Tag severity='warning' value={<span className='space-x-1'>Paused <i className='pi pi-pause text-gray-500'></i></span>}></Tag>}
                                          {item.status.isCompleted && <Tag severity='success' value={<span className='space-x-1'>Downloaded <i className='pi pi-check text-gray-500'></i></span>}></Tag>}
                                          {item.status.isDownloading && <Tag severity='success' value={<span className='space-x-1'>Downloading <i className='pi pi-spinner text-gray-500 '></i></span>}></Tag>}
                                          {item.status.isFailed && <Tag severity='danger' value={<span className='space-x-1'>Failed <i className='pi pi-exclamation-circle text-gray-500'></i></span>}></Tag>}
                                       </p>
                                    </div>
                                 }>
                                 {/* DETAILS */}
                                 <div className="px-1 py-2 space-y-1">
                                    <p>Base name: {item.originalFileName}</p>
                                    <p>Save as: {item.newFileName}</p>
                                    <p>Version: {item.version}</p>
                                    <p>Download type: {item.downloadType}</p>
                                    <p>Date on: {item.dateTime}</p>
                                    <p>Tarball: {item.url}</p>
                                    <p>Saved path: {item.savedFilePath}</p>
                                 </div>
                                 {/* PROGRESS AND CONTROLS */}
                                 {
                                    !item.status.isCompleted && (
                                       <div className='flex flex-col justify-center space-y-4 w-4/6'>
                                          <>
                                             <div className='flex flex-row items-center'>
                                                <ProgressBar mode={
                                                   ((item.status.isStarted && !item.status.isDownloading) || item.status.isFailed || item.status.isPaused) ? 'indeterminate' :
                                                      'determinate'
                                                } className='flex-none w-full' value={item.status.progress} showValue={false} style={{ height: '6px' }} />
                                                {item.status.isDownloading && <span className='mx-2'>{item.status.progress}%</span>}
                                             </div>
                                             {/* Progress Status */}
                                             {item.status.progressStatus && <p className='m-1 text-ellipsis text-xs'>{item.status.progressStatus}</p>}
                                          </>
                                          <div className='flex place-self-center items-center justify-center w-2/3 space-x-2'>
                                             {
                                                // Download Started and is Downloading show the cancel button
                                                (item.status.isStarted && item.status.isDownloading) && (
                                                   <Button icon={'pi pi-times'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('STOP', item)} />
                                                )
                                             }
                                             {
                                                // Download Failed
                                                (item.status.isFailed && (
                                                   <Button icon={'pi pi-replay'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('RETRY', item)} />
                                                ))
                                             }
                                             {
                                                // Download is Pause
                                                item.status.isPaused && <Button icon={'pi pi-play'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('RESUME', item)} />
                                             }
                                             {
                                                // Download is ongoing
                                                (!item.status.isPaused && item.status.isDownloading) && <Button icon={'pi pi-pause'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('PAUSE', item)} />
                                             }
                                          </div>
                                       </div>
                                    )
                                 }
                              </Panel>
                           }
                           ) :
                           <div className='h-64 w-full flex flex-col items-center justify-center text-center'>
                              <p><i className='pi pi-download text-3xl text-center'></i></p>
                              <p>No Downloads</p>
                           </div>
                     )
            }
         </div>
      </div>
   )
}

export default DownloadsHistory