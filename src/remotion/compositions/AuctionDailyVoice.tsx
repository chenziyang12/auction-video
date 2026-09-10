import {Audio} from '@remotion/media';
import {AbsoluteFill,Sequence,staticFile} from 'remotion';
import type {VideoTimeline,VideoSegment} from '../../timeline/types';
import type {ResolvedVideoConfig,VideoConfig} from '../../types/video';
import {resolveVideoConfig} from '../../types/video';
import {getRegionTitle} from '../../utils/region';
import {AuctionItemScene} from '../components/AuctionItemScene';
import {IntroScene} from '../components/IntroScene';
import {OutroScene} from '../components/OutroScene';
import {SubtitleOverlay} from '../components/SubtitleOverlay';
import {TextLayer} from '../components/TextLayer';

const AUDIO_DELAY_FRAMES=8;

const Segment=({segment,timeline,config}: {segment:VideoSegment;timeline:VideoTimeline;config:ResolvedVideoConfig})=>{const items=timeline.segments.flatMap((s)=>s.item?[s.item]:[]);return <AbsoluteFill>{segment.type==='intro'?<IntroScene title={getRegionTitle(items)} count={items.length} isDemo={items.every((i)=>i.source==='DEMO')}/>:segment.type==='outro'?<OutroScene contact={config.contact}/>:<AuctionItemScene item={segment.item!} index={items.findIndex((i)=>i.id===segment.item!.id)}/>}<Sequence from={AUDIO_DELAY_FRAMES}><Audio src={staticFile(segment.audioSrc)}/></Sequence>{config.textLayers.map((layer)=><TextLayer key={layer.id} layer={layer}/>)}{config.logo.enabled&&config.logo.url&&<img src={staticFile(config.logo.url)} style={{position:'absolute',right:54,top:54,maxWidth:180,maxHeight:120,objectFit:'contain',opacity:config.logo.opacity,zIndex:18}}/>}<SubtitleOverlay cues={segment.subtitles} audioDelayFrames={AUDIO_DELAY_FRAMES} fps={timeline.fps} config={config.subtitle}/></AbsoluteFill>};

export const AuctionDailyVoice=({timeline,videoConfig}: {timeline:VideoTimeline;videoConfig?:VideoConfig})=>{let from=0;const config=resolveVideoConfig(videoConfig);return <AbsoluteFill style={{background:'#0b0d10'}}>{timeline.segments.map((segment)=>{const start=from;from+=segment.durationInFrames;return <Sequence key={segment.id} from={start} durationInFrames={segment.durationInFrames}><Segment segment={segment} timeline={timeline} config={config}/></Sequence>})}</AbsoluteFill>};
