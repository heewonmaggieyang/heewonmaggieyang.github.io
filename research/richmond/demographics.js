'use strict';
(() => {
  const stats=window.RICHMOND_ED_STATS, byId=id=>document.getElementById(id);
  const metrics={
    n_persons:['Residents','Population and households'],
    n_households:['General households','Population and households'],
    mean_household_size:['Mean household size','Population and households'],
    pct_gq:['Living in group quarters (%)','Population and households'],
    pct_black:['Black residents (%)','Race'],
    age_mean:['Mean age','Age'], age_median:['Median age','Age'],
    pct_birth_south:['Born in the South (%)','Birthplace'],
    pct_labor_force:['Labor-force participation (%, age 15+)','Labor market'],
    pct_employed:['Employed (%, age 15+, known status)','Labor market'],
    occscore_mean:['Mean OCCSCORE (labor force, age 15+)','Labor market'],
    occscore_median:['Median OCCSCORE (labor force, age 15+)','Labor market'],
    occscore_employed_mean:['Mean OCCSCORE (employed, age 15+)','Labor market'],
    pct_linked1940_age10plus:['Linked to 1940 (%, age 10+ in 1950)','Earlier residence'],
    pct_origin1940_south:['Lived in the South in 1940 (% of linked residents)','Earlier residence']
  };
  const dimensions={race:'Race',sex:'Sex',age_band:'Age',birth_region:'Birthplace',residence1940_region:'Earlier residence',link_status:'Linkage status'};
  const categoryLabel=(dim,cat)=>({race:cat+' (%)',sex:cat+' (%)',age_band:'Age '+cat+' (%)',birth_region:'Born in '+cat+' (%)',residence1940_region:'Lived in '+cat+' in 1940 (% of linked residents)',link_status:'Link status: '+cat.replaceAll('_',' ')+' (%)'})[dim];
  const categoryMetrics={};
  for(const item of Object.values(stats.rows)) for(const [dim,rows] of Object.entries(item.categories)) for(const row of rows) {
    const key=`cat:${dim}:${row.category}`;
    if(!categoryMetrics[key]) {categoryMetrics[key]=[dim,row.category];metrics[key]=[categoryLabel(dim,row.category),dimensions[dim]];}
  }
  const get=d=>stats.rows[`${d.year}:${d.ed}`];
  const value=(d,key)=>{const r=get(d);if(!r)return null;const c=categoryMetrics[key];return c?r.categories[c[0]]?.find(x=>x.category===c[1])?.pct??null:r.summary[key]??null;};
  const percent=k=>k.startsWith('pct_')||k.startsWith('cat:');
  const format=(v,k='')=>v==null?'—':v.toLocaleString('en-US',{maximumFractionDigits:k.startsWith('n_')?0:1})+(percent(k)?'%':'');
  const make=(tag,text,parent)=>{const e=document.createElement(tag);e.textContent=text;if(parent)parent.append(e);return e;};
  let records=[],paths;
  const palette=['#eff3ff','#c6dbef','#9ecae1','#6baed6','#3182bd','#08519c'];
  function colorize() {
    const key=byId('metric').value,legend=byId('demographic-legend');legend.replaceChildren();
    if(!key){for(const p of paths.values())p.style.removeProperty('fill');legend.hidden=true;return;}
    legend.hidden=false;
    const values=records.filter(d=>d.parts.length).map(d=>value(d,key)).filter(Number.isFinite).sort((a,b)=>a-b);
    const breaks=[];
    if(values.length && values[0]!==values.at(-1))for(let i=1;i<6;i++){
      const v=values[Math.floor(i*(values.length-1)/6)];
      if(v<values.at(-1)&&!breaks.includes(v))breaks.push(v);
    }
    const colors=Array.from({length:breaks.length+1},(_,i)=>palette[breaks.length?Math.round(i*5/breaks.length):2]);
    for(const d of records){const p=paths.get(d.ed);if(!p)continue;const v=value(d,key);p.style.fill=v==null?'#e3e6e8':colors[breaks.filter(b=>v>b).length];}
    make('strong',metrics[key][0],legend);
    make('span',' · Shared classes across mapped districts in both years',legend);
    const row=make('div','',legend);row.className='legend-swatches';
    const swatch=(color,label)=>{const s=make('span','',row),chip=make('i','',s);chip.style.background=color;s.append(document.createTextNode(label));};
    if(values.length)for(let i=0;i<colors.length;i++){
      const lower=i?breaks[i-1]:values[0],upper=i<breaks.length?breaks[i]:values.at(-1);
      swatch(colors[i],(i?'> ':'')+format(lower,key)+(lower===upper?'':' to '+format(upper,key)));
    }
    swatch('#e3e6e8','Unavailable / suppressed');
    make('small','Classes follow pooled ED quantiles; duplicate cutoffs are merged. Counts describe whole districts, not population density.',legend);
  }
  function show(d) {
    const cards=byId('demographic-cards'),content=byId('demographic-table-content');cards.replaceChildren();content.replaceChildren();
    const r=d&&get(d);byId('demographic-tables').hidden=!r;
    byId('demographics-context').textContent=r?`${d.year} · ED ${d.ed}${d.parts.length?' · whole-district statistics':' · statistics available; no mapped boundary'}`:'Select a district to view the census summaries linked to it.';
    if(!r)return;
    for(const key of ['n_persons','n_households','mean_household_size','pct_black','age_mean','pct_birth_south','pct_labor_force','occscore_mean',...(d.year===1950?['pct_linked1940_age10plus','pct_origin1940_south']:[])]){
      const cell=make('div','',cards);make('dt',metrics[key][0],cell);make('dd',format(r.summary[key],key),cell);
    }
    const table=(caption,heads)=>{const wrap=make('div','',content);wrap.className='table-scroll';const t=make('table','',wrap);make('caption',caption,t);const header=make('tr','',make('thead','',t));heads.forEach(h=>{const th=make('th',h,header);th.scope='col';});return make('tbody','',t);};
    const row=(body,values)=>{const tr=make('tr','',body);values.forEach((v,i)=>{const cell=make(i?'td':'th',v,tr);if(!i)cell.scope='row';});};
    const body=table('Summary indicators',['Indicator','Value']);
    for(const [key,[label]] of Object.entries(metrics))if(!categoryMetrics[key] && !(d.year===1940&&key.includes('1940')))row(body,[label,format(r.summary[key],key)]);
    for(const [key,label] of [['n_lf_known','Participation denominator (age 15+, known status)'],['n_emp_known','Employment denominator (age 15+, known status)'],['occscore_n','Valid OCCSCORE observations (labor force, age 15+)'],['n_linked1940','1950 residents linked to 1940'],['n_link_age_eligible','1950 residents aged 10+']])if(d.year===1950||!key.includes('link'))row(body,[label,format(r.summary[key],key)]);
    for(const [dim,rows] of Object.entries(r.categories)){
      const body=table(dim==='residence1940_region'?'Residence in 1940 (linked 1950 residents only)':dimensions[dim],['Category','Count','Denominator','Share']);
      for(const c of rows)row(body,[c.category.replaceAll('_',' '),format(c.n,'n_persons'),format(c.denominator,'n_persons'),format(c.pct,'pct_category')]);
    }
  }
  function init(allRecords,allPaths) {
    records=allRecords;paths=allPaths;const groups={};
    for(const [key,[label,group]] of Object.entries(metrics)){
      if(!groups[group]){groups[group]=document.createElement('optgroup');groups[group].label=group;byId('metric').append(groups[group]);}
      groups[group].append(new Option(label,key));
    }
    byId('metric').value='n_persons';byId('metric').addEventListener('change',colorize);colorize();
  }
  window.RichmondDemographics={init,show};
})();
