/* Declaración de salud compartida por los dos prototipos. No persiste datos. */
const MLZHealthForm = (() => {
 const groups = [
  {
    "id": "health",
    "title": "Condiciones de salud",
    "desc": "Enfermedades o condiciones de salud que puedan influir en tu participación deportiva.",
    "options": [
      "Asma",
      "Hipertensión",
      "Diabetes",
      "Epilepsia",
      "Trastornos cardíacos",
      "Trastornos osteoarticulares",
      "Sobrepeso",
      "Hernias",
      "Hepatitis",
      "Diálisis"
    ],
    "other": "Otra condición",
    "detail": "Indicá si debemos tener algún cuidado particular.",
    "example": "Ej.: el asma se desencadena con el esfuerzo intenso."
  },
  {
    "id": "allergy",
    "title": "Alergias e intolerancias",
    "desc": "Alergias o intolerancias a medicamentos, alimentos, materiales u otras sustancias con las que podrías entrar en contacto.",
    "options": [
      "Medicamentos (penicilina, dipirona, ibuprofeno, etc.)",
      "Polvo y ácaros",
      "Polen",
      "Alimentos",
      "Picaduras de insectos",
      "Látex"
    ],
    "other": "Otra alergia o intolerancia",
    "detail": "Especificá qué sustancia te afecta y qué debemos tener en cuenta.",
    "example": "Ej.: alergia a la penicilina; evitar medicamentos que la contengan."
  },
  {
    "id": "surgery",
    "title": "Intervenciones quirúrgicas y lesiones",
    "desc": "Operaciones o lesiones anteriores que todavía requieran cuidados o adaptaciones durante la actividad.",
    "options": [
      "Rodilla, meniscos o ligamentos",
      "Columna",
      "Cadera",
      "Fracturas",
      "Intervenciones abdominales (vesícula, apéndice, cesárea, etc.)",
      "Intervenciones cardíacas"
    ],
    "other": "Otra intervención o lesión",
    "detail": "Indicá qué intervención o lesión tuviste y qué cuidados necesitás actualmente.",
    "example": "Ej.: operación de meniscos; necesito evitar saltos."
  },
  {
    "id": "medication",
    "title": "Medicación",
    "desc": "Medicamentos que el responsable de la actividad debería conocer para facilitar tu participación o actuar ante una emergencia.",
    "options": [
      "Medicación para la diabetes",
      "Medicación para la presión arterial",
      "Medicación respiratoria o inhaladores",
      "Medicación para afecciones cardíacas",
      "Anticoagulantes"
    ],
    "other": "Otra medicación relevante",
    "detail": "Indicá el nombre del medicamento y los cuidados que debemos conocer.",
    "example": "Ej.: llevo conmigo mi inhalador de rescate."
  },
  {
    "id": "restrictions",
    "title": "Indicaciones y cuidados médicos",
    "desc": "Recomendaciones o restricciones médicas que debamos respetar durante la actividad.",
    "options": [
      "Evitar ejercicios de alto impacto",
      "Evitar esfuerzos intensos",
      "Evitar levantar peso",
      "Adaptar determinados movimientos",
      "Realizar pausas adicionales"
    ],
    "other": "Otra indicación",
    "detail": "Detallá las indicaciones de tu profesional de salud.",
    "example": "Ej.: evitar saltos por indicación médica."
  },
  {
    "id": "support",
    "title": "Apoyos y adaptaciones",
    "desc": "Necesidades de asistencia o adaptaciones del espacio para facilitar tu participación.",
    "options": [
      "Asistencia para desplazarme",
      "Acceso sin escaleras",
      "Adaptación de ejercicios",
      "Apoyo para la comunicación",
      "Asistencia durante la actividad"
    ],
    "other": "Otro apoyo o adaptación",
    "detail": "Contanos qué necesitás para participar de la actividad.",
    "example": "Ej.: necesito acceder al espacio sin utilizar escaleras."
  }
];
 const escape = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));

 function symbol(name){return '<span class="mlz-selection-glyph" aria-hidden="true">'+name+'</span>'}
 function choice(type,name,value,label,attrs=''){
  const radio=type==='radio';
  return '<label class="mlz-selection"><input type="'+type+'" name="'+escape(name)+'" value="'+escape(value)+'" '+attrs+'><span class="mlz-selection-symbol" aria-hidden="true">'+symbol(radio?'radio_button_unchecked':'check_box_outline_blank')+symbol(radio?'radio_button_checked':'check_box')+'</span><span class="mlz-selection-label">'+escape(label)+'</span></label>';
 }
 function attachment(label,id,max,name=id,documentKey=''){
  return '<div class="mlz-attachment" data-mlz-attachment'+(documentKey?' data-en-document="'+escape(documentKey)+'" hidden':'')+'><label class="mlz-attachment-title" for="'+escape(id)+'">'+escape(label)+'</label><div class="mlz-attachment-control" data-phase="empty"><span class="mlz-attachment-icon mlz-selection-glyph" aria-hidden="true">attach_file</span><span class="mlz-attachment-action">Seleccionar archivo</span><button class="mlz-attachment-change" type="button" hidden>Cambiar</button><span class="mlz-attachment-value" title="Seleccioná un documento">Seleccioná un documento</span><div class="mlz-attachment-progress" role="progressbar" aria-label="Progreso de demostración" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden><span></span></div><button class="mlz-attachment-remove" type="button" aria-label="Quitar archivo" hidden><span class="mlz-selection-glyph" aria-hidden="true">close</span></button><input type="file" id="'+escape(id)+'" name="'+escape(name)+'" accept=".pdf,.jpg,.jpeg,.png" data-max="'+max+'" aria-label="'+escape(label)+'" aria-describedby="'+escape(id)+'-help"></div><small class="mlz-attachment-help" id="'+escape(id)+'-help">PDF, JPG o PNG de hasta '+max+' MB</small><p class="mlz-attachment-error" id="'+escape(id)+'-error" role="alert" hidden></p><span class="mlz-attachment-status" role="status"></span></div>';
 }
 const attachmentStates=new WeakMap();
 function bindAttachments(form){
  for(const root of form.querySelectorAll('[data-mlz-attachment]')){
   const input=root.querySelector('input[type=file]'),control=root.querySelector('.mlz-attachment-control'),action=root.querySelector('.mlz-attachment-action'),change=root.querySelector('.mlz-attachment-change'),value=root.querySelector('.mlz-attachment-value'),progress=root.querySelector('.mlz-attachment-progress'),remove=root.querySelector('.mlz-attachment-remove'),glyph=root.querySelector('.mlz-attachment-icon'),error=root.querySelector('.mlz-attachment-error'),status=root.querySelector('.mlz-attachment-status');
   let filename='',frame=0,timer=0,generation=0;
   const cancel=()=>{generation++;cancelAnimationFrame(frame);clearTimeout(timer);};
   function paint(next,message=''){
    control.dataset.phase=next;
    const selecting=next==='empty'||next==='error',loading=next==='uploading',processing=next==='processing',completed=next==='completed';
    action.hidden=!selecting;change.hidden=selecting;remove.hidden=!(completed||next==='error');
    input.classList.toggle('is-hidden-file',!selecting);input.tabIndex=selecting?0:-1;
    progress.hidden=!loading;value.hidden=loading;
    glyph.textContent=loading||processing?'sync':'attach_file';
    glyph.classList.toggle('is-spinning',loading||processing);
    value.textContent=processing?'Procesando…':completed?filename:'Seleccioná un documento';
    value.title=completed?filename:'Seleccioná un documento';
    remove.setAttribute('aria-label',completed?'Quitar '+filename:'Limpiar error del archivo');
    error.hidden=next!=='error';error.textContent=message;
    input.setAttribute('aria-invalid',String(next==='error'));
    input.setAttribute('aria-describedby',input.id+'-help'+(next==='error'?' '+input.id+'-error':''));
    status.textContent=loading?'Subiendo archivo (simulación)':processing?'Procesando archivo (simulación)':completed?'Archivo seleccionado (simulación): '+filename:'';
   }
   function reset(){cancel();filename='';input.value='';input.setCustomValidity('');paint('empty');}
   input.addEventListener('change',()=>{
    const file=input.files?.[0];if(!file)return;
    cancel();filename='';input.setCustomValidity('');
    const max=Number(input.dataset.max),extension=file.name.split('.').pop()?.toLowerCase()||'';
    const message=file.size>max*1024*1024?'El archivo supera los '+max+' MB. Seleccioná uno más pequeño.':!['pdf','jpg','jpeg','png'].includes(extension)?'Formato no compatible. Usá PDF, JPG o PNG.':'';
    if(message){input.value='';input.setCustomValidity(message);paint('error',message);return;}
    filename=file.name;progress.firstElementChild.style.width='0%';progress.setAttribute('aria-valuenow','0');paint('uploading');
    const token=generation;let start;
    function tick(now){
     if(token!==generation||!root.isConnected)return;
     if(start===undefined)start=now;
     const ratio=Math.min(1,(now-start)/2400);progress.firstElementChild.style.width=(ratio*100)+'%';progress.setAttribute('aria-valuenow',String(Math.floor(ratio*100)));
     if(ratio<1)frame=requestAnimationFrame(tick);
     else{paint('processing');timer=setTimeout(()=>{if(token===generation&&root.isConnected)paint('completed');},650);}
    }
    frame=requestAnimationFrame(tick);
   });
   change.addEventListener('click',()=>input.click());
   remove.addEventListener('click',()=>{reset();input.focus();});
   attachmentStates.set(input,{reset});paint('empty');
  }
 }
 function setAttachmentVisible(input,visible,required=false){
  const root=input.closest('[data-mlz-attachment]');root.hidden=!visible;
  input.disabled=!visible;input.required=visible&&required;
  if(!visible)attachmentStates.get(input)?.reset();
 }
 function render(prefix=''){
  const fieldId=(g,suffix)=>prefix+'health_'+g.id+'_'+suffix;
  return '<aside class="mlz-health-alert" aria-labelledby="'+prefix+'health-alert-title"><span class="mlz-health-alert-icon" aria-hidden="true">error</span><div class="mlz-health-alert-body"><strong id="'+prefix+'health-alert-title">Cuidemos tu salud</strong><p>Sos responsable de la información que declarás. Te pedimos que sea verdadera y esté actualizada para que podamos brindarte los cuidados que necesitás.</p></div></aside><fieldset class="health-topics" data-health-root><legend>Seleccioná las situaciones que correspondan a tu caso.</legend><p class="health-hint">Podés seleccionar más de una opción.</p>'+
  groups.map(g=>{
   const panelId=fieldId(g,'panel'),otherId=fieldId(g,'other'),detailId=fieldId(g,'detail'),topicId=fieldId(g,'topic'),descId=fieldId(g,'desc');
   const opts=g.options.map((value,i)=>choice('checkbox','health_'+g.id+'_options',value,value,'id="'+fieldId(g,'opt_'+i)+'"')).join('');
   return '<div class="health-topic"><label class="health-topic-label health-switch-row" for="'+topicId+'"><span><strong id="'+topicId+'-title">'+escape(g.title)+'</strong><span class="health-hint" id="'+descId+'">'+escape(g.desc)+'</span></span><input type="checkbox" role="switch" id="'+topicId+'" name="healthTopics" value="'+g.id+'" aria-labelledby="'+topicId+'-title" aria-describedby="'+descId+'" aria-controls="'+panelId+'"></label>'+
   '<div class="health-disclosure" data-health-show="'+g.id+'" id="'+panelId+'" hidden><fieldset class="health-options"><legend>Seleccioná las opciones que correspondan</legend><div class="health-option-list">'+opts+choice('checkbox','health_'+g.id+'_options','other',g.other,'aria-controls="'+otherId+'-wrap"')+'</div></fieldset>'+
   '<div class="field health-other" data-health-other="'+g.id+'" id="'+otherId+'-wrap" hidden><label for="'+otherId+'">'+escape(g.other)+'</label><input id="'+otherId+'" name="health_'+g.id+'_other" placeholder="Especificar"></div>'+
   '<div class="field health-details"><label for="'+detailId+'">Detalles y cuidados adicionales</label><p class="health-hint" id="'+detailId+'-hint">'+escape(g.detail)+'</p><textarea id="'+detailId+'" name="health_'+g.id+'_detail" aria-describedby="'+detailId+'-hint '+detailId+'-example" placeholder="Ingresar detalle (opcional)" rows="3"></textarea><p class="health-hint health-example" id="'+detailId+'-example">'+escape(g.example)+'</p></div></div></div>';
  }).join('')+'</fieldset>';
 }
 function bind(form){
  const root=form.querySelector('[data-health-root]');if(!root)return;
  const topics=[...root.querySelectorAll('[name="healthTopics"]')];
  const clear=el=>{if(el.type==='checkbox')el.checked=false;else el.value='';};
  function sync(){
   for(const topic of topics){
    const key=topic.value,panel=root.querySelector('[data-health-show="'+key+'"]'),other=root.querySelector('[data-health-other="'+key+'"]');
    const active=topic.checked;
    panel.hidden=!active;
    const otherCheck=panel.querySelector('input[value="other"]');
    if(!active)panel.querySelectorAll('input,textarea').forEach(clear);
    const showOther=active&&otherCheck.checked;other.hidden=!showOther;
    panel.querySelectorAll('input,textarea').forEach(el=>{
     el.disabled=!active||(other.contains(el)&&!showOther);
     if(el.disabled)clear(el);
    });
   }
  }
  root.addEventListener('change',sync);
  sync();
 }

 // La modalidad se configura en la actividad, no en cada comisión.
 function sportTypes(activity,commission){
  const allowed=['Recreativo','Competitivo','Federado'];
  const source=String(activity?.tipo||commission?.tipo||'');
  const types=allowed.filter(type=>new RegExp('(?:^|[^a-z])'+type+'(?:$|[^a-z])','i').test(source));
  return types.length?types:['Recreativo'];
 }
 function syncSportTypes(select,activity,commission){
  if(!select||!activity)return false;
  const types=sportTypes(activity,commission),previous=select.value;
  const old=Array.from(select.options).map(o=>o.value).filter(Boolean);
  const disabled=types.length===1;
  if(old.join('|')===types.join('|')&&select.disabled===disabled&&types.includes(previous))return false;
  select.replaceChildren(new Option('Seleccionar',''),...types.map(type=>new Option(type,type)));
  select.value=types.includes(previous)?previous:types[0];
  select.disabled=disabled;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  return true;
 }
 return {groups,render,bind,choice,attachment,bindAttachments,setAttachmentVisible,sportTypes,syncSportTypes};
})();
