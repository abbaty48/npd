import { useState } from "react";
import { SplitButton } from 'primereact/splitbutton';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export default function WindowToolbar() {

  const _buttonClass =
    `text-gray-500 min-h-[16px] min-w-[16px] max-h-[50px] max-w-[50px] w-12 h-12 
      bg-transparent border-1 p-2 text-center appearance-none hover:animate-fadeOut hover:text-xs`;

  return (
    <header id="app-maintitlebar">
      <div className={"flex justify-between flex-row"}>
        {/* APP TITLE */}
        <div className={"dragable flex-1 text-lg p-2 px-4"}>
          <span>
            {/* <img src={''} /> */}
          </span>
          <span>{'Node Package Downloader (NPD)'}</span>
        </div>
        <div className={'flex flex-row items-center'}>
          {/* THEME SWITCH */}
          <SplitButton label="Theme" icon="pi pi-sun" className="p-button-text mr-2 mb-2 outline-none text-white" model={[
            {
              label: 'System Theme',
              icon: 'pi pi-desktop',
              command: () => Renderer.toggleTheme('system'),
            },
            {
              label: 'Light Theme',
              icon: 'pi pi-sun',
              command: () => Renderer.toggleTheme('light'),
            },
            {
              label: 'Dark Theme',
              icon: 'pi pi-moon',
              command: () => Renderer.toggleTheme('dark'),
            }
          ]} />

          {/* APP CONTROLS */}
          <div className={"flex flex-row justify-around text-xl"}>
            <button
              type="button"
              title="minimize"
              className={_buttonClass}
              onClick={Renderer.minimizeApp}
            >
              <span className={"pi pi-window-minimize"}></span>
            </button>
            <button type="button" title="close" className={_buttonClass} onClick={Renderer.closeApp}>
              <span className={"pi pi-times"}></span>
            </button>
          </div>
        </div>
      </div>
    </header >
  );
}
