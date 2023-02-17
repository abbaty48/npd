import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Accordion, AccordionTab } from 'primereact/accordion'

const About = () => {
   return (
      <div className='flex flex-col justify-between items-center overflow-y-auto max-h-[490px]'>
         <Card header={<h1>About NPD v1.0</h1>} className='text-center w-8/12'>
            <h2>NPD (Node Package Downloader) v1.0</h2>
            <p>With NPD you can download any public node package either the package alone <Tag severity='info'>(PackageOnly)</Tag>
               or with all it dependencies <Tag severity='info'>(WithAllDepedency)</Tag> in tar, tgz, tar.gz format.
               <br />
               <Tag severity='warning'>Note: </Tag>This is an open-source project, you can <Tag severity='info'>fork</Tag> or <Tag severity='info'>clone</Tag> it for free.<br />
               <Tag severity='warning'>Note: </Tag>This project might be updated or not.
            </p>
         </Card>
         <div className='my-4 w-2/3'>
            <h2 className='text-center font-bold my-5'>#Faq</h2>
            <Accordion>
               <AccordionTab header={<h3>Cannot open [downloadedfile].extension after download.</h3>}>
                  You might encounter an error 'Cannot open [filePath].(tar|.tgz|.tar.gz)' e.g (Cannot open C:\Users\[user]\Documents\express.tgz) after you've downloaded a
                  package using the 'WithAllDepedency' option. you need to close the application and try open the file again.
               </AccordionTab>
               <AccordionTab header={<h3>What does "PackageOnly" means?</h3>}>
                  <p>When you're about to download a package, you'll probably see/chooce the 'PackageOnly' option,
                     'PackageOnly' mean, it is the package only without it dependencies. for example, if you download `express` package
                     it will not include the dependencies/devDependencies packages listed in the package.json only the (History.md, index.js, LICENSE, package.json, Readme.md).
                  </p>
               </AccordionTab>
               <AccordionTab header={<h3>What does "WithAllDepedency" means?</h3>}>
                  <p>Unlike the "PackageOnly" option, the "WithAllDepedency" option will download/include all dependencies and devDependencies of a package.
                     a package will have the "node_module" folder.
                  </p>
               </AccordionTab>
               <AccordionTab header={<h3>Network Error</h3>}>
                  <p>'Network Error' mean your pc is either offline or any network error occured,
                     check your internet connection and try search for a package.</p>
               </AccordionTab>
            </Accordion>
         </div>
         <Card className='my-8 text-center'>
            <p>Develop by Abbaty Abdul</p>
            <dd className='my-1'>
               <dl><strong className=''>Github:</strong>http://github.com@abbaty48</dl>
               <dl><strong className='text-[#0A66C2]'>LinkedIn: </strong>https://www.linkedin.com/in/abbaty-abdul-93869bab</dl>
               <dl><strong className='text-[#6FDA44]'>Upwork: </strong>https://www.upwork.com/o/profiles/users/~01484d90f85bd4131a</dl>
            </dd>
         </Card>
      </div>
   )
}

export default About