import {Composition} from 'remotion';
import {demoProperties} from '../data/demo';
import type {AuctionItem} from '../data/types';
import {AuctionDaily, INTRO, OUTRO, PROPERTY} from './compositions/AuctionDaily';
import {AuctionDailyVoice} from './compositions/AuctionDailyVoice';
import type {VideoTimeline} from '../timeline/types';

type InputProps={properties?: AuctionItem[]};
const placeholder:VideoTimeline={fps:30,totalFrames:60,segments:[]};
export const RemotionRoot=()=> <><Composition id="AuctionDaily" component={AuctionDaily} width={1080} height={1920} fps={30} durationInFrames={INTRO+3*PROPERTY+OUTRO} defaultProps={{properties:demoProperties}} calculateMetadata={({props})=>{const p=props as InputProps; const properties=p.properties?.length?p.properties:demoProperties; return {durationInFrames:INTRO+properties.length*PROPERTY+OUTRO,props:{properties}};}}/><Composition id="AuctionDailyVoice" component={AuctionDailyVoice} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={{timeline:placeholder}} calculateMetadata={({props})=>{const timeline=(props as {timeline:VideoTimeline}).timeline;return {durationInFrames:timeline.totalFrames,props:{timeline}};}}/></>;
