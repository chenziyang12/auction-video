import {AbsoluteFill, Sequence} from 'remotion';
import type {AuctionItem} from '../../data/types';
import {getRegionTitle} from '../../utils/region';
import {IntroScene} from '../components/IntroScene';
import {OutroScene} from '../components/OutroScene';
import {AuctionItemScene} from '../components/AuctionItemScene';

export const INTRO=45, PROPERTY=120, OUTRO=50;
export const AuctionDaily=({properties}: {properties: AuctionItem[]}) => <AbsoluteFill style={{background:'#0b0d10'}}><Sequence durationInFrames={INTRO}><IntroScene title={getRegionTitle(properties)} count={properties.length} isDemo={properties.every((item)=>item.source==='DEMO')}/></Sequence>{properties.map((item,index)=><Sequence key={item.id} from={INTRO+index*PROPERTY} durationInFrames={PROPERTY}><AuctionItemScene item={item} index={index}/></Sequence>)}<Sequence from={INTRO+properties.length*PROPERTY} durationInFrames={OUTRO}><OutroScene/></Sequence></AbsoluteFill>;
