import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const OutroScene = () => {const frame = useCurrentFrame(); const opacity = interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'}); return <AbsoluteFill style={{background:'#0b0d10', color:'#f2eee5', justifyContent:'center', alignItems:'center', textAlign:'center', padding:100, opacity}}><div style={{fontSize:54, fontWeight:700, marginBottom:30}}>以上信息仅供参考</div><div style={{width:60,height:4,background:'#d6ad61',marginBottom:34}}/><div style={{fontSize:30,color:'#8f949c'}}>具体信息以拍卖平台公告为准</div></AbsoluteFill>};

