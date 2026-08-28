import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {downloadJdImage} from '../src/jd/downloadAssets';
import {fetchAuctionList} from '../src/jd/fetchAuctionList';
import {ensureRuntimeDirectories, runtimePaths} from '../src/config/runtimePaths';

const main=async()=>{console.log('开始获取京东拍卖列表');
  await ensureRuntimeDirectories();
  const products=await fetchAuctionList(3); const downloaded=[];
  for(const product of products){try{await downloadJdImage(product.remoteImage,product.id); const {remoteImage: _remoteImage,rawPriceFields: _rawPriceFields,...local}=product; downloaded.push(local);}catch(error){console.warn(`图片下载失败 ${product.id}:`,error instanceof Error?error.message:error);}}
  if(!downloaded.length) throw new Error('全部图片下载失败，无法生成真实素材视频。');
  await mkdir(path.dirname(runtimePaths.jdDataFile),{recursive:true}); await writeFile(runtimePaths.jdDataFile,JSON.stringify(downloaded,null,2));
  console.log(`获取到 ${products.length} 条商品，下载 ${downloaded.length} 张图片`);
  products.forEach((item,index)=>console.log(`\n[${index+1}]\nid: ${item.id}\ntitle: ${item.title}\nprovince: ${item.province??''}\ncity: ${item.city??''}\nprice fields: ${JSON.stringify(item.rawPriceFields)}\nprice: ${item.price??''}\nstartTime: ${item.startTime??''}\nendTime: ${item.endTime??''}`));
};
main().catch((error)=>{console.error('失败原因:',error);process.exitCode=1;});
