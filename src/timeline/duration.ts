export const calculateSceneFrames=(audioSeconds:number,fps:number,type:'intro'|'auction-item'|'outro'):number=>{
  const minimum=type==='intro'?2:type==='outro'?2.5:4.5; return Math.ceil(Math.max(audioSeconds+0.65,minimum)*fps);
};
