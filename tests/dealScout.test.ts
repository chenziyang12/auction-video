import assert from 'node:assert/strict';
import test from 'node:test';
import {DEFAULT_SCOUT_RULES, parsePriceYuan, parseScoutRules, screenAuctionItems} from '../src/scout/dealScout';
import type {AuctionItem} from '../src/data/types';

const item: AuctionItem = {id:'a',title:'武汉住宅',image:'jd/a/cover.jpg',price:'73.4万',city:'武汉',source:'JD'};
test('金额单位必须明确，拒绝含糊或非数值价格',()=>{
  assert.equal(parsePriceYuan('73.4万'),734000);
  assert.equal(parsePriceYuan('1.25亿元'),125000000);
  assert.equal(parsePriceYuan('￥2,000元'),2000);
  assert.equal(parsePriceYuan('低至50万'),null);
  assert.equal(parsePriceYuan('73.4'),null);
});
test('设置校验拒绝无效价格、过长列表和非法结构',()=>{
  assert.equal(parseScoutRules({...DEFAULT_SCOUT_RULES,maxPriceYuan:-1}),null);
  assert.equal(parseScoutRules({...DEFAULT_SCOUT_RULES,cities:Array(31).fill('武汉')}),null);
  assert.deepEqual(parseScoutRules({...DEFAULT_SCOUT_RULES,cities:['武汉','武汉']}),{...DEFAULT_SCOUT_RULES,cities:['武汉']});
});
test('筛选不会把演示数据或无价格标的当成便宜货',()=>{
  const rules={...DEFAULT_SCOUT_RULES,cities:['武汉'],keywords:['住宅'],maxPriceYuan:800000};
  const results=screenAuctionItems([item,{...item,id:'b',price:null},{...item,id:'c',source:'DEMO'}],rules);
  assert.equal(results.length,2);
  assert.equal(results[0].eligible,true);
  assert.equal(results[1].eligible,false);
  assert.match(results[0].warnings.join(' '),/产权/);
});
test('排除关键词优先级高于命中关键词',()=>{
  const result=screenAuctionItems([{...item,title:'武汉住宅 有租约'}],{...DEFAULT_SCOUT_RULES,keywords:['住宅'],excludeKeywords:['租约']});
  assert.equal(result[0].eligible,false);
});
