import {formatShanghaiTime} from '../utils/date';

const digits='零一二三四五六七八九';
const digit=(n:number)=>digits[n] ?? '';
const integerCn=(value:number): string=>{
  if(value<10)return digit(value); if(value<20)return `十${value%10?digit(value%10):''}`;
  if(value<100)return `${digit(Math.floor(value/10))}十${value%10?digit(value%10):''}`;
  if(value<1000)return `${digit(Math.floor(value/100))}百${value%100?(value%100<10?'零':'')+integerCn(value%100):''}`;
  return String(value).split('').map((v)=>digit(Number(v))).join('');
};
const numberCn=(value:string)=>{const [whole,decimal]=value.split('.');return `${integerCn(Number(whole))}${decimal?`点${decimal.split('').map((v)=>digit(Number(v))).join('')}`:''}`;};

export const formatPriceForSpeech=(price:string|null): string|null=>{
  if(!price)return null; const normalized=price.replace(/[¥￥,\s]/g,''); const match=normalized.match(/^([0-9]+(?:\.[0-9]+)?)(万|亿)?元?$/);
  if(!match)return null; return `${numberCn(match[1])}${match[2]??''}元`;
};
export const formatDateForSpeech=(value?:number|string): string|null=>{
  const ui=formatShanghaiTime(value); if(!ui)return null; const match=ui.match(/(\d+)月(\d+)日\s*(\d+):(\d+)/); if(!match)return null;
  const month=Number(match[1]),day=Number(match[2]),hour=Number(match[3]),minute=Number(match[4]); const period=hour<12?'上午':'下午'; const h=hour===0?12:hour>12?hour-12:hour;
  return `${integerCn(month)}月${integerCn(day)}日${period}${integerCn(h)}点${minute?`${integerCn(minute)}分`:''}`;
};
