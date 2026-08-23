import type {SpeechBoundary} from '../tts/types';
import type {SubtitleCue} from './types';

export const buildSubtitleCues=(boundaries:SpeechBoundary[]): SubtitleCue[]=>{
  const cues:SubtitleCue[]=[]; let group:SpeechBoundary[]=[]; let length=0;
  const flush=()=>{if(!group.length)return; cues.push({text:group.map((b)=>b.text).join(''),startMs:group[0].startMs,endMs:group.at(-1)!.startMs+group.at(-1)!.durationMs});group=[];length=0;};
  for(const boundary of boundaries){group.push(boundary);length+=boundary.text.length;if(/[，。；：！？]$/.test(boundary.text)&&length>=8||length>=18)flush();} flush(); return cues;
};
