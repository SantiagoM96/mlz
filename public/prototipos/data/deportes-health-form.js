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
 function render(prefix=''){
  const fieldId=(g,suffix)=>prefix+'health_'+g.id+'_'+suffix;
  return '<fieldset class="health-topics" data-health-root><legend>Seleccioná las situaciones que correspondan a tu caso.</legend><p class="health-hint">Podés seleccionar más de una opción.</p>'+
  groups.map(g=>{
   const panelId=fieldId(g,'panel'),otherId=fieldId(g,'other'),detailId=fieldId(g,'detail'),topicId=fieldId(g,'topic'),descId=fieldId(g,'desc');
   const opts=g.options.map((value,i)=>'<label class="health-option"><input type="checkbox" name="health_'+g.id+'_options" id="'+fieldId(g,'opt_'+i)+'" value="'+escape(value)+'"> <span>'+escape(value)+'</span></label>').join('');
   return '<div class="health-topic"><label class="health-topic-label" for="'+topicId+'"><input type="checkbox" id="'+topicId+'" name="healthTopics" value="'+g.id+'" aria-describedby="'+descId+'" aria-controls="'+panelId+'"><span><strong>'+escape(g.title)+'</strong><span class="health-hint" id="'+descId+'">'+escape(g.desc)+'</span></span></label>'+
   '<div class="health-disclosure" data-health-show="'+g.id+'" id="'+panelId+'" hidden><fieldset class="health-options"><legend>Seleccioná las opciones que correspondan</legend><div class="health-option-list">'+opts+'<label class="health-option"><input type="checkbox" name="health_'+g.id+'_options" value="other" aria-controls="'+otherId+'-wrap"><span>'+escape(g.other)+'</span></label></div></fieldset>'+
   '<div class="field health-other" data-health-other="'+g.id+'" id="'+otherId+'-wrap" hidden><label for="'+otherId+'">'+escape(g.other)+'</label><input id="'+otherId+'" name="health_'+g.id+'_other" placeholder="Especificar"></div>'+
   '<div class="field health-details"><label for="'+detailId+'">Detalles y cuidados adicionales</label><p class="health-hint" id="'+detailId+'-hint">'+escape(g.detail)+'</p><textarea id="'+detailId+'" name="health_'+g.id+'_detail" aria-describedby="'+detailId+'-hint '+detailId+'-example" placeholder="Ingresar detalle (opcional)" rows="3"></textarea><p class="health-hint health-example" id="'+detailId+'-example">'+escape(g.example)+'</p></div></div></div>';
  }).join('')+
  '<label class="health-topic-label health-none"><input type="checkbox" name="healthNone" value="none"><span>Ninguna de las anteriores</span></label></fieldset>';
 }
 function bind(form){
  const root=form.querySelector('[data-health-root]');if(!root)return;
  const topics=[...root.querySelectorAll('[name="healthTopics"]')],none=root.querySelector('[name="healthNone"]');
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
  root.addEventListener('change',event=>{
   if(event.target===none&&none.checked)topics.forEach(t=>{t.checked=false;});
   else if(topics.includes(event.target)&&event.target.checked)none.checked=false;
   sync();
  });
  sync();
 }
 return {groups,render,bind};
})();
