import { describe, expect, it } from 'vitest';
import { act, parseSave } from '../src/game/engine';
import { blocks, canSlide, channels, freePontoon, newGame, raised, type Action, type Game } from '../src/game/model';

function run(g: Game, ...actions: Action[]) { return actions.reduce((state,a) => act(state,a).game,g); }
describe('物理状態と情報を分離する', () => {
  it('情報を一切読まなくても復旧済みの浮体は上がり、未復旧なら上がらない', () => {
    const g = newGame(); g.room='pump'; g.shutterOpen=true; g.valves=[false,true,false]; g.target=2;
    g.patchMounted=true; g.patchBolts=[true,true,true,true]; g.tankDry=true; g.pins=[false,false];
    const high=act(g,{type:'pump'}); expect(high.transition).toBe('rise'); expect(raised(high.game)).toBe(true); expect(high.game.seen).toEqual([]);
    g.pins[0]=true; expect(raised(act(g,{type:'pump'}).game)).toBe(false);
    g.pins[0]=false; g.patchBolts[2]=false; expect(raised(act(g,{type:'pump'}).game)).toBe(false);
  });
  it('注水と排水を逆に使えず、水門を開いたまま排水できない', () => {
    const g=newGame(); g.room='pump'; g.beltTested=true; g.strainerClear=true; g.valves=[true,false,true]; g.target=2;
    expect(act(g,{type:'pump'}).game.water).toBe(1);
    g.water=2; g.target=0; g.gateOpen=true; expect(act(g,{type:'pump'}).game.water).toBe(2);
    const closed=run(g,{type:'gate'},{type:'pump'}); expect(closed.water).toBe(0);
  });
  it('固定具の荷重を受け、ピンを抜き、支持脚を戻して初めて自由になる', () => {
    const g=newGame(); g.water=0; g.items.crank='inventory';
    expect(act(g,{type:'pin',index:0}).game.pins).toEqual([true,true]);
    const released=run(g, ...[0,1].flatMap(index => [
      {type:'support',index,direction:1,tool:'crank'}, {type:'support',index,direction:1,tool:'crank'}, {type:'pin',index},
      {type:'support',index,direction:-1,tool:'crank'}, {type:'support',index,direction:-1,tool:'crank'},
    ] as Action[]));
    expect(freePontoon(released)).toBe(true);
  });
  it('取り忘れた物はその場に残り、取得と開錠を混同しない', () => {
    const g=newGame(); g.room='office'; g.keyTurn=1;
    const opened=run(g,{type:'inspect',detail:'drawer'},{type:'openDrawer'},{type:'back'});
    expect(opened.items.crank).toBe('drawer');
    const taken=run(opened,{type:'inspect',detail:'drawer'},{type:'take',item:'crank'},{type:'take',item:'crank'});
    expect(taken.items.crank).toBe('inventory');
  });
  it('鉤を分解して棒を計測に再利用でき、道具が複製されない', () => {
    const g=newGame(); g.items.rod='inventory'; g.items.hookTip='inventory';
    const hooked=run(g,{type:'combine',a:'rod',b:'hookTip'}); expect(hooked.items.rod).toBe('installed');
    const separated=run(hooked,{type:'separate',item:'hook'}); expect(separated.items.hook).toBe('absent'); expect(separated.items.rod).toBe('inventory');
  });
});
describe('短問と出航', () => {
  it('収納材の初期配置は重ならず、検査した7手で取り出せる', () => {
    let g=newGame(); const occupied=new Set<string>();
    blocks.forEach((b,i)=>{ for(let n=0;n<b.length;n++){const cell=b.axis==='x'?`${g.tray[i]+n},${b.fixed}`:`${b.fixed},${g.tray[i]+n}`;expect(occupied.has(cell)).toBe(false);occupied.add(cell);}});
    for(const [index,value] of [[7,0],[5,4],[2,0],[3,0],[4,3],[1,3],[0,4]]) {expect(canSlide(g.tray,index,value)).toBe(true);g=act(g,{type:'slide',index,value}).game;}
    expect(act(g,{type:'openTray'}).game.trayOpen).toBe(true);
  });
  it('全条件で通れる航路は一本、異なる根拠を除けば複数になる', () => {
    function paths(ignoreDepth=false,ignoreBeam=false){const found:string[]=[];function walk(at:string,visited:string[]){if(at==='T'){found.push(visited.join(''));return;}for(const [a,b,z,beam] of channels){if((!ignoreDepth&&3-z<0.5)||(!ignoreBeam&&beam))continue;const n=a===at?b:b===at?a:null;if(n&&!visited.includes(n))walk(n,[...visited,n]);}}walk('S',['S']);return found;}
    expect(paths()).toEqual(['SBCET']); expect(paths(false,true)).toHaveLength(2); expect(paths(true,false)).toHaveLength(3);
  });
  it('誤った分岐から正しい分岐へ続けて進め、未読でも脱出できる', () => {
    const g=newGame(); g.boatInside=g.boatOutside=g.boatDry=g.lampLit=g.gateOpen=true;g.water=2;
    const final=run(g,{type:'depart'},{type:'sail',node:'A'},{type:'sail',node:'B'},{type:'sail',node:'C'},{type:'sail',node:'F'},{type:'sail',node:'E'},{type:'sail',node:'T'});
    expect(final.ended).toBe(true); expect(final.seen).toEqual([]); expect(final.seaHistory).toEqual(['S','B','C','E','T']);
  });
});
describe('保存', () => {
  it('調整途中と未取得物を往復後も維持する', () => {const g=newGame();g.rings=[3,4,7];g.rodMark=5;g.drawerOpen=true;const loaded=parseSave(JSON.stringify(g));expect(loaded).toEqual(g);});
  it('壊れたデータや配列の不足を受け入れない', () => {expect(parseSave('{')).toBeNull();expect(parseSave('{}')).toBeNull();const g=newGame();g.valves=[];expect(parseSave(JSON.stringify(g))).toBeNull();});
  it('移行状態で不可能な部屋に残った保存から帰還できる', () => {const g=newGame();g.room='service';g.water=2;g.detail='patch';const loaded=parseSave(JSON.stringify(g));expect(loaded?.room).toBe('concourse');expect(loaded?.detail).toBeNull();});
});
