import {AbsoluteFill, Sequence} from 'remotion';
import type {AuctionItem} from '../../data/types';
import {getRegionTitle} from '../../utils/region';
import {IntroScene} from '../components/IntroScene';
import {OutroScene} from '../components/OutroScene';
import {AuctionItemScene} from '../components/AuctionItemScene';
import type {VideoConfig} from '../../types/video';
import {resolveVideoConfig} from '../../types/video';
import {TextLayer} from '../components/TextLayer';

export const INTRO=45, PROPERTY=120, OUTRO=50;
export const AuctionDaily=({properties,videoConfig}: {properties: AuctionItem[];videoConfig?:VideoConfig}) => {const config=resolveVideoConfig(videoConfig);return <AbsoluteFill style={{background:'#0b0d10'}}><Sequence durationInFrames={INTRO}><IntroScene title={getRegionTitle(properties)} count={properties.length} isDemo={properties.every((item)=>item.source==='DEMO')}/></Sequence>{properties.map((item,index)=><Sequence key={item.id} from={INTRO+index*PROPERTY} durationInFrames={PROPERTY}><AuctionItemScene item={item} index={index}/></Sequence>)}<Sequence from={INTRO+properties.length*PROPERTY} durationInFrames={OUTRO}><OutroScene contact={config.contact}/></Sequence>{config.textLayers.map((layer)=><TextLayer key={layer.id} layer={layer}/>)}</AbsoluteFill>};
