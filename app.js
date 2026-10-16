'use strict';
const STORAGE_KEY='resumemuna-phase1-v1';
const defaults={fullName:'Juan Dela Cruz',jobTitle:'Virtual Assistant',email:'juan@example.com',phone:'+63 912 345 6789',location:'Quezon, Philippines',website:'linkedin.com/in/juandelacruz',summary:'Detail-oriented professional with experience supporting daily operations, managing administrative tasks, and using digital tools to improve workflows.',skills:'Administrative Support, Research, Google Workspace, Communication, Microsoft Excel',accent:'#1d4ed8',fontSize:'normal',experience:[{role:'Administrative Assistant',company:'Sample Company',dates:'2024 – 2026',description:'Coordinated daily administrative tasks and maintained accurate records.\nImproved team workflows through organized documentation.'}],education:[{degree:'Bachelor of Science in Business Administration',school:'Sample University',dates:'2020 – 2024',description:''}],projects:[],certifications:[],languages:[],awards:[],volunteer:[],references:[],customSections:[],sectionOrder:['summary','experience','education','skills','projects','certifications','languages','awards','volunteer','references','customSections'],hiddenSections:[]};
function fresh(){return JSON.parse(JSON.stringify(defaults));}
let data;try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));data=saved&&typeof saved==='object'&&!Array.isArray(saved)?{...fresh(),...saved}:fresh();}catch{data=fresh();}
for(const k of ['experience','education','projects','certifications','languages','awards','volunteer','references','customSections'])if(!Array.isArray(data[k]))data[k]=[];
const schemas={experience:[['role','Job title'],['company','Company'],['dates','Dates (e.g. 2023 – 2025)'],['description','Achievements / responsibilities','textarea']],education:[['degree','Degree / qualification'],['school','School / institution'],['dates','Dates'],['description','Additional details','textarea']],projects:[['name','Project name'],['link','Project link (optional)'],['description','Description','textarea']],certifications:[['name','Certification / license'],['issuer','Issuing organization'],['dates','Issued / expiration dates'],['credential','Credential ID or URL (optional)']],languages:[['name','Language'],['level','Proficiency (optional)']],awards:[['name','Award / achievement'],['issuer','Organization (optional)'],['dates','Date (optional)'],['description','Details (optional)','textarea']],volunteer:[['role','Role'],['organization','Organization'],['dates','Dates'],['description','Contributions','textarea']],references:[['name','Reference name'],['role','Title / relationship'],['contact','Email or phone (optional)']],customSections:[['title','Section heading'],['content','Details','textarea']]};
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderFields(){for(const [type,fields] of Object.entries(schemas)){const root=document.getElementById(type+'Fields');root.replaceChildren();data[type].forEach((item,index)=>{const wrapper=document.createElement('div');wrapper.className='repeat-item';const top=document.createElement('div');top.className='repeat-top';const label=document.createElement('span');label.textContent=`${type==='experience'?'Experience':type==='education'?'Education':type==='projects'?'Project':({certifications:'Certification',languages:'Language',awards:'Award',volunteer:'Volunteer role',references:'Reference',customSections:'Custom section'}[type]||type)} ${index+1}`;const remove=document.createElement('button');remove.className='btn remove';remove.type='button';remove.textContent='Remove';remove.addEventListener('click',()=>{data[type].splice(index,1);renderFields();changed();});top.append(label,remove);wrapper.append(top);const group=document.createElement('div');group.className='fields';for(const [key,title,kind] of fields){const fieldLabel=document.createElement('label');fieldLabel.textContent=title;const input=document.createElement(kind==='textarea'?'textarea':'input');if(kind==='textarea')input.rows=3;input.value=item[key]??'';input.addEventListener('input',()=>{item[key]=input.value;changed();});fieldLabel.append(input);group.append(fieldLabel);}wrapper.append(group);root.append(wrapper);});}}
function section(title,inner){return inner?`<section class="r-section"><h3>${title}</h3>${inner}</section>`:'';}
function entry(head,sub,dates,description){return `<div class="r-entry"><div class="r-entry-head"><strong>${escapeHTML(head)}</strong><span class="dates">${escapeHTML(dates)}</span></div>${sub?`<div class="r-sub">${escapeHTML(sub)}</div>`:''}${description?`<div class="r-description">${escapeHTML(description)}</div>`:''}</div>`;}
const sectionLabels={summary:'Professional Summary',experience:'Work Experience',education:'Education',skills:'Skills',projects:'Projects',certifications:'Certifications & Licenses',languages:'Languages',awards:'Awards & Achievements',volunteer:'Volunteer Experience',references:'Professional References',customSections:'Custom Sections'};
const sectionKeys=Object.keys(sectionLabels);
function hasSectionContent(key){
  if(key==='summary'||key==='skills')return Boolean(String(data[key]??'').trim());
  return Array.isArray(data[key])&&data[key].some(item=>item&&typeof item==='object'&&Object.values(item).some(value=>String(value??'').trim()));
}
function sectionIsChecked(key){
  const choice=data.sectionVisibility[key];
  return choice==='shown'||(choice!=='hidden'&&hasSectionContent(key));
}
function normalize(){
  for(const k of Object.keys(schemas))if(!Array.isArray(data[k]))data[k]=[];
  const order=Array.isArray(data.sectionOrder)?data.sectionOrder:[];
  data.sectionOrder=[...new Set([...order.filter(k=>sectionKeys.includes(k)),...sectionKeys])];
  // Migrate older saved resumes without changing any previously hidden sections.
  const legacyHidden=Array.isArray(data.hiddenSections)?data.hiddenSections:[];
  const visibility=data.sectionVisibility&&typeof data.sectionVisibility==='object'&&!Array.isArray(data.sectionVisibility)?data.sectionVisibility:{};
  data.sectionVisibility=Object.fromEntries(sectionKeys.map(key=>[key,['auto','shown','hidden'].includes(visibility[key])?visibility[key]:legacyHidden.includes(key)?'hidden':'auto']));
  data.hiddenSections=sectionKeys.filter(key=>data.sectionVisibility[key]==='hidden');
}
function renderManager(){
  const root=document.getElementById('sectionManager');if(!root)return;
  root.replaceChildren();
  data.sectionOrder.forEach((key,index)=>{
    const line=document.createElement('div');line.className='section-control';
    const label=document.createElement('label');const checkbox=document.createElement('input');
    checkbox.type='checkbox';checkbox.checked=sectionIsChecked(key);
    checkbox.addEventListener('change',()=>{
      data.sectionVisibility[key]=checkbox.checked?'shown':'hidden';
      data.hiddenSections=sectionKeys.filter(k=>data.sectionVisibility[k]==='hidden');
      changed();
    });
    label.append(checkbox,document.createTextNode(sectionLabels[key]));
    if(!hasSectionContent(key)){
      const empty=document.createElement('span');empty.className='section-empty';empty.textContent='Empty';
      line.append(empty);
    }
    const controls=document.createElement('div');controls.className='order-actions';
    for(const [symbol,delta] of [['↑',-1],['↓',1]]){
      const button=document.createElement('button');button.type='button';button.textContent=symbol;
      button.title=delta<0?'Move up':'Move down';
      button.disabled=index+delta<0||index+delta>=data.sectionOrder.length;
      button.onclick=()=>{
        const other=index+delta;
        [data.sectionOrder[index],data.sectionOrder[other]]=[data.sectionOrder[other],data.sectionOrder[index]];
        changed();
      };
      controls.append(button);
    }
    line.prepend(label);line.append(controls);root.append(line);
  });
}
function renderResume(){const r=document.getElementById('resume');r.className='resume-paper '+(data.fontSize==='compact'||data.fontSize==='spacious'?data.fontSize:'');r.style.setProperty('--resume-accent',/^#[0-9a-f]{6}$/i.test(data.accent)?data.accent:'#1d4ed8');const contact=[data.email,data.phone,data.location,data.website].filter(x=>String(x??'').trim()).map(escapeHTML).join(' &nbsp;·&nbsp; ');const list=(key,fn)=>data[key].filter(x=>Object.values(x).some(v=>String(v??'').trim())).map(fn).join('');const content={summary:data.summary?`<p>${escapeHTML(data.summary)}</p>`:'',experience:list('experience',x=>entry(x.role,x.company,x.dates,x.description)),education:list('education',x=>entry(x.degree,x.school,x.dates,x.description)),skills:data.skills?`<p>${escapeHTML(data.skills)}</p>`:'',projects:list('projects',x=>entry(x.name,x.link,'',x.description)),certifications:list('certifications',x=>entry(x.name,x.issuer,x.dates,x.credential)),languages:list('languages',x=>entry(x.name,x.level,'','')),awards:list('awards',x=>entry(x.name,x.issuer,x.dates,x.description)),volunteer:list('volunteer',x=>entry(x.role,x.organization,x.dates,x.description)),references:list('references',x=>entry(x.name,x.role,'',x.contact))};const custom=list('customSections',x=>section(escapeHTML(x.title||'Additional Information'),x.content?`<p>${escapeHTML(x.content)}</p>`:''));r.innerHTML=`<header class="r-header"><div class="r-name">${escapeHTML(data.fullName||'Your Name')}</div>${data.jobTitle?`<div class="r-title">${escapeHTML(data.jobTitle)}</div>`:''}${contact?`<div class="r-contact">${contact}</div>`:''}</header>`+data.sectionOrder.filter(k=>sectionIsChecked(k)).map(k=>k==='customSections'?custom:section(sectionLabels[k],content[k])).join('');scalePreview();}
function scalePreview(){const wrap=document.querySelector('.paper-wrap'),paper=document.getElementById('resume');if(!wrap||!paper)return;paper.style.transform='';paper.style.marginBottom='';const available=wrap.clientWidth-20;const natural=paper.offsetWidth;if(available<natural){const scale=Math.max(.25,available/natural);paper.style.transform=`scale(${scale})`;paper.style.marginBottom=`-${paper.offsetHeight*(1-scale)}px`;wrap.style.justifyContent='flex-start';}else wrap.style.justifyContent='center';}
let saveTimer;function changed(){renderManager();renderResume();const status=document.getElementById('saveStatus');status.textContent='Saving…';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));status.textContent='Saved locally';}catch{status.textContent='Could not save locally';}},250);}
function populate(){document.querySelectorAll('[data-field]').forEach(el=>{el.value=data[el.dataset.field]??'';});normalize();renderFields();renderManager();renderResume();}
document.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('input',()=>{data[el.dataset.field]=el.value;changed();}));
document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.add;data[type].push(Object.fromEntries(schemas[type].map(([key])=>[key,''])));renderFields();changed();}));
document.getElementById('resetBtn').addEventListener('click',()=>{if(!confirm('Start over? This will erase your locally saved resume.'))return;data=fresh();populate();changed();});
document.getElementById('downloadBtn').addEventListener('click',()=>{clearTimeout(saveTimer);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}window.print();});
window.addEventListener('resize',scalePreview);window.addEventListener('beforeprint',()=>{const p=document.getElementById('resume');p.style.transform='none';p.style.marginBottom='0';});window.addEventListener('afterprint',scalePreview);
populate();

// Public bridge for the optional Firebase module. Guest mode works without Firebase.
window.ResumeMuna={
  getData:()=>JSON.parse(JSON.stringify(data)),
  blankData:()=>({...fresh(),fullName:'',jobTitle:'',email:'',phone:'',location:'',website:'',summary:'',skills:'',experience:[],education:[],projects:[],certifications:[],languages:[],awards:[],volunteer:[],references:[],customSections:[]}),
  setData:(next)=>{if(!next||typeof next!=='object'||Array.isArray(next))throw new Error('Invalid resume data');data={...fresh(),...next};for(const k of ['experience','education','projects','certifications','languages','awards','volunteer','references','customSections'])if(!Array.isArray(data[k]))data[k]=[];populate();changed();}
};
