import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import type {AuctionProperty} from '../src/data/types';
const main=async()=>{const dataFile=path.resolve('src','data','jd-demo.json');
  try{await access(dataFile);}catch{throw new Error('请先执行 npm run fetch:jd');}
  const parsed: unknown=JSON.parse(await readFile(dataFile,'utf8'));
  if(!Array.isArray(parsed)||!parsed.length) throw new Error('请先执行 npm run fetch:jd');
  const products=parsed as AuctionProperty[]; await Promise.all(products.map((item)=>access(path.resolve('public',item.image)))); await mkdir('out',{recursive:true});
  console.log('渲染开始');
  const bin=path.resolve('node_modules','.bin',process.platform==='win32'?'remotion.cmd':'remotion');
  const propsFile=path.resolve('out','jd-props.json');
  await writeFile(propsFile,JSON.stringify({properties:products}));
  const child=spawn(bin,['render','src/remotion/index.ts','AuctionDaily','out/jd-demo.mp4','--codec=h264',`--props=${propsFile}`],{stdio:'inherit',shell:process.platform==='win32'});
  const code=await new Promise<number|null>((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);}); if(code!==0) throw new Error(`Remotion render 失败，退出码 ${code}`); console.log('渲染完成');
};
main().catch((error)=>{console.error('失败原因:',error);process.exitCode=1;});
