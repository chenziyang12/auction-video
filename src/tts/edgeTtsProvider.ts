import {EdgeTTS} from '@andresaya/edge-tts';
import {mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {ttsConfig} from './config';
import type {TtsProvider,TtsResult} from './types';
import {ALL_FORMATS,FilePathSource,Input} from 'mediabunny';

const withTimeout=<T>(promise: Promise<T>,ms: number): Promise<T>=>new Promise<T>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`TTS timeout after ${ms}ms`)),ms);promise.then((value)=>{clearTimeout(timer);resolve(value);},(error)=>{clearTimeout(timer);reject(error);});});
export class EdgeTtsProvider implements TtsProvider {
  async synthesize({text,outputPath}: {text:string;outputPath:string}): Promise<TtsResult> {
    let lastError: unknown;
    for(let attempt=1;attempt<=3;attempt++) try {
      const tts=new EdgeTTS();
      await withTimeout(tts.synthesize(text,ttsConfig.voice,{rate:ttsConfig.rate,volume:ttsConfig.volume,pitch:ttsConfig.pitch}),45_000);
      await mkdir(path.dirname(outputPath),{recursive:true});
      const written=await tts.toFile(outputPath.replace(/\.mp3$/i,''));
      const boundaries=tts.getWordBoundaries().map((b)=>({text:b.text,startMs:b.offset/10_000,durationMs:b.duration/10_000}));
      const endMs=Math.max(0,...boundaries.map((b)=>b.startMs+b.durationMs));
      if(!boundaries.length||endMs<=0||(await stat(written)).size===0) throw new Error('Edge TTS returned empty audio or WordBoundary data');
      const input=new Input({source:new FilePathSource(written),formats:ALL_FORMATS});
      const durationSeconds=await input.computeDuration(); input.dispose();
      if(!Number.isFinite(durationSeconds)||durationSeconds<=0)throw new Error('Cannot determine generated audio duration');
      return {audioPath:written,durationSeconds,boundaries};
    } catch(error) {lastError=error;if(attempt<3) console.warn(`TTS attempt ${attempt} failed, retrying: ${error instanceof Error?error.message:String(error)}`);}
    throw new Error(`Edge TTS generation failed: ${lastError instanceof Error?lastError.message:String(lastError)}`,{cause:lastError});
  }
}
