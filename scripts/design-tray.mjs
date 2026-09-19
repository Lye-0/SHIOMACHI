import { blocks, canSlide } from '../src/game/model.ts';
const start = [0,0,0,2,3,4,3,1];
const key = p => p.join('');
const states = new Map([[key(start), start]]), adjacency = new Map(), queue = [start];
for (let cursor = 0; cursor < queue.length; cursor++) {
  const at = queue[cursor], edges = [];
  for (let i = 0; i < blocks.length; i++) for (let next = 0; next <= 6 - blocks[i].length; next++) {
    if (next === at[i] || !canSlide(at, i, next)) continue;
    const p = [...at]; p[i] = next; const k = key(p);
    edges.push({ key: k, index: i, value: next });
    if (!states.has(k)) { states.set(k,p); queue.push(p); }
  }
  adjacency.set(key(at), edges);
}
const distance = new Map(), predecessor = new Map(), breadth = [];
for (const [k,p] of states) if (p[0] === 4) { distance.set(k,0); breadth.push(k); }
for (let i=0; i<breadth.length; i++) {
  const at = breadth[i];
  for (const edge of adjacency.get(at)) if (!distance.has(edge.key)) {
    distance.set(edge.key, distance.get(at)+1); predecessor.set(edge.key, at); breadth.push(edge.key);
  }
}
const candidates = [...distance].filter(([k,d]) => d >= 8 && d <= 13 && states.get(k)[0] === 0).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
const selected = candidates[0] ?? [...distance].sort((a,b)=>b[1]-a[1])[0];
let cursor = selected[0]; const solution = [];
while (predecessor.has(cursor)) { const next = predecessor.get(cursor); solution.push(adjacency.get(cursor).find(e=>e.key===next)); cursor = next; }
console.log(JSON.stringify({ states: states.size, position: states.get(selected[0]), minimumMoves: selected[1], solution },null,2));
