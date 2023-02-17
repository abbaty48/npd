import Main from '@pages/main';
import About from '@pages/about';
import DownloadsHistory from '@pages/downloadsHistory';
import { TabView, TabPanel } from 'primereact/tabview';

export default function WindowContent() {

  return (
    <div className={'mt-[4%] mb-[2%] mx-[2%] h-full'}>
      <TabView className='h-[inherit] flex flex-col justify-between' panelContainerClassName='flex-1'>
        <TabPanel header={'#'} leftIcon='pi pi-home mr-2'>
          <Main />
        </TabPanel>
        <TabPanel header={'Downloads'} leftIcon='pi pi-download mr-2'>
          <DownloadsHistory />
        </TabPanel>
        <TabPanel header={'About'}>
          <About />
        </TabPanel>
      </TabView>
    </div>
  );
}
