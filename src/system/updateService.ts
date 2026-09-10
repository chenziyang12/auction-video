import {spawn} from 'node:child_process';
import {closeSync,constants,openSync} from 'node:fs';
import {access,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {runtimePaths} from '../config/runtimePaths';

export type SystemUpdateStatus={running:boolean;log:string;version:string};

const exists=async(file:string):Promise<boolean>=>{try{await access(file,constants.F_OK);return true;}catch{return false;}};
const readVersion=async():Promise<string>=>{try{const value=JSON.parse(await readFile(path.join(runtimePaths.projectRoot,'package.json'),'utf8')) as {version?:unknown};return typeof value.version==='string'?`v${value.version}`:'未知';}catch{return '未知';}};

export const getSystemUpdateStatus=async():Promise<SystemUpdateStatus>=>({
  running:await exists(runtimePaths.updateRunningFile),
  log:await readFile(runtimePaths.updateLogFile,'utf8').catch(()=>''),
  version:await readVersion(),
});

export const startSystemUpdate=async():Promise<void>=>{
  if(await exists(runtimePaths.updateRunningFile))throw new Error('系统更新正在运行。');
  const script=path.join(runtimePaths.projectRoot,'update.sh');
  if(!await exists(script))throw new Error('未找到 update.sh。');
  await writeFile(runtimePaths.updateLogFile,'开始更新...\n','utf8');
  await writeFile(runtimePaths.updateRunningFile,String(process.pid),'utf8');
  const output=openSync(runtimePaths.updateLogFile,'a');
  try{
    const child=spawn('bash',[script],{cwd:runtimePaths.projectRoot,detached:true,stdio:['ignore',output,output]});
    child.once('error',()=>{void rm(runtimePaths.updateRunningFile,{force:true});});
    child.unref();
  }catch(error){await rm(runtimePaths.updateRunningFile,{force:true});throw error;}
  finally{closeSync(output);}
};
