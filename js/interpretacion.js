// Interpretación orientativa por escala a partir de la puntuación T.
// Solo se usa para el informe en PDF; no modifica la calificación.
//
// Semáforo de escalas sustantivas (regla práctica de visualización, no punto de corte oficial universal):
//   verde: T menor de 55 · amarillo: T de 55 a 64 · rojo: T de 65 o más.
// Escalas de validez: criterios propios (VALIDEZ_CFG, editables abajo).
// Escalas de intereses: el color solo indica grado de preferencia (bajo / intermedio / alto).

export const CORTE_AMARILLO = 55;
export const CORTE_ROJO = 65;

// amarillo = T desde el cual conviene revisar · rojo = T desde el cual se alcanza el criterio de alerta/invalidez
// invalida (opcional) = punto de invalidez cuando es distinto del rojo.
export const VALIDEZ_CFG = {
  'INVAR-r': { amarillo: 70, rojo: 80 },
  'INVER-r': { amarillo: 70, rojo: 80 },
  'F-r':     { amarillo: 80, rojo: 100, invalida: 120 },
  'Fpsi-r':  { amarillo: 70, rojo: 100 },
  'Fs':      { amarillo: 80, rojo: 100 },
  'FVS-r':   { amarillo: 80, rojo: 100 },
  'SI':      { amarillo: 80, rojo: 100 },   // PENDIENTE: confirmar a qué escala oficial corresponde "SI"
  'L-r':     { amarillo: 65, rojo: 80 },
  'K-r':     { amarillo: 65, rojo: 70 },
};

// [verde, amarillo, rojo]
const VALIDEZ = {
  'INVAR-r': [
    'El puntaje está dentro del rango aceptable de acuerdo con el criterio específico de la escala. No se observa evidencia relevante de inconsistencia variable.',
    'El resultado se aproxima al criterio de alerta. Conviene revisar comprensión de reactivos, omisiones y consistencia general.',
    'El resultado alcanza el criterio de invalidez configurado. El protocolo debe revisarse y podría no ser interpretable.'],
  'INVER-r': [
    'El patrón de respuestas no alcanza el criterio de alerta de esta escala.',
    'El patrón requiere revisión por posible tendencia a responder de forma fija.',
    'Se alcanza el criterio específico de invalidez. No se deben emitir conclusiones clínicas automáticas sin revisar el protocolo.'],
  'F-r': [
    'No se observa una elevación relevante de respuestas infrecuentes según el criterio de la escala.',
    'Existe un aumento que debe contrastarse con el malestar reportado y el resto de los indicadores de validez.',
    'La elevación alcanza el criterio de alerta establecido. Puede reflejar malestar intenso o un patrón de respuestas inusual; no demuestra por sí sola exageración.'],
  'Fpsi-r': [
    'No destaca un patrón elevado de respuestas infrecuentes de este tipo.',
    'El resultado requiere revisar las experiencias reportadas y los demás indicadores de validez.',
    'Se alcanza el criterio específico de alerta. El perfil necesita revisión profesional; no equivale automáticamente a un trastorno psicótico.'],
  'Fs': [
    'No se observa una elevación relevante de quejas somáticas infrecuentes.',
    'Se recomienda explorar las molestias físicas, antecedentes y contexto médico.',
    'El resultado alcanza el criterio de alerta de la escala. Se requiere corroborar las quejas; no debe concluirse automáticamente que son falsas.'],
  'FVS-r': [
    'No destaca un patrón de respuestas somáticas o cognitivas inusual según el criterio aplicable.',
    'Conviene revisar la consistencia de las quejas y contrastarlas con otras fuentes.',
    'Se alcanza el criterio específico de alerta. El resultado requiere revisión; no demuestra por sí solo simulación o engaño.'],
  'SI': [
    'No alcanza el criterio de alerta asignado a esta escala.',
    'Requiere revisar el patrón de respuesta y su correspondencia con el resto del protocolo.',
    'Alcanza el criterio de alerta configurado. El protocolo necesita revisión antes de interpretar resultados.'],
  'L-r': [
    'No destaca una presentación excepcionalmente virtuosa.',
    'Puede existir una tendencia a describirse favorablemente; conviene comparar con otras escalas.',
    'El resultado alcanza el criterio de elevación de esta escala y puede sugerir presentación excesivamente favorable o minimización de defectos comunes. No demuestra mentira.'],
  'K-r': [
    'No destaca una presentación especialmente favorable según el criterio de esta escala.',
    'Conviene valorar si la persona está minimizando dificultades o describiendo su ajuste de manera especialmente favorable.',
    'El resultado alcanza el criterio de elevación establecido. Puede sugerir reserva o minimización de dificultades; debe interpretarse con el perfil completo.'],
};

const SUSTANTIVAS = {
  // Globales
  'AE/PI': [
    'Las respuestas no muestran una elevación destacada de malestar emocional internalizado.',
    'Se observa una posible tendencia a experimentar malestar emocional; conviene revisar las escalas específicas de ansiedad, estrés y desánimo.',
    'Se observa una elevación relevante de dificultades emocionales internalizadas. Se recomienda explorar intensidad, duración e interferencia en la vida diaria.'],
  'AP': [
    'No se observa una elevación destacada en las experiencias de pensamiento evaluadas.',
    'Algunas respuestas pueden sugerir experiencias inusuales; deben explorarse en entrevista.',
    'La elevación indica mayor presencia de experiencias o preocupaciones relacionadas con el pensamiento y la percepción. No establece por sí sola un diagnóstico.'],
  'AC/PE': [
    'No destaca una elevación de dificultades externalizadas.',
    'Puede existir una tendencia a problemas de conducta o control de impulsos que conviene contextualizar.',
    'La elevación sugiere mayor presencia de dificultades conductuales o externalizadas; se recomienda explorar frecuencia, consecuencias y contexto.'],
  // Clínicas reestructuradas
  'CRd': [
    'No destaca un nivel elevado de desmoralización o insatisfacción general.',
    'Puede existir desánimo o sensación de estar sobrepasado en algunas situaciones.',
    'Se observa una elevación de desmoralización, insatisfacción y sensación de dificultad para afrontar los problemas.'],
  'CR1': [
    'No destaca una elevación de quejas físicas generales.',
    'Existen algunas quejas físicas que conviene explorar en su contexto médico y emocional.',
    'Se reportan más quejas somáticas de lo esperado; es importante considerar tanto causas médicas como psicológicas.'],
  'CR2': [
    'No se observa una elevación de dificultades relacionadas con la disminución de emociones positivas.',
    'Puede haber menor disfrute o entusiasmo en algunas áreas de la vida.',
    'El resultado sugiere una reducción importante de emociones positivas, entusiasmo o capacidad de disfrute.'],
  'CR3': [
    'No destaca una tendencia elevada a interpretar negativamente las intenciones ajenas.',
    'Puede existir cierta desconfianza o visión cínica en las relaciones.',
    'Se observa una tendencia elevada a desconfiar de las motivaciones de otras personas o a interpretar sus intenciones de manera negativa.'],
  'CR4': [
    'No destaca una elevación de conductas contrarias a las normas.',
    'Pueden existir algunas dificultades de conducta o conflictos con normas y responsabilidades.',
    'Se observa una elevación de conductas contrarias a las normas o dificultades relacionadas con la responsabilidad. No demuestra criminalidad.'],
  'CR6': [
    'No destaca una elevación de suspicacia o ideas de persecución.',
    'Pueden existir preocupaciones o desconfianza hacia otras personas que requieren exploración contextual.',
    'Se observa mayor presencia de suspicacia o percepción de posibles amenazas por parte de otros. Se debe explorar sin asumir que la percepción es falsa ni concluir automáticamente un trastorno.'],
  'CR7': [
    'No destaca una elevación de emociones negativas disfuncionales.',
    'Puede existir preocupación, irritabilidad o malestar emocional que conviene explorar.',
    'Se observa mayor presencia de emociones negativas difíciles de manejar, como preocupación o irritabilidad.'],
  'CR8': [
    'No destaca una elevación de experiencias perceptivas o cognitivas inusuales.',
    'Algunas respuestas sugieren experiencias inusuales que conviene explorar en entrevista.',
    'Se observa mayor reporte de experiencias perceptivas o pensamientos inusuales. No equivale por sí solo a un diagnóstico psicótico.'],
  'CR9': [
    'No destaca una elevación de activación, energía o impulsividad.',
    'Puede existir mayor energía, actividad o impulsividad en determinadas situaciones.',
    'Se observa una elevación de activación, energía o impulsividad. Conviene explorar cambios en el sueño, estado de ánimo, juicio y conducta.'],
  // Somáticas / cognitivas
  'MAL': [
    'No destaca una elevación de malestar físico general.',
    'Se reportan algunas molestias físicas que conviene explorar.',
    'Se reporta mayor malestar físico general. Se deben considerar antecedentes médicos y factores emocionales.'],
  'QGI': [
    'No destaca una elevación de molestias gastrointestinales.',
    'Se reportan algunas molestias gastrointestinales; conviene revisar frecuencia y contexto.',
    'Se reportan molestias gastrointestinales elevadas. Deben considerarse posibles causas médicas, alimentación, medicamentos y estrés.'],
  'QDC': [
    'No destaca una elevación de dolores de cabeza reportados.',
    'Se reportan algunas molestias de cabeza que conviene contextualizar.',
    'Se reporta una presencia elevada de dolores de cabeza. La interpretación psicológica no sustituye una valoración médica.'],
  'QNEU': [
    'No destaca una elevación de molestias neurológicas reportadas.',
    'Se reportan algunas molestias que conviene explorar y contrastar con antecedentes médicos.',
    'Se reporta una elevación de molestias de tipo neurológico. No debe inferirse una enfermedad ni un origen psicológico sin evaluación.'],
  'QCO': [
    'No destaca una elevación de dificultades cognitivas subjetivas.',
    'La persona reporta algunas dificultades de atención, memoria o concentración.',
    'Se reportan dificultades cognitivas subjetivas elevadas. Conviene explorar su repercusión, contexto emocional y posibles causas médicas. No equivale a una medición objetiva de la capacidad cognitiva.'],
  // Internalización
  'ISU': [
    'No se observa una elevación en las respuestas relacionadas con ideación suicida o deseos de muerte. Esto no descarta riesgo por otras fuentes.',
    'Existen respuestas que requieren explorar directamente pensamientos de muerte, desesperanza y seguridad actual.',
    'Se observa una elevación relevante de ideación suicida o deseos de muerte. Se requiere evaluación directa del riesgo de inmediato, sin esperar a terminar el informe ni sustituir la intervención profesional.'],
  'Im/D': [
    'No destaca una elevación de sentimientos de indefensión o desesperanza.',
    'Puede existir una percepción de dificultad para cambiar las circunstancias o mejorar la situación.',
    'Se observa una mayor presencia de sentimientos de indefensión, desesperanza o dificultad para imaginar cambios positivos.'],
  'DSM': [
    'No destaca una elevación de dudas personales o inseguridad.',
    'Pueden aparecer dudas sobre las propias decisiones, capacidades o valor personal.',
    'Se observa una elevación de inseguridad y cuestionamiento de las propias capacidades.'],
  'INE': [
    'No destaca una percepción elevada de ineficacia personal.',
    'Pueden existir dudas sobre la capacidad para resolver problemas o cumplir responsabilidades.',
    'Se observa una percepción elevada de ineficacia o dificultad para afrontar tareas y responsabilidades.'],
  'P/E': [
    'No destaca una elevación de estrés o preocupación.',
    'Se reporta cierta preocupación o tensión que conviene contextualizar.',
    'Se observa una elevación de estrés, preocupación o sensación de tensión persistente.'],
  'ANS': [
    'No destaca una elevación de síntomas ansiosos en las respuestas.',
    'Se reportan algunas experiencias de ansiedad que conviene explorar.',
    'Se observa una elevación de ansiedad reportada. Deben explorarse síntomas, duración e interferencia funcional.'],
  'TEN': [
    'No destaca una tendencia elevada al enojo.',
    'Puede existir irritabilidad o dificultad ocasional para manejar el enojo.',
    'Se observa una tendencia elevada a experimentar enojo o irritabilidad.'],
  'LCM': [
    'No destaca una elevación de temores que limiten la conducta.',
    'Algunos temores pueden llevar a evitar actividades o situaciones.',
    'Se observa una mayor probabilidad de que los temores restrinjan actividades o comportamientos cotidianos.'],
  'MEM': [
    'No destaca una elevación de miedos específicos.',
    'Se reportan algunos temores que conviene explorar por su frecuencia e impacto.',
    'Se observa una mayor presencia de miedos específicos. Conviene identificar cuáles son y si interfieren con la vida cotidiana.'],
  // Externalización
  'PCIJ': [
    'No destaca una elevación de problemas de conducta reportados.',
    'Se reportan algunos antecedentes o dificultades de conducta que conviene explorar.',
    'Se observa una elevación de indicadores relacionados con problemas de conducta. Deben revisarse la edad, los antecedentes y el contexto; no constituye un diagnóstico por sí solo.'],
  'ABS': [
    'No destaca una elevación de indicadores relacionados con consumo problemático de sustancias.',
    'Algunas respuestas sugieren posibles dificultades relacionadas con el consumo; conviene explorar sustancia, frecuencia y consecuencias.',
    'Se observa una elevación de indicadores relacionados con problemas de consumo. Se requiere evaluación específica; el puntaje no confirma por sí solo un trastorno por consumo.'],
  'AG': [
    'No destaca una elevación de indicadores de agresión.',
    'Se observan algunas respuestas relacionadas con tendencias agresivas que conviene contextualizar.',
    'Se observa una elevación de indicadores de agresión. Deben explorarse el tipo de conducta, la frecuencia, el control y las consecuencias.'],
  'EUF': [
    'No destaca una elevación de activación o euforia.',
    'Pueden existir señales de mayor energía o activación que conviene contextualizar.',
    'Se observa una elevación de indicadores de activación o euforia. Conviene explorar cambios en sueño, energía, juicio y conducta.'],
  // Interpersonales
  'PFA': [
    'No destaca una elevación de dificultades familiares reportadas.',
    'Se reportan algunas tensiones o insatisfacción en las relaciones familiares.',
    'Se observa una elevación de problemas familiares reportados. Conviene explorar las relaciones, los conflictos y el impacto emocional.'],
  'PIP': [
    'No destaca una elevación de pasividad en las relaciones.',
    'Puede existir dificultad para tomar la iniciativa o expresar necesidades en ciertas situaciones.',
    'Se observa una tendencia elevada a la pasividad interpersonal. Conviene explorar la capacidad para expresar opiniones, establecer límites y tomar decisiones.'],
  'ESO': [
    'No destaca una elevación de evitación social.',
    'Pueden existir algunas conductas de evitación de situaciones sociales.',
    'Se observa una elevación de evitación social reportada. Conviene explorar si se relaciona con ansiedad, preferencias personales u otros factores.'],
  'TIM': [
    'No destaca una elevación de timidez o inhibición social.',
    'Puede existir cierta incomodidad o reserva en situaciones interpersonales.',
    'Se observa una elevación de timidez o inhibición social. Conviene explorar el impacto en relaciones, trabajo y actividades cotidianas.'],
  'DES': [
    'No destaca una elevación de distanciamiento o desinterés por la vinculación interpersonal.',
    'Puede existir una preferencia por mantener distancia o una participación social limitada.',
    'Se observa una elevación de distanciamiento interpersonal o menor interés por la afiliación, según los contenidos evaluados. No debe confundirse automáticamente con un trastorno.'],
  // PSY-5
  'AGGR-r': [
    'No destaca una elevación de agresividad en los contenidos evaluados.',
    'Algunas respuestas sugieren tendencias agresivas o confrontativas que conviene explorar.',
    'Se observa una elevación de agresividad reportada. Debe interpretarse junto con el contexto y las demás escalas.'],
  'PSYC-r': [
    'No destaca una elevación de experiencias inusuales de pensamiento o percepción.',
    'Algunas respuestas sugieren experiencias inusuales que requieren exploración contextual.',
    'Se observa una elevación de experiencias o pensamientos inusuales. No equivale por sí sola a un diagnóstico psicótico.'],
  'DISC-r': [
    'No destaca una elevación de desinhibición o impulsividad.',
    'Pueden existir dificultades ocasionales para frenar impulsos o considerar consecuencias.',
    'Se observa una elevación de desinhibición, impulsividad o dificultad para controlar ciertas conductas.'],
  'NEGE-r': [
    'No destaca una elevación de emocionalidad negativa.',
    'Se observa cierta tendencia a experimentar malestar, preocupación o reactividad emocional.',
    'Se observa una elevación de emocionalidad negativa o reactividad ante situaciones estresantes.'],
  'INTR-r': [
    'No destaca una elevación de introversión o baja emocionalidad positiva.',
    'Puede existir una tendencia a la reserva social o menor expresión de emociones positivas.',
    'Se observa una elevación de introversión o baja emocionalidad positiva. Conviene explorar si representa preferencia personal, malestar o interferencia funcional.'],
};

// Intereses: [bajo, intermedio, alto] (el color no indica gravedad clínica)
const INTERESES = {
  'IEL': [
    'El resultado no muestra una preferencia elevada por actividades estéticas, artísticas o literarias.',
    'Se observa una posible afinidad por actividades estéticas, artísticas o literarias.',
    'Se observa una preferencia elevada por actividades estéticas, artísticas o literarias.'],
  'IFM': [
    'El resultado no muestra una preferencia elevada por actividades mecánicas, prácticas o físicas.',
    'Se observa una posible afinidad por actividades mecánicas, prácticas o físicas.',
    'Se observa una preferencia elevada por actividades mecánicas, prácticas o físicas.'],
};

const nivelSust = t => (t >= CORTE_ROJO ? 2 : t >= CORTE_AMARILLO ? 1 : 0);

// Devuelve { tipo, color, etiqueta, criterio, texto, extra?, alerta?, invalida? } o null si la escala no tiene texto.
export function interpretar(code, t) {
  if (VALIDEZ_CFG[code]) {
    const c = VALIDEZ_CFG[code], i = t >= c.rojo ? 2 : t >= c.amarillo ? 1 : 0;
    const out = {
      tipo: 'validez', color: ['verde', 'amarillo', 'rojo'][i],
      etiqueta: ['Sin alerta', 'Revisar', 'Alerta de validez'][i],
      criterio: `Criterio de validez: revisar desde T ${c.amarillo}; alerta desde T ${c.rojo}` + (c.invalida ? `; invalidez desde T ${c.invalida}` : ''),
      texto: VALIDEZ[code][i],
    };
    if (i === 2) out.alerta = true;
    if (c.invalida && t >= c.invalida) { out.invalida = true; out.extra = 'Se alcanza el punto de invalidez de la escala: el protocolo podría no ser interpretable.'; }
    if (i === 2 && c.rojo === (c.invalida ?? c.rojo)) out.invalida = true;
    return out;
  }
  if (INTERESES[code]) {
    const i = nivelSust(t);
    return {
      tipo: 'intereses', color: ['bajo', 'medio', 'alto'][i], etiqueta: ['Preferencia baja', 'Preferencia intermedia', 'Preferencia alta'][i],
      criterio: 'Interés: el color indica grado de preferencia, no gravedad clínica (T menor de 55 / 55 a 64 / 65 o más)',
      texto: INTERESES[code][i],
    };
  }
  if (SUSTANTIVAS[code]) {
    const i = nivelSust(t);
    const out = {
      tipo: 'sustantiva', color: ['verde', 'amarillo', 'rojo'][i], etiqueta: ['Verde', 'Amarillo', 'Rojo'][i],
      criterio: ['T menor de 55', 'T de 55 a 64', 'T de 65 o más'][i], texto: SUSTANTIVAS[code][i],
    };
    if (code === 'ISU' && i === 2) out.alerta = true;
    return out;
  }
  return null;
}
