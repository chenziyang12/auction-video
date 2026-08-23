import type {AuctionItem} from '../data/types';
import {formatDateForSpeech,formatPriceForSpeech} from './speechFormat';

const ordinals=['第一项','第二项','第三项','第四项','第五项'];
export const buildAuctionNarration=(item:AuctionItem,index:number): string=>{
  const parts=[`${ordinals[index]??`第${index+1}项`}，${item.title}。`]; const price=formatPriceForSpeech(item.price); const ending=formatDateForSpeech(item.endTime);
  if(price)parts.push(`目前价格${price}。`); if(ending)parts.push(`拍卖将于${ending}结束。`); return parts.join('');
};
export const buildIntroNarration=(title:string,count:number): string=>{const region=title.match(/^(.+?)今日拍卖$/)?.[1];return `今天来看${count===3?'三个':`${count}个`}${region?`${region}`:''}拍卖标的。`;};
export const OUTRO_NARRATION='以上信息仅供参考，具体信息以拍卖平台公告为准。';
