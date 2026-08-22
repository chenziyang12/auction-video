import {Composition} from 'remotion';
import {demoProperties} from '../data/demo';
import type {AuctionProperty} from '../data/types';
import {AuctionDaily, INTRO, OUTRO, PROPERTY} from './compositions/AuctionDaily';

type InputProps={properties?: AuctionProperty[]};
export const RemotionRoot=()=> <Composition id="AuctionDaily" component={AuctionDaily} width={1080} height={1920} fps={30} durationInFrames={INTRO+3*PROPERTY+OUTRO} defaultProps={{properties:demoProperties}} calculateMetadata={({props})=>{const p=props as InputProps; const properties=p.properties?.length?p.properties:demoProperties; return {durationInFrames:INTRO+properties.length*PROPERTY+OUTRO,props:{properties}};}}/>;

