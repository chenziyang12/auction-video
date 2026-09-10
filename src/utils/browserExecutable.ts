import {access} from 'node:fs/promises';
import path from 'node:path';

export const findBrowserExecutable=async():Promise<string|undefined>=>{
  const programDirs=[process.env.PROGRAMFILES,process.env['PROGRAMFILES(X86)']];
  const candidates=[
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    process.env.REMOTION_BROWSER_EXECUTABLE,
    process.env.BROWSER_EXECUTABLE,
    ...programDirs.flatMap((directory)=>directory?[
      path.join(directory,'Google','Chrome','Application','chrome.exe'),
      path.join(directory,'Microsoft','Edge','Application','msedge.exe'),
    ]:[]),
    process.platform==='win32'&&process.env.LOCALAPPDATA
      ?path.join(process.env.LOCALAPPDATA,'Google','Chrome','Application','chrome.exe')
      :undefined,
    process.platform==='linux'?'/usr/bin/chromium':undefined,
    process.platform==='linux'?'/usr/bin/chromium-browser':undefined,
    process.platform==='linux'?'/usr/bin/google-chrome':undefined,
  ].filter((candidate):candidate is string=>Boolean(candidate));

  for(const candidate of candidates){
    try{await access(candidate);return candidate;}catch{/* 继续检查候选浏览器 */}
  }
  return undefined;
};
