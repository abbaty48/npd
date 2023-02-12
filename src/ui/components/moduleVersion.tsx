import { Badge } from 'primereact/badge'
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import React, { useEffect, useRef, useState } from 'react'
import { SplitButton } from 'primereact/splitbutton'
import { ProgressBar } from 'primereact/progressbar'
import { BlockUI, BlockUIProps } from 'primereact/blockui'
import { IModuleVersion } from '@commons/models/interfaces/iModule'
import { IDownloadPackage } from '@commons/models/interfaces/iDownloadPackage'

interface IProps {
   moduleVersion: IModuleVersion,
   isOpen?: boolean
}
export const ModuleVersion = (props: IProps) => {
   // 
   const { isOpen: open, moduleVersion: v } = props
   // determine when the download is inprogress or any issue. e.g error
   const toastRef = useRef<Toast>(null)
   const [isBlocked, setIsBlocked] = useState(false)
   const [isOpen, setIsOpen] = useState(open ?? false)
   const [dlPackage, setDlPackage] = useState<IDownloadPackage>()
   useEffect(() => {
      const downloadKey = Math.floor(Math.random() * Date.now()).toString(16)
      setDlPackage(prevStatus => ({
         ...prevStatus,
         downloadKey
      }))
   }, [setDlPackage])

   /** */
   const toggleCollapse = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.currentTarget.nodeName !== 'DIV') {
         return
      }
      setIsOpen(!isOpen)
   }
   /** */
   const onDownload = async (actionType: 'PackageOnly' | 'WithAllDependency') => {

      // choose where to save the file
      const resolve = await Renderer.saveFile(v.dist.tarball);
      // if user cancelled the dialog, a null will be return and abort the download
      if (resolve === null) return;
      //
      const { newFileName, oldFileName, filePath } = resolve
      // generate a download unique key
      /* LISTENS */
      // Start Download
      await new Promise(resolve => {
         Renderer.download(
            dlPackage.downloadKey,
            v.dist.tarball, oldFileName, newFileName, filePath, actionType, v.dependencies, v.devDependencies
         );
         // STORE download info: tarball,oldFile,newFileName, filePath, actionType, downloadKey to localForage
         // Download Status
         Renderer.downloadOnStatus((key, isDownloading, isCompleted, isStarted, isPaused, isFailed, failedReason, progressStatus) => {
            if (key !== dlPackage.downloadKey) return
            // 
            setIsBlocked(true)
            if (isStarted || isDownloading) {
               setDlPackage(prevStates => ({
                  ...prevStates,
                  newFileName,
                  url: v.dist.tarball,
                  downloadType: actionType,
                  savedFilePath: newFileName,
                  originalFileName: oldFileName,
                  status: {
                     isDownloading,
                     isCompleted,
                     isStarted,
                     isFailed,
                     isPaused,
                     failedReason,
                     progressStatus,
                     progress: prevStates.status.progress,
                  }
               }))
            }
            // STORE status info: isDownloading, isCompleted, isStarted, isPaused, isFailed, failedReason to localForage
         })
         // Download Failed
         Renderer.downloadOnFailed((key, reason) => {
            if (key !== dlPackage.downloadKey) return
            setDlPackage(prevStatus => ({
               ...prevStatus,
               status: {
                  ...prevStatus.status,
                  isFailed: true,
                  failedReason: reason
               }
            }))
            toastRef.current?.show({
               life: 5000,
               severity: 'error',
               summary: 'Download Failed',
               detail: `Download for '${dlPackage.originalFileName}' failed, reason: ${reason}`
            })
         })
         // Download Completed
         Renderer.downloadOnCompleted((key) => {
            if (key !== dlPackage.downloadKey) return
            setTimeout(() => {
               setIsBlocked(false)
            }, 5000); // 1minute
            // show notification message
            toastRef.current?.show({
               life: 8000,
               severity: 'success',
               contentClassName: 'w-fit',
               summary: 'Download Completed',
               detail: `Download for '${dlPackage.originalFileName}' completed, saved as '${dlPackage.newFileName}' located at '${dlPackage.savedFilePath}'`
            })
         })
         // Download Progress
         Renderer.downloadOnProgress((key, percentage) => {
            if (key !== dlPackage.downloadKey) return
            setDlPackage(prevStatus => ({
               ...prevStatus,
               status: {
                  ...prevStatus.status,
                  progress: percentage
               }
            }))
            // setDlStatus(prevStatus => ({
            //    ...prevStatus,
            //    progress: percentage
            // }))
         })

         resolve(undefined)
      }) // end promise
   }
   /** */
   const onAction = async function (action: 'STOP' | 'PAUSE' | 'RESUME' | 'RETRY') {
      switch (action) {
         case 'STOP': Renderer.downloadOnStop(dlPackage.downloadKey); break;
         case 'PAUSE': Renderer.downloadOnPauseResume(dlPackage.downloadKey, true); break;
         case 'RESUME': Renderer.downloadOnPauseResume(dlPackage.downloadKey, false); break;
         case 'RETRY': Renderer.download(dlPackage.downloadKey, dlPackage.url, dlPackage.originalFileName, dlPackage.newFileName, dlPackage.savedFilePath, dlPackage.downloadType); break;
      }
   }
   /** */
   const onClose = () => {
      // if (dlPackage.status.isDownloading || dlPackage.status.isStarted && !dlPackage.status.isFailed) {
      if (dlPackage.status.isDownloading || dlPackage.status.isStarted) {
         return
      }
      setIsBlocked(false)
   }
   /* */
   const DownloadTemplate = (props: BlockUIProps) => {
      return (
         <>
            <div className='flex flex-col items-center justify-center relative h-full w-full'>
               <Button icon="pi pi-times" className='p-button-text'
                  style={{ position: 'absolute', top: '8px', right: '8px' }} onClick={onClose} />
               {
                  dlPackage.status.isCompleted ? (
                     <p className='my-3 text-center' >Download Completed</p>
                  ) : (
                     <div className='flex flex-col justify-center space-y-4 w-4/6'>
                        <>
                           <div className='flex flex-row items-center'>
                              <ProgressBar mode={
                                 ((dlPackage.status.isStarted && !dlPackage.status.isDownloading) || dlPackage.status.isFailed || dlPackage.status.isPaused) ? 'indeterminate' :
                                    'determinate'
                              } className='flex-none w-full' value={dlPackage.status.progress} showValue={false} style={{ height: '6px' }} />
                              {dlPackage.status.isDownloading && <span className='mx-2'>{dlPackage.status.progress}%</span>}
                           </div>
                           {/* Progress Status */}
                           {dlPackage.status.progressStatus && <p className='m-1 text-ellipsis text-xs text-gray-100'>{dlPackage.status.progressStatus}</p>}
                        </>
                        <div className='flex place-self-center items-center justify-center w-2/3 space-x-2'>
                           {
                              // Download Started and is Downloading show the cancel button
                              (dlPackage.status.isStarted && dlPackage.status.isDownloading) && (
                                 <Button icon={'pi pi-times'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('STOP')} />
                              )
                           }
                           {
                              // Download Failed
                              (dlPackage.status.isFailed && (
                                 <Button icon={'pi pi-replay'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('RETRY')} />
                              ))
                           }
                           {
                              // Download is Pause
                              dlPackage.status.isPaused && <Button icon={'pi pi-play'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('RESUME')} />
                           }
                           {
                              // Download is ongoing
                              (!dlPackage.status.isPaused && dlPackage.status.isDownloading) && <Button icon={'pi pi-pause'} style={{ width: '30px', height: '30px' }} className='p-button-rounded pi-button-text' onClick={() => onAction('PAUSE')} />
                           }
                        </div>
                     </div>
                  )
               }
               {
                  (dlPackage.status.isFailed && (
                     <p className='text-center my-3'>
                        Downloading Failed, Reason: {dlPackage.status.failedReason}
                     </p>
                  ))
               }
            </div >
            <Toast ref={toastRef} position='bottom-right' className='w-fit max-w-fit' style={{ width: 'max-content' }} />
         </>
      )
   }

   return (
      <BlockUI containerClassName='p-accordion rounded-lg bg-opacity-90'
         blocked={isBlocked} template={DownloadTemplate}>
         <div className='p-accordion'>
            {/* HEADER */}
            <div className='p-accordion-header cursor-pointer flex flex-row items-center justify-between py-3 z-0'
               onClick={e => e.currentTarget === e.target && toggleCollapse(e)}>
               <div className='flex flex-row m-2 space-x-3'>
                  <Badge severity='info' value={v.version} />
                  <SplitButton loading={false} icon={'pi pi=download'}
                     className={'p-button-text p-button-plain mr-2 mb-2 cursor-default z-10'}
                     label='Download' model={[
                        { icon: 'pi pi-download', label: 'Package Only', command: () => onDownload('PackageOnly') },
                        { icon: 'pi pi-download', label: 'Package & all it dependencies', command: () => onDownload('WithAllDependency') }
                     ]} />
               </div>
               {
                  !isOpen ? <span className='mx-2 p-accordion-toggle-icon'>&#8853;</span> :
                     isOpen && <span className='mx-2 p-accordion-toggle-icon'>&#8854;</span>
               }
            </div>
            {/* More details here */
               isOpen && (
                  <div className='p-accordion-content m-2'>
                     <h2>{v?.name}</h2>
                     <div className='flex flex-row flex-wrap space-y-1 items-center justify-between'>
                        <p>{v?.description}</p>
                        <Badge severity='info' value={v?.version} />
                     </div>
                     <Divider type='dashed' layout='horizontal' />
                     <p>Author <Badge severity='info' value={v?.author?.name ?? 'NAN'} /></p>
                     <p className='space-x-3 flex flex-wrap items-center justify-start'>
                        <span>Node Version: <Badge severity='info' value={v?._nodeVersion} /></span>
                        <span>Npm Version: <Badge severity='info' value={v?._npmVersion} /></span>
                        <span>Node Supported: <Badge severity='info' value={v?._nodeSupported ?? 'NAN'} /></span>
                        <span>Engine Supported: <Badge severity='info' value={v?._engineSupported ?? 'NAN'} /></span>
                     </p>
                     {
                        v?.dependencies && (
                           <>
                              <Divider type='dashed' layout='horizontal' />
                              <h3>Dependency</h3>
                              <span className='flex flex-row flex-wrap items-baseline space-x-2 space-y-2'>
                                 {
                                    Object.entries(v.dependencies).map(d =>
                                       <Badge key={d[0]} severity='success' value={
                                          <span className='space-x-2'>
                                             <span>{d[0]}</span>
                                             <span>|</span>
                                             <span>{d[1]}</span>
                                          </span>
                                       } />
                                    )
                                 }
                              </span>
                           </>
                        )
                     }
                     {
                        v?.devDependencies && (
                           <>
                              <Divider type='dashed' layout='horizontal' />
                              <h3>DevDependency</h3>
                              <span className='flex flex-row flex-wrap items-baseline space-x-2 space-y-2'>
                                 {
                                    Object.entries(v.devDependencies).map(d =>
                                       <Badge key={d[0]} severity='success' value={
                                          <span className='space-x-2'>
                                             <span>{d[0]}</span>
                                             <span>|</span>
                                             <span>{d[1]}</span>
                                          </span>
                                       } />
                                    )
                                 }
                              </span>
                           </>
                        )
                     }
                     {/* DEPRECATED */}
                     {v.deprecated && <>
                        <Divider type='dashed' layout='horizontal' />
                        <Badge severity='danger' value={v.deprecated} />
                     </>
                     }
                  </div>
               )
            }
         </div>
      </BlockUI>
   )
}

