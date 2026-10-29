import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {active,indexData,scores,layer,defenseGuidance} from './dist/core.mjs';
for(const domain of ['enterprise-attack','mobile-attack','ics-attack']){
 const d=JSON.parse(await fs.readFile('dist/data/'+domain+'.json','utf8'));
 d.relationships=(await Promise.all(d.relationshipParts.map(async f=>JSON.parse(await fs.readFile('dist/data/'+f,'utf8'))))).flat();
 const idx=indexData(d);assert.equal(idx.byId.size,d.objects.length);
 assert.ok(d.objects.some(o=>o.type==='attack-pattern'&&active(o)));
 assert.ok(d.objects.some(o=>o.type==='x-mitre-tactic'&&active(o)));
 assert.ok(d.relationships.every(r=>idx.byId.has(r.source)&&idx.byId.has(r.target)));
 const actors=d.objects.filter(o=>['malware','intrusion-set'].includes(o.type)&&active(o)).slice(0,3).map(o=>o.id);
 const sc=scores(d,idx,actors);for(const [id,set] of sc){assert.ok(set.size>=1&&set.size<=actors.length);assert.equal(idx.byId.get(id).type,'attack-pattern');for(const a of set)assert.ok(d.relationships.some(r=>active(r)&&r.source===a&&r.target===id&&r.type==='uses'));}
 if(domain==='enterprise-attack'){
 const families=['LockBit 3.0','Clop','Qilin'].map(n=>d.objects.find(o=>o.name===n&&active(o))?.id);assert.ok(families.every(Boolean));
 const counts=scores(d,idx,families),process=d.objects.find(o=>o.external==='T1057'&&active(o));assert.equal(counts.get(process.id).size,3);
 const exported=layer(d,idx,families);assert.equal(exported.techniques.length,counts.size);assert.ok(exported.techniques.every(t=>t.score>=1&&t.score<=3));assert.equal(exported.versions.attack,'20');assert.equal(scores(d,idx,[]).size,0);
 const encryption=d.objects.find(o=>o.external==='T1486'&&active(o)),guidance=defenseGuidance(idx,encryption.id);
 assert.ok(guidance.mitigations.some(x=>x.object.external==='M1053'));assert.ok(guidance.mitigations.some(x=>x.object.external==='M1040'));
 assert.ok(guidance.detections.some(x=>x.object.external==='DET0215'&&x.analytics.length===5));
 assert.ok(guidance.detections.flatMap(x=>x.analytics).some(a=>a.fields.x_mitre_log_source_references?.length));
 assert.equal(defenseGuidance(idx,process.id).mitigations.length,0);assert.ok(defenseGuidance(idx,process.id).detections.length>0);
 console.log('Detection strategies, platform analytics, log sources and technique-specific mitigations validated.');
 console.log('Known comparison:',counts.size,'techniques;',exported.techniques.filter(t=>t.score===3).length,'shared by all 3');
 }
 for(const file of [domain+'.json',...d.relationshipParts])assert.ok((await fs.stat('dist/data/'+file)).size<25*1024*1024);
 console.log(domain,'validated:',d.objects.filter(active).length,'active entities,',d.relationships.length,'relationships');
}
const html=await fs.readFile('dist/index.html','utf8'),app=await fs.readFile('dist/app.mjs','utf8');
for(const match of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(html.includes('id="'+match[1]+'"'),'Missing element: '+match[1]);
assert.ok(!html.includes('CONCEITO'));console.log('DOM element references and asset sizes validated.');
