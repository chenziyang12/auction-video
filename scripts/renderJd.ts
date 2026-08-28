import {access,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {AuctionItem} from '../src/data/types';
import {ensureRuntimeDirectories, resolvePublicAssetPath, runtimePaths} from '../src/config/runtimePaths';
import {runRemotion} from '../src/video/remotionCli';
const main=async()=>{await ensureRuntimeDirectories();const dataFile=runtimePaths.jdDataFile;
  try{await access(dataFile);}catch{throw new Error('请先执行 npm run fetch:jd');}
  const parsed: unknown=JSON.parse(await readFile(dataFile,'utf8'));
  if(!Array.isArray(parsed)||!parsed.length) throw new Error('请先执行 npm run fetch:jd');
  const products=parsed as AuctionItem[]; await Promise.all(products.map((item)=>access(resolvePublicAssetPath(item.image))));
  console.log('渲染开始');
  const propsFile=path.join(runtimePaths.tempDir,'jd-props.json');
  await writeFile(propsFile,JSON.stringify({properties:products}));
  await runRemotion(['render','src/remotion/index.ts','AuctionDaily',path.join(runtimePaths.outputDir,'jd-demo.mp4'),'--codec=h264',`--props=${propsFile}`]); console.log('渲染完成');
};
main().catch((error)=>{console.error('失败原因:',error);process.exitCode=1;});
