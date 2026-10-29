import fs from 'node:fs/promises';
import {normalize} from './dist/core.mjs';
for(const domain of ['enterprise-attack','mobile-attack','ics-attack']){
 const raw=JSON.parse(await fs.readFile(new URL('./raw/'+domain+'.json',import.meta.url),'utf8'));
 const data=normalize(raw,domain);
 const parts=[];
 for(let i=0;i<data.relationships.length;i+=4000){const file=domain+'-relationships-'+(i/4000)+'.json';parts.push(file);await fs.writeFile(new URL('./dist/data/'+file,import.meta.url),JSON.stringify(data.relationships.slice(i,i+4000)));}
 await fs.writeFile(new URL('./dist/data/'+domain+'.json',import.meta.url),JSON.stringify({...data,relationships:[],relationshipParts:parts}));
 console.log(domain,'v'+data.version,data.objects.length+' entities',data.relationships.length+' relationships');
}
