export const TYPES={'attack-pattern':'Técnicas','x-mitre-tactic':'Táticas','intrusion-set':'Grupos','malware':'Malware','tool':'Ferramentas','campaign':'Campanhas','course-of-action':'Mitigações','x-mitre-detection-strategy':'Estratégias de detecção','x-mitre-analytic':'Analíticas','x-mitre-data-source':'Fontes de dados','x-mitre-data-component':'Componentes de dados','x-mitre-matrix':'Matrizes','x-mitre-asset':'Ativos'};
export const DOMAIN_NAMES={'enterprise-attack':'Enterprise','mobile-attack':'Mobile','ics-attack':'ICS'};
export const BASE='https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/';
export const active=o=>!o.revoked&&!o.deprecated;
export function normalize(bundle,domain){
 if(bundle?.type!=='bundle'||!Array.isArray(bundle.objects)||!bundle.objects.some(o=>o.type==='attack-pattern'))throw Error('Arquivo STIX inválido ou sem técnicas.');
 const collection=bundle.objects.find(o=>o.type==='x-mitre-collection');
 const objects=bundle.objects.filter(o=>!['relationship','identity','marking-definition','x-mitre-collection','extension-definition'].includes(o.type)).map(o=>{
 const ref=o.external_references?.find(r=>r.source_name?.startsWith('mitre-')&&r.external_id);
 return {id:o.id,type:o.type,name:o.name||o.id,external:ref?.external_id||'',url:ref?.url||'',description:o.description||'',aliases:o.aliases||o.x_mitre_aliases||[],platforms:o.x_mitre_platforms||[],phases:(o.kill_chain_phases||[]).map(k=>k.phase_name),shortname:o.x_mitre_shortname||'',sub:!!o.x_mitre_is_subtechnique,revoked:!!o.revoked,deprecated:!!o.x_mitre_deprecated,modified:o.modified||'',refs:o.external_references||[],fields:Object.fromEntries(Object.entries(o).filter(([k])=>k.startsWith('x_mitre_')&&!['x_mitre_aliases','x_mitre_platforms','x_mitre_shortname','x_mitre_is_subtechnique','x_mitre_deprecated'].includes(k)))};
 });
 const ids=new Set(objects.map(o=>o.id));
 const relationships=bundle.objects.filter(o=>o.type==='relationship'&&ids.has(o.source_ref)&&ids.has(o.target_ref)).map(o=>({id:o.id,source:o.source_ref,target:o.target_ref,type:o.relationship_type,description:o.description||'',refs:o.external_references||[],revoked:!!o.revoked,deprecated:!!o.x_mitre_deprecated}));
 const matrix=bundle.objects.find(o=>o.type==='x-mitre-matrix'&&!o.revoked&&!o.x_mitre_deprecated);
 return {schema:1,domain,version:collection?.x_mitre_version||'não informada',loadedAt:new Date().toISOString(),source:BASE+domain+'/'+domain+'.json',objects,relationships,tacticOrder:matrix?.tactic_refs||[]};
}
export function indexData(data){const byId=new Map(data.objects.map(o=>[o.id,o]));const outgoing=new Map(),incoming=new Map();for(const r of data.relationships){if(!active(r))continue;for(const [map,key]of[[outgoing,r.source],[incoming,r.target]]){if(!map.has(key))map.set(key,[]);map.get(key).push(r)}}return {byId,outgoing,incoming};}
export function defenseGuidance(idx,techniqueId){
 const incoming=idx.incoming.get(techniqueId)||[];
 const linked=(relationship,type)=>incoming.filter(r=>r.type===relationship).map(r=>({object:idx.byId.get(r.source),relationship:r})).filter(x=>x.object?.type===type&&active(x.object));
 const detections=linked('detects','x-mitre-detection-strategy').map(x=>({...x,analytics:(x.object.fields?.x_mitre_analytic_refs||[]).map(id=>idx.byId.get(id)).filter(o=>o?.type==='x-mitre-analytic'&&active(o))}));
 return {detections,mitigations:linked('mitigates','course-of-action')};
}
export function scores(data,idx,selected,archived=false){const result=new Map();for(const id of new Set(selected)){for(const r of idx.outgoing.get(id)||[]){const target=idx.byId.get(r.target);if(r.type!=='uses'||target?.type!=='attack-pattern'||(!archived&&!active(target)))continue;if(!result.has(target.id))result.set(target.id,new Set());result.get(target.id).add(id)}}return result;}
export function layer(data,idx,selected){const sc=scores(data,idx,selected);return {name:'Atlas — comparação ATT&CK',versions:{attack:data.version.split('.')[0],navigator:'5.3.0',layer:'4.5'},domain:data.domain,description:'Relações diretas uses dos itens selecionados: '+selected.map(id=>idx.byId.get(id)?.name).join(', ')+'. Score = número de entidades com uso documentado. Sem herança de subtécnicas para técnicas pai. Não mede frequência de ataques. Base '+data.source,techniques:[...sc].map(([id,actors])=>({techniqueID:idx.byId.get(id).external,score:actors.size,comment:[...actors].map(a=>idx.byId.get(a).name).join('; '),enabled:true})),gradient:{colors:['#e7f2ef','#468773'],minValue:0,maxValue:Math.max(1,selected.length)},layout:{layout:'side',showName:true,showID:false,showAggregateScores:false,expandedSubtechniques:'annotated'},links:[{label:'Base oficial STIX',url:data.source}],metadata:[{name:'Versão da base',value:data.version}]};}
