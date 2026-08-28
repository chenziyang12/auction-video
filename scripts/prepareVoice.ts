import {createHash} from 'node:crypto';
import {access,mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {demoProperties} from '../src/data/demo';
import type {AuctionItem} from '../src/data/types';
import {buildAuctionNarration,buildIntroNarration,OUTRO_NARRATION} from '../src/narration/buildNarration';
import {buildSubtitleCues} from '../src/subtitles/buildSubtitleCues';
import {EdgeTtsProvider} from '../src/tts';
import {ttsConfig} from '../src/tts/config';
import type {TtsResult} from '../src/tts/types';
import {calculateSceneFrames} from '../src/timeline/duration';
import type {VideoSegment,VideoTimeline} from '../src/timeline/types';
import {getRegionTitle} from '../src/utils/region';
import {ensureRuntimeDirectories,runtimePaths} from '../src/config/runtimePaths';

const mode=process.argv[2]; if(mode!=='demo'&&mode!=='jd')throw new Error('Usage: prepareVoice.ts demo|jd');
const loadItems=async():Promise<AuctionItem[]>=>{if(mode==='demo')return demoProperties;const file=runtimePaths.jdDataFile;try{await access(file);}catch{throw new Error('请先执行 npm run fetch:jd');}const value:unknown=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(value)||!value.length)throw new Error('请先执行 npm run fetch:jd');return value as AuctionItem[];};
const provider=new EdgeTtsProvider(); const cacheDir=path.join(runtimePaths.generatedDir,'tts');
const synthesizeCached=async(text:string):Promise<TtsResult>=>{const hash=createHash('sha256').update(JSON.stringify({cacheVersion:2,...ttsConfig,text})).digest('hex').slice(0,20);const audio=path.join(cacheDir,`${hash}.mp3`);const metadata=path.join(cacheDir,`${hash}.json`);
  try{const cached=JSON.parse(await readFile(metadata,'utf8')) as TtsResult; if((await stat(audio)).size>0&&cached.durationSeconds>0&&cached.boundaries.length>0)return {...cached,audioPath:audio};}catch{/* 缓存不完整时重新生成 */}
  const result=await provider.synthesize({text,outputPath:audio});await writeFile(metadata,JSON.stringify({...result,audioPath:audio},null,2));return result;};
const main=async()=>{await ensureRuntimeDirectories();const items=await loadItems();await mkdir(cacheDir,{recursive:true});const title=getRegionTitle(items);const definitions=[{id:'intro',type:'intro' as const,text:buildIntroNarration(title,items.length) },...items.map((item,index)=>({id:`item-${String(index+1).padStart(3,'0')}`,type:'auction-item' as const,text:buildAuctionNarration(item,index),item})),{id:'outro',type:'outro' as const,text:OUTRO_NARRATION}];
  const segments:VideoSegment[]=[];for(const definition of definitions){try{const result=await synthesizeCached(definition.text);const relative=path.posix.join('generated','tts',path.basename(result.audioPath));segments.push({id:definition.id,type:definition.type,narration:definition.text,audioSrc:relative,audioDurationSeconds:result.durationSeconds,durationInFrames:calculateSceneFrames(result.durationSeconds,30,definition.type),subtitles:buildSubtitleCues(result.boundaries),boundaryCount:result.boundaries.length,item:'item' in definition?definition.item:undefined});}catch(error){throw new Error(`TTS generation failed for ${definition.id}: ${error instanceof Error?error.message:String(error)}`,{cause:error});}}
  const timeline:VideoTimeline={fps:30,segments,totalFrames:segments.reduce((sum,s)=>sum+s.durationInFrames,0)};const output=path.join(runtimePaths.tempDir,'narration',`${mode}.json`);await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify({timeline},null,2));console.log(`TTS voice: ${ttsConfig.voice}\n`);for(const [index,s] of segments.entries()){console.log(`${s.type==='auction-item'?`Item ${index}`:s.type==='intro'?'Intro':'Outro'}\ntext: ${s.narration}\nduration: ${s.audioDurationSeconds.toFixed(2)}s\nscene: ${(s.durationInFrames/30).toFixed(2)}s\nboundaries: ${s.boundaryCount}\nsubtitles: ${s.subtitles.length} cues\n`);}console.log(`Total video duration: ${(timeline.totalFrames/30).toFixed(2)}s`);};
main().catch((error)=>{console.error('失败阶段: voice preparation');console.error(error);process.exitCode=1;});
