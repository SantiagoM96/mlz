/* Generación estática de fichas públicas a partir de Excel original. */
(async function generateTramitesData(){
 const {writeFile,mkdir,copyFile}=await import('node:fs/promises');
 const {join}=await import('node:path');
 const sheetId='1r_p5-XWGlX9lmj6grB9UDbV37T2slVpA';
 const gid='299257227';
 const urls=[
  'https://docs.google.com/spreadsheets/d/'+sheetId+'/gviz/tq?tqx=out%3Acsv&gid='+gid,
  'https://docs.google.com/spreadsheets/d/'+sheetId+'/export?format=csv&gid='+gid
 ];
 function parseCsv(text){
  const out=[];let row=[],part='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
   const c=text[i];
   if(c==='"'){if(quoted&&text[i+1]==='"'){part+='"';i++;}else quoted=!quoted;}
   else if(c===','&&!quoted){row.push(part);part='';}
   else if((c==='\n'||c==='\r')&&!quoted){
    if(c==='\r'&&text[i+1]==='\n')i++;
    row.push(part);part='';if(row.some(x=>x.trim()))out.push(row);row=[];
   }else part+=c;
  }
  if(quoted)throw Error('CSV con comillas abiertas');
  row.push(part);if(row.some(x=>x.trim()))out.push(row);
  return out;
 }
 const mappingText=`
certificado-deuda-escribania:36
exencion-tasas-jubilados:16,14
cambio-titular-datos-inmueble:39,31
problemas-con-un-pago:38,44,45,47
clave-cit-arba:24
baja-unidad-comercio-vivienda:34
alumbrado-publico-factura-edesur:42
exencion-tsg-veteranos-guerra:15
eximicion-tsg-instituciones:17,5
licencia-de-conducir:117
solicitudes-de-transito:123,121,122,132,133
baja-patente-cambio-radicacion:20,21
baja-patente-robo-destruccion:29,30,33
alta-patente:18,19
cambio-titular-patente-vehiculo:22
reclamo-de-transito:124,127
exencion-patente-discapacidad:23
denuncia-venta-vehiculo:32
tasa-seguridad-higiene-ddjj-deuda:27
licencia-bebidas-alcoholicas-reba:83
habilitacion-de-comercio:81
cierre-de-comercio:82
modificacion-habilitacion-comercio:84,86,100,101,103
permiso-ferias-francas:109
habilitacion-provisoria-regulacion-comercial:85
habilitacion-comercio-discapacidad:110
permiso-uso-de-vereda:88
habilitacion-vehiculo-transporte-alimentos:111
permiso-puesto-de-flores:112
certificado-aptitud-ambiental:113
ddjj-publicidad-ocupacion:25
autorizacion-piletas-natatorios:107
denuncia-construccion-entre-vecinos:106
copia-autenticada-de-plano:92
certificado-catastral:93
conexion-electrica-edesur:95,96
aprobacion-planos-permiso-obra:87,37
consulta-numero-de-plano-o-expediente:46
actualizacion-catastral-mensura:41
dictamen-de-patrimonio:105
visado-de-plano-de-mensura:89
registro-municipal-de-profesionales:91,97
habilitacion-ascensores:99
visado-planos-electromecanicos:102
registro-conservadoras-de-ascensores:108
autorizacion-arbol-vereda:65,66,63
semillas-para-huerta:79
poda-gratuita-jubilados-discapacidad:62
despeje-luminico:64
reclamo-desague-pluvial:69,75
programas-de-reciclado:56,57,58,59,60
reclamo-arreglo-plaza:71
denuncia-de-microbasural:77
corte-pasto-jubilados-discapacidad:73
plantacion-arbol:67
voluntariado-reserva-santa-catalina:61
turnos-de-salud:52
castracion-de-mascotas:54
libreta-sanitaria:53
medicamentos-protesis-y-estudios:51
certificado-unico-discapacidad:9
centro-atencion-terapeutica-tea:11
vacante-taller-protegido-centro-dia:12
registro-electrodependientes:13
modulo-alimentario:68
asistencia-violencia-de-genero:55
espacio-de-abordaje-de-masculinidades:90
asistencia-a-victimas:50
cursos-de-oficios-mujeres-y-diversidades:80
educacion-ambiental-escuelas:70,72
inscripcion-a-cursos-y-talleres:78,74
artista-o-sonido-para-instituciones:104
inscripcion-cursos-emajea:74
talleres-centros-culturales:94
escuelas-municipales-de-cultura:98
asistencia-habitacional:76
escrituracion-por-prescripcion:119,120
bien-de-familia:125
escrituracion-social:126
dni:114
pasaporte:115
regularizacion-migratoria:118
mi-identidad-mi-derecho:116
renovacion-arrendamiento-sepultura:6
inhumacion-cementerio:8
traslado-restos-cremacion:7
reconocimiento-municipal-entidades:3
registro-municipal-culto:10
asesoramiento-personeria-juridica:4
denuncia-defensa-del-consumidor:2
inscripcion-registro-proveedores:1
`;
 const mapping=Object.fromEntries(mappingText.trim().split('\n').map(line=>{
  const [id,indices]=line.trim().split(':');
  return [id,indices.split(',').map(Number)];
 }));
 if(Object.keys(mapping).length!==91)throw Error('Mapa: se requieren 91 fichas');
 const personalEmail=/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi;
 const personalPhone=/(?:\+?54[\s-]?)?(?:11|0?800)[\s-]?\d(?:[\s-]?\d){7,12}/g;
 const cleaned=value=>String(value||'').replace(personalEmail,'[correo del área]').replace(personalPhone,'[teléfono del área]').replace(/[\t\r\n ]+/g,' ').trim();
 const url=value=>{try{const u=new URL(String(value).trim());return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}};
 function publicFields(r) {
  const f=i=>cleaned(r[i]);
  return {
   sourceName:f(9),summary:f(10),type:f(11),audience:f(12),eligibility:f(14),
   modality:f(15),place:f(16),hours:f(17),portal:url(r[19])||url(r[65]),
   channels:f(31),costDetail:f(38),payment:f(39),exemptions:f(42),
   requirements:f(43),documentation:f(44),documentFormat:f(45),
   leadTime:f(52),process:f(55),regulations:f(61),regulationLink:url(r[62]),
   surveyDate:f(0).split(' ')[0]
  };
 }
 let records;
 const failures=[];
 for(const source of urls){
  try{
   const res=await fetch(source,{signal:AbortSignal.timeout(20000)});
   if(!res.ok)throw Error('HTTP '+res.status);
   const txt=await res.text();
   if(/^\s*</.test(txt.slice(0,250)))throw Error('Página de acceso, no CSV');
   records=parseCsv(txt).filter(r=>/^\d{1,2}\/\d{1,2}\/2026\s/.test(r[0]||''));
   if(records.length!==133||records.some(r=>r.length!==66))throw Error('Filas/columnas no coinciden: '+records.length);
   if(!/Solicitud de Inscripcion de Proveedores/i.test(records[0][9])||!/Solicitud corte de Transito/i.test(records.at(-1)[9]))throw Error('Cambió el orden de filas');
   break;
  }catch(error){failures.push(error.message);records=undefined;}
 }
 if(!records)throw Error('No se pudo obtener la planilla: '+failures.join(' | '));
 const fichas=Object.fromEntries(Object.entries(mapping).map(([id,rows])=>[id,{
  forms:rows.map(n=>publicFields(records[n-1])),
  sourceRowNumbers:rows
 }]));
 for(const [id,record] of Object.entries(fichas)){
  if(record.forms.some(form=>!form.sourceName||!form.summary))throw Error('Datos faltantes en '+id);
 }
 const target=join(process.cwd(),'public','prototipos','guia-de-tramites');
 await mkdir(join(target,'data'),{recursive:true});
 await writeFile(join(target,'data','fichas.js'),
  '/* Excel de trámites: campos públicos seleccionados, sin contactos internos. */\nwindow.GUIA_TRAMITES_FICHAS = '+JSON.stringify(fichas)+';\n');
 const fontDir=join(target,'fonts');
 await mkdir(fontDir,{recursive:true});
 for(const filename of ['Geometria-Regular.woff2','Geometria-Bold.woff2','Geometria-Medium.ttf']){
  await copyFile(join(process.cwd(),'src','assets','fonts',filename),join(fontDir,filename));
 }
 console.log('Guía de trámites: '+Object.keys(fichas).length+' fichas, '+new Set(Object.values(mapping).flat()).size+' registros del Excel incorporados. Datos internos excluidos.');
})();
