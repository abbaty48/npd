import { TabView, TabPanel } from 'primereact/tabview';

export default function WindowContent() {

  return (
    <div className={'mt-[4%] mb-[2%] mx-[2%] h-full'}>
      <TabView>
        <TabPanel header={'#'} leftIcon='pi pi-home mr-2'>
          <h1>HOME</h1>
        </TabPanel>
        <TabPanel header={'Downloads'} leftIcon='pi pi-download mr-2'>
          <h1>Download</h1>
        </TabPanel>
        <TabPanel header={'About'}>
          <h1>About</h1>
        </TabPanel>
      </TabView>
    </div>
  );
}
