import axios from 'axios';
import { Panel } from 'primereact/panel'
import { Slider } from 'primereact/slider'
import { Badge } from 'primereact/badge'
import { InputText } from 'primereact/inputtext'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { SplitButton } from 'primereact/splitbutton'
import { DataScroller } from 'primereact/datascroller'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputNumber } from 'primereact/inputnumber'
import { ProgressSpinner } from 'primereact/progressspinner'
import { ModuleVersion } from '@components/moduleVersion'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { IModule, IModuleVersion } from '@commons/models/interfaces/iModule'
import { IPackage, ISearchResult } from '@/src/ui/commons/models/interfaces/iPackage'
import { Toast } from 'primereact/toast';

interface IStates {
   module: IModule,
   isSearch: boolean,
   error: string | null,
   searchTerm: string | null,
   item: IPackage | undefined,
   searchResults: IPackage[]
   findVersion: IModuleVersion
}

const Main = () => {
   // INITIALSTATES VALUE
   const initStates: IStates = {
      error: null,
      searchTerm: null,
      isSearch: false,
      item: undefined,
      searchResults: [],
      module: undefined,
      findVersion: undefined,
   }
   // 
   const initFilters = {
      useStrict: false,
      searchScore: 100000,
      size: 10
   }
   const resultOverLay = useRef<OverlayPanel>()
   const searchInputRef = useRef<HTMLInputElement>()
   const [states, setStates] = useState(initStates)
   const [filters, setFilters] = useState(initFilters)

   useEffect(() => {
      onSearch(states.searchTerm)
   }, [filters, module])


   const changeState = (key: string, value: any) => {
      setStates(prevStates => ({
         ...prevStates,
         [key]: value
      }))
   }

   const changeFilter = (key: string, value: any) => {
      setFilters(filters => ({
         ...filters,
         [key]: value
      }))
      onSearch(states.searchTerm)
   }

   const toggleOverlay = (event: SyntheticEvent<Element, Event>, target?: HTMLElement | EventTarget) => {
      resultOverLay?.current.show(event, target)
   }

   const itemTemplate = (item: IPackage) => {
      // console.log('ITEM: ', item);
      return (
         <div key={item.package?.name} className='border-b py-2 px-1 cursor-pointer hover:bg-gray-100'
            onClick={() => onItemClick(item)}>
            <div className='flex flex-row justify-between items-center m-1'>
               <strong className='font-bold'>{item.package?.name}</strong>
               <Badge value={item.package?.version} severity='success' />
            </div>
            <div className='flex flex-row justify-start items-center space-x-2'>
               <Badge value={item.package?.author?.name} severity='info' />
               <Badge value={item.package.scope} severity='warning' />
            </div>
         </div>
      )
   }

   const onItemClick = async (selectedItem: IPackage) => {
      // hide the overlayPanel
      resultOverLay?.current.hide()
      // set the item and loading indication
      setStates(prevStates => ({
         ...prevStates,
         isSearch: true,
         item: selectedItem
      }))
      // query all versions of that packages
      try {
         const result = await axios.get<IModule>(`https://registry.npmjs.com/${selectedItem.package.name}`)
         // console.log('MODULE: ', result.data);
         setStates(prevStates => ({
            ...prevStates,
            isSearch: false,
            module: result.data,
         }))
      } catch (error) {
         setStates(prevStates => ({
            ...prevStates,
            isSearch: false,
            error,
         }))
      }
   }

   const onSearch = async (searchTerm: string) => {
      // reset loading and error
      setStates(prevStates => ({
         ...prevStates,
         isSearch: true,
         searchTerm,
         error: null
      }))
      setTimeout(async () => {
         try {
            const url = `https://registry.npmjs.com/-/v1/search?text=${searchTerm}&size=${filters.size}`
            const results = await axios.get<ISearchResult>(url)
            let packages = results.data.objects
            // console.log('RESULT1: ', results)
            if (packages.length) {
               // strict search
               if (filters.useStrict) {
                  packages = packages.filter((p) => p.package?.name === searchTerm)
               }
               // packages = packages.filter((p) => Math.floor(p.searchScore) == filters.searchScore)
            }
            // console.log('RESULT2: ', packages)
            setStates(prevStates => ({
               ...prevStates,
               isSearch: false,
               searchResults: packages
            }))
         } catch (error) {
            setStates(prevStates => ({
               ...prevStates,
               isSearch: false,
               error: error.message
            }))
            // console.log('SEARCH ERROR: ', error);
         }
      }, 250);
   }

   const onSearchVersion = async (version: string) => {
      if (states.module?.versions) {
         changeState('findVersion', Object.values(states.module.versions).find(v => v.version.includes(version)))
      }
   }

   return (
      <div className='h-full w-full'>
         {/* SEARCH  */}
         <div className='self-end place-self-end my-1 mx-1'>
            <div className='relative'>
               <div className='flex flex-row items-center justify-start space-x-5 space-y-1'>
                  <InputText ref={searchInputRef} type="search" autoFocus={true}
                     inputMode='search' placeholder='Search for a node package (https://npmjs.com)'
                     name="pSearch" id="pSearch" className={'py-2 px-1 flex-1'}
                     onChange={e => { onSearch(e.target.value); toggleOverlay(e) }} />
                  {
                     /* Search Result Total */
                     states.searchResults.length > 0 && <Badge size='normal' value={states.searchResults.length} severity='success' />
                  }
                  <SplitButton label='Filters' icon={'pi pi-filter'} className='p-button-outlined p-button-secondary mr-2 mb-2' model={[
                     /* Use Strict Search */
                     {
                        template(item, options) {
                           return (
                              <div className='space-x-2 border-b py-1'>
                                 <span>Strict Search:</span>
                                 <Checkbox checked={filters.useStrict}
                                    onChange={e => {
                                       changeFilter('useStrict', e.checked)
                                       // show the overlayPanel
                                       toggleOverlay(e.originalEvent, searchInputRef?.current)
                                    }} />
                              </div>
                           )
                        },
                     },
                     /* Score Range 
                     {
                        template(item, options) {
                           return <div className='space-y-1 border-b py-4 my-2'>Search Score: (<span>{filters.searchScore})</span>
                           <Slider defaultValue={100000} min={0} max={100000} value={filters.searchScore}
                           onChange={e => changeFilter('searchScore', e.value)} />
                           </div>
                           
                        },
                     },
                     */
                     /* Size of query */
                     {
                        template(item, options) {
                           return (
                              <div className='space-y-1 py-1 my-1'> Result Size:
                                 <InputNumber value={filters.size}
                                    onChange={(e) => { changeFilter('size', e.value); toggleOverlay(e.originalEvent, searchInputRef?.current) }} inputClassName='w-full' />
                                 <Slider min={1} max={20} value={filters.size}
                                    onChange={(e) => { changeFilter('size', e.value); toggleOverlay(e.originalEvent, searchInputRef?.current) }} className='w-full' />
                              </div>

                           )
                        },
                     }
                  ]} />
               </div>
               {
                  <OverlayPanel ref={resultOverLay} showCloseIcon={true} className='border w-9/12 shadow-md'>
                     <DataScroller emptyMessage={`'${states.searchTerm}' Not Found at npmjs.com`}
                        loader={states.isSearch} rows={filters.size} buffer={0.3} inline
                        unselectable='on' itemTemplate={itemTemplate} scrollHeight='220px'
                        value={states.searchResults} className='my-1' />
                  </OverlayPanel>
               }
            </div>
         </div>
         {
            states.isSearch ? <div className='w-full h-full flex items-center justify-center my-[2%]'>
               <ProgressSpinner strokeWidth='1' />
            </div> :
               (states.searchResults.length > 0 && states.item) && (
                  <Panel className='my-4' headerTemplate={
                     <div className='flex flex-row justify-between items-center space-x-2 m-3'>
                        <div className='flex flex-col'>
                           <h1 className='text-2xl'>{states.module?.name}</h1>
                           <p>{states.module?.description}</p>
                        </div>
                        {
                           states.module?.versions && (
                              <Dropdown optionLabel='Search Version'
                                 options={Object.values(states.module?.versions).map(v => v)}
                                 itemTemplate={(v) => <p className='py-2 border-b border-b-[#343a42] w-full'>{v.version}</p>}
                                 placeholder='Search Version' value={states.findVersion?.version} filter filterBy={'version'} showFilterClear
                                 onChange={e => onSearchVersion(e.value)} onFilter={e => onSearchVersion(e.filter)} />
                           )
                        }
                     </div>
                  }>
                     <div className='h-80 overflow-hidden overflow-y-auto'>
                        {
                           states.findVersion ? (
                              <ModuleVersion isOpen={true} moduleVersion={states.findVersion} />
                           ) :
                              states.module?.versions &&
                              Object.values(states.module?.versions)
                                 .sort((a, b) => (a.version > b.version) ? -1 : -1)
                                 .map((v, i) => <ModuleVersion key={v.version} moduleVersion={v} isOpen={i === 0} />)
                        }
                     </div>
                  </Panel>
               )
         }
         {
            states.error && <div className='flex flex-col items-center space-y-3'>
               <p className='text-lg text-center my-[2%]'>{states.error}</p>
               {/* <Button type='button' className='my-2 p-button-rounded p-button-secondary' icon={'pi p-refresh'} loading={states.isSearch} onClick={() => onSearch(states.searchTerm)} /> */}
            </div>
         }
      </div >
   )
}

export default Main