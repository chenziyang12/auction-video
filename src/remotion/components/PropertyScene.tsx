import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {AuctionProperty} from '../../data/types';
import {formatShanghaiTime} from '../../utils/date';
import {FactRow} from './FactRow';
import {PriceBlock} from './PriceBlock';

export const PropertyScene = ({property,index}: {property: AuctionProperty; index: number}) => {
  const frame=useCurrentFrame(); const fade=interpolate(frame,[0,12],[0,1],{extrapolateRight:'clamp'}); const move=interpolate(frame,[0,18],[24,0],{extrapolateRight:'clamp'}); const scale=interpolate(frame,[0,120],[1,1.055],{extrapolateRight:'clamp'}); const ending=formatShanghaiTime(property.endTime);
  return <AbsoluteFill style={{background:'#0b0d10',color:'#fff',fontFamily:'Microsoft YaHei, Noto Sans CJK SC, PingFang SC, sans-serif'}}>
    <div style={{height:'60%',overflow:'hidden',position:'relative'}}><Img src={staticFile(property.image)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${scale}) translateY(-0.4%)`}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(5,7,9,.05) 55%,#0b0d10 100%)'}}/><div style={{position:'absolute',left:74,top:80,fontSize:28,letterSpacing:4,color:'#e9d39e',opacity:fade}}>AUCTION / {String(index+1).padStart(2,'0')}</div><div style={{position:'absolute',right:68,top:56,fontSize:110,fontWeight:800,color:'rgba(255,255,255,.18)'}}>0{index+1}</div></div>
    <div style={{height:'40%',padding:'4px 72px 54px',boxSizing:'border-box',opacity:fade,transform:`translateY(${move}px)`}}><div style={{fontSize:44,fontWeight:750,lineHeight:1.25,maxHeight:166,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>{property.title}</div><div style={{fontSize:27,color:'#969ba3',marginTop:18,letterSpacing:2}}>{[property.city,property.district].filter(Boolean).join(' · ') || property.province || '位置以公告为准'}</div><PriceBlock price={property.price}/><div style={{display:'flex',flexDirection:'column',gap:20}}>{property.address&&<FactRow label="地址">{property.address}</FactRow>}{ending&&<FactRow label="结束">{ending}</FactRow>}</div></div>
  </AbsoluteFill>;
};

