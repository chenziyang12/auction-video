import {AbsoluteFill, Sequence} from 'remotion';
import type {AuctionProperty} from '../../data/types';
import {IntroScene} from '../components/IntroScene';
import {OutroScene} from '../components/OutroScene';
import {PropertyScene} from '../components/PropertyScene';

export const INTRO=45, PROPERTY=120, OUTRO=50;
export const AuctionDaily=({properties}: {properties: AuctionProperty[]}) => <AbsoluteFill style={{background:'#0b0d10'}}><Sequence durationInFrames={INTRO}><IntroScene count={properties.length} isDemo={properties.every((item)=>item.source==='DEMO')}/></Sequence>{properties.map((property,index)=><Sequence key={property.id} from={INTRO+index*PROPERTY} durationInFrames={PROPERTY}><PropertyScene property={property} index={index}/></Sequence>)}<Sequence from={INTRO+properties.length*PROPERTY} durationInFrames={OUTRO}><OutroScene/></Sequence></AbsoluteFill>;
