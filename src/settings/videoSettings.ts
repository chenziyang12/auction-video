import {mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {runtimePaths} from '../config/runtimePaths';
import {resolveVideoConfig} from '../types/video';
import type {ResolvedVideoConfig,VideoConfig} from '../types/video';

const isRecord=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const isFiniteNumber=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);

export const isVideoConfig=(value:unknown):value is VideoConfig=>{
  if(!isRecord(value))return false;
  const subtitle=value.subtitle;
  if(subtitle!==undefined&&(!isRecord(subtitle)
    ||(subtitle.enabled!==undefined&&typeof subtitle.enabled!=='boolean')
    ||(subtitle.text!==undefined&&typeof subtitle.text!=='string')
    ||(subtitle.position!==undefined&&(!isRecord(subtitle.position)||(subtitle.position.x!==undefined&&!isFiniteNumber(subtitle.position.x))||(subtitle.position.y!==undefined&&!isFiniteNumber(subtitle.position.y))))
    ||(subtitle.style!==undefined&&(!isRecord(subtitle.style)||(subtitle.style.fontSize!==undefined&&!isFiniteNumber(subtitle.style.fontSize))||(subtitle.style.fontWeight!==undefined&&!isFiniteNumber(subtitle.style.fontWeight))||(subtitle.style.color!==undefined&&typeof subtitle.style.color!=='string')||(subtitle.style.background!==undefined&&typeof subtitle.style.background!=='string')))))return false;
  if(value.textLayers!==undefined&&(!Array.isArray(value.textLayers)||!value.textLayers.every((layer)=>isRecord(layer)&&typeof layer.id==='string'&&typeof layer.text==='string'&&isRecord(layer.position)&&isFiniteNumber(layer.position.x)&&isFiniteNumber(layer.position.y)&&isRecord(layer.style)&&isFiniteNumber(layer.style.fontSize)&&typeof layer.style.color==='string'&&isFiniteNumber(layer.style.fontWeight))))return false;
  const contact=value.contact;
  if(contact!==undefined&&(!isRecord(contact)||(contact.enabled!==undefined&&typeof contact.enabled!=='boolean')||['name','phone','wechat'].some((key)=>contact[key]!==undefined&&typeof contact[key]!=='string')))return false;
  const logo=value.logo;
  if(logo!==undefined&&(!isRecord(logo)||(logo.enabled!==undefined&&typeof logo.enabled!=='boolean')||(logo.url!==undefined&&typeof logo.url!=='string')||(logo.opacity!==undefined&&!isFiniteNumber(logo.opacity))))return false;
  return true;
};

export const readVideoSettings=async():Promise<ResolvedVideoConfig>=>{
  try{
    const parsed:unknown=JSON.parse(await readFile(runtimePaths.videoSettingsFile,'utf8'));
    return isVideoConfig(parsed)?resolveVideoConfig(parsed):resolveVideoConfig();
  }catch{return resolveVideoConfig();}
};

export const saveVideoSettings=async(config:VideoConfig):Promise<ResolvedVideoConfig>=>{
  const resolved=resolveVideoConfig(config);
  await mkdir(path.dirname(runtimePaths.videoSettingsFile),{recursive:true});
  const temporary=`${runtimePaths.videoSettingsFile}.tmp`;
  await writeFile(temporary,JSON.stringify(resolved,null,2),'utf8');
  await rename(temporary,runtimePaths.videoSettingsFile);
  return resolved;
};
