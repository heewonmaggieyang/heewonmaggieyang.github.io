'use strict';
(() => {
  const data = window.RICHMOND_PUBLIC;
  const comparison = window.RICHMOND_COMPARISON;
  let scope = 'common';
  for (const row of Object.values(window.RICHMOND_ED_STATS.rows)) {
    const s=row.summary;
    if (!data.districts.some(d=>d.ed===s.ed)) data.districts.push({ed:s.ed,year:s.census,parts:[],status:'unmapped',method:'No boundary is published for this district. Demographic summaries remain available.'});
  }
  const ns = 'http://www.w3.org/2000/svg';
  const byId = id => document.getElementById(id);
  const districts = new Map(data.districts.map(d => [d.ed, d]));
  const maps = [byId('map-1940'), byId('map-1950')];
  const paths = new Map();
  const labels = [];
  const districtLabels = new Map();
  const yardGroups = [];
  let selected = '';
  let view = [0, 0, 10000, 10000];
  let drag = null;
  function svg(tag, attributes, parent) {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    if (parent) parent.append(element);
    return element;
  }
  const partsFor = d => scope==='common' ? comparison.parts[d.ed] || [] : d.parts;
  const rings = d => partsFor(d).flatMap(p => [p.outer, ...(p.holes || [])]);
  const points = list => list.flatMap(d => partsFor(d).flatMap(p => p.outer));
  function bounds(coords) {
    let left=Infinity, right=-Infinity, bottom=Infinity, top=-Infinity;
    for (const [x,y] of coords) { left=Math.min(left,x); right=Math.max(right,x); bottom=Math.min(bottom,y); top=Math.max(top,y); }
    return [left, -top, right-left, top-bottom];
  }
  function fit(box) {
    const ratio = maps[0].clientWidth / maps[0].clientHeight;
    const w = Math.max(box[2]*1.12, box[3]*1.12*ratio, 400);
    const h = w/ratio;
    setView([box[0]+box[2]/2-w/2, box[1]+box[3]/2-h/2,w,h]);
  }
  function setView(next) {
    if (!next.every(Number.isFinite) || next[2]<150 || next[2]>100000) return;
    view=next;
    for (const map of maps) map.setAttribute('viewBox',view.join(' '));
    const unit=view[2]/Math.max(maps[0].clientWidth,1);
    for (const label of labels) { label.setAttribute('font-size',11*unit); label.setAttribute('stroke-width',2.5*unit); }
    for (const group of yardGroups) {
      const s=6*unit;
      group.firstElementChild.setAttribute('d',`M0,${-s} L${s},0 L0,${s} L${-s},0 Z`);
      const label=group.lastElementChild;
      label.setAttribute('font-size',10*unit); label.setAttribute('x',9*unit); label.setAttribute('y',3*unit); label.setAttribute('stroke-width',2.5*unit);
    }
    byId('scale-note').textContent=`View width ≈ ${(view[2]/1000).toFixed(1)} km`;
  }
  function zoom(factor,anchor) {
    const point=anchor || [view[0]+view[2]/2,view[1]+view[3]/2];
    setView([point[0]+(view[0]-point[0])*factor,point[1]+(view[1]-point[1])*factor,view[2]*factor,view[3]*factor]);
  }
  function localPoint(event,map) {
    return new DOMPoint(event.clientX,event.clientY).matrixTransform(map.getScreenCTM().inverse());
  }
  function path(coords,close=false) {return coords.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${(-y).toFixed(2)}`).join(' ')+(close?'Z':'');}
  function center(d) {
    if(scope==='common' && comparison.label_points[d.ed]) {
      const [x,y]=comparison.label_points[d.ed];return [x,-y];
    }
    let best=null,bestArea=-1;
    for(const part of partsFor(d)) {
      let area=0,x=0,y=0;
      for(let i=0;i<part.outer.length-1;i++) {const a=part.outer[i],b=part.outer[i+1],k=a[0]*b[1]-b[0]*a[1];area+=k;x+=(a[0]+b[0])*k;y+=(a[1]+b[1])*k;}
      if(Math.abs(area)>bestArea && area!==0) {bestArea=Math.abs(area);best=[x/(3*area),-y/(3*area)];}
    }
    return best || [partsFor(d)[0].outer[0][0],-partsFor(d)[0].outer[0][1]];
  }
  function choose(ed,updateHash=true) {
    if(ed && !districts.has(ed)) return;
    selected=ed;
    byId('district').value=ed;
    byId('focus-selected').disabled=!ed || !partsFor(districts.get(ed)).length;
    for(const [key,p] of paths) p.classList.toggle('selected',key===ed);
    byId('source-links').replaceChildren();
    byId('method-heading').hidden=!ed;
    if(!ed) {
      byId('selection-title').textContent='Select a district on either map';
      byId('selection-status').textContent='Its original boundary description and reconstruction method will appear here.';
      byId('selection-description').textContent='Use the district menu or click a boundary.';
      byId('selection-method').textContent='';
    } else {
      const d=districts.get(ed);
      byId('selection-title').textContent=`${d.year} · ED ${ed}`;
      byId('selection-status').textContent=!d.parts.length?'Demographics available · boundary not mapped.':d.status.includes('low_confidence')?'Lower-confidence provisional reconstruction.':'Provisional reconstruction · historical accuracy under review.';
      byId('selection-description').textContent=d.description || 'No transcribed description is available for this district.';
      byId('selection-method').textContent=d.method;
      const area=comparison.areas[ed];
      if(scope==='common' && area) byId('selection-status').textContent+=` Showing ${(area.retained_area_share*100).toFixed(1)}% of its full reconstructed area; statistics cover the whole ED.`;
      (d.description_urls || []).forEach((url,index)=>{
        if(!/^https:\/\/nara-(1940|1950)-census\.s3\.us-east-2\.amazonaws\.com\//.test(url)) return;
        const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent=`Original description${d.description_urls.length>1?' '+(index+1):''} ↗`;byId('source-links').append(link);
      });
    }
    if(updateHash) history.replaceState(null,'',location.pathname+location.search+(ed?'#'+ed:''));
    window.RichmondDemographics.show(ed ? districts.get(ed) : null);
  }
  const dropdown=byId('district');
  for(const year of [1940,1950]) {
    const options=document.createElement('optgroup');options.label=String(year);dropdown.append(options);
    const map=byId(`map-${year}`);
    const roadLayer=svg('g',{class:'road-layer'},map);
    for(const road of data.roads) svg('path',{d:path(road.xy),class:'road'},roadLayer);
    const districtLayer=svg('g',{},map);
    map.append(roadLayer);
    const labelLayer=svg('g',{class:'label-layer'},map);
    for(const d of data.districts.filter(d=>d.year===year).sort((a,b)=>a.ed.localeCompare(b.ed,'en',{numeric:true}))) {
      options.append(new Option(`${year} · ED ${d.ed}${d.parts.length?'':' (statistics only)'}`,d.ed));
      if(!d.parts.length) continue;
      const p=svg('path',{d:rings(d).map(r=>path(r,true)).join(' '),class:'district'+(d.status.includes('low_confidence')?' low-confidence':''),'data-ed':d.ed},districtLayer);
      svg('title',{},p).textContent=`${year} ED ${d.ed} · provisional boundary`;
      p.addEventListener('click',()=>{if(!map.wasDragged) choose(d.ed);});
      paths.set(d.ed,p);
      const [x,y]=center(d);const label=svg('text',{x,y,class:'ed-label'},labelLayer);label.textContent=d.ed;labels.push(label);districtLabels.set(d.ed,label);
    }
    if(year===1950) {
      const yards=svg('g',{class:'yard-layer'},map);
      data.landmarks.forEach((landmark,index)=>{
        const group=svg('g',{transform:`translate(${landmark.xy[0]} ${-landmark.xy[1]})`},yards);
        const marker=svg('path',{class:'yard'},group);svg('title',{},marker).textContent=`${landmark.name} · ${landmark.period} · approximate reference location`;
        const label=svg('text',{class:'yard-label'},group);label.textContent=`Shipyard ${index+1}`;yardGroups.push(group);
      });
    }
    map.addEventListener('wheel',event=>{event.preventDefault();const p=localPoint(event,map);zoom(event.deltaY>0?1.15:1/1.15,[p.x,p.y]);},{passive:false});
    map.addEventListener('pointerdown',event=>{if(event.button!==0)return;map.wasDragged=false;drag={map,x:event.clientX,y:event.clientY,view:[...view],unit:1/map.getScreenCTM().a};});
    map.addEventListener('pointermove',event=>{
      if(!drag || drag.map!==map)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      if(Math.abs(dx)+Math.abs(dy)>5) {map.wasDragged=true;if(!map.hasPointerCapture(event.pointerId))map.setPointerCapture(event.pointerId);}
      if(map.wasDragged)setView([drag.view[0]-dx*drag.unit,drag.view[1]-dy*drag.unit,drag.view[2],drag.view[3]]);
    });
    const end=()=>{if(drag?.map===map)drag=null;};
    map.addEventListener('pointerup',end);map.addEventListener('pointercancel',end);map.addEventListener('lostpointercapture',end);
    map.addEventListener('keydown',event=>{
      const shifts={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]};
      if(shifts[event.key]) {event.preventDefault();const [x,y]=shifts[event.key];setView([view[0]+x*view[2],view[1]+y*view[3],view[2],view[3]]);}
      else if(event.key==='+'||event.key==='=') {event.preventDefault();zoom(1/1.3);}
      else if(event.key==='-') {event.preventDefault();zoom(1.3);}
    });
  }
  function updateScope() {
    scope=byId('scope').value;
    for(const [ed,p] of paths) {
      const d=districts.get(ed),parts=partsFor(d),label=districtLabels.get(ed);
      p.setAttribute('d',rings(d).map(r=>path(r,true)).join(' '));
      label.style.display=parts.length?'':'none';
      if(parts.length){const [x,y]=center(d);label.setAttribute('x',x);label.setAttribute('y',y);}
    }
    byId('scope-note').textContent=scope==='common'
      ? 'Common reconstructed area: both years are clipped to the same available footprint. This comparison boundary is not a historical shoreline or city limit. Colors and statistics still describe whole EDs, not just the displayed portions.'
      : 'Full reconstructed boundaries: some 1940 outer districts include extensive water areas. The two years have different mapped coverage, so their outer extents are not directly comparable. Statistics describe whole EDs.';
    fit(bounds(points(data.districts)));
    choose(selected,false);
  }
  byId('scope').value='common';
  byId('scope').addEventListener('change',updateScope);
  dropdown.addEventListener('change',event=>choose(event.target.value));
  byId('zoom-in').addEventListener('click',()=>zoom(1/1.3));
  byId('zoom-out').addEventListener('click',()=>zoom(1.3));
  byId('urban-view').addEventListener('click',()=>fit(bounds(points(data.districts.filter(d=>d.year===1950)))));
  byId('full-view').addEventListener('click',()=>fit(bounds(points(data.districts))));
  byId('focus-selected').addEventListener('click',()=>{if(selected && partsFor(districts.get(selected)).length)fit(bounds(points([districts.get(selected)])));});
  for(const [input,layer] of [['roads','road-layer'],['labels','label-layer'],['shipyards','yard-layer']]) byId(input).addEventListener('change',event=>document.querySelectorAll('.'+layer).forEach(g=>{g.style.display=event.target.checked?'':'none';}));
  window.addEventListener('pointerup',()=>{drag=null;});
  window.addEventListener('resize',()=>{const center=[view[0]+view[2]/2,view[1]+view[3]/2],height=view[2]*maps[0].clientHeight/maps[0].clientWidth;setView([center[0]-view[2]/2,center[1]-height/2,view[2],height]);});
  window.RichmondDemographics.init(data.districts,paths);
  updateScope();
  if(districts.has(location.hash.slice(1))) {choose(location.hash.slice(1),false);if(partsFor(districts.get(selected)).length)fit(bounds(points([districts.get(selected)])));}
})();
