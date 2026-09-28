import { X, BookOpen } from "lucide-react";
import { COLORS } from "../lib/colors";

function P({ children }) {
  return <p className="text-sm mb-3" style={{ color: COLORS.ink, lineHeight: 1.55 }}>{children}</p>;
}
function H3({ children }) {
  return <h3 className="text-sm font-bold mt-5 mb-2" style={{ color: COLORS.navyDark }}>{children}</h3>;
}
function B({ children }) {
  return <strong style={{ color: COLORS.navyDark }}>{children}</strong>;
}
function Ul({ children }) {
  return <ul className="text-sm mb-3 pl-5" style={{ color: COLORS.ink, lineHeight: 1.6, listStyle: "disc" }}>{children}</ul>;
}

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-base font-bold mb-2" style={{ color: COLORS.navy, fontFamily: "var(--font-display)" }}>{title}</h2>
      {children}
    </section>
  );
}

export default function HelpGuideModal({ onClose }) {
  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820, maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: COLORS.line }}>
          <div className="flex items-center gap-2">
            <BookOpen size={16} color={COLORS.navy} />
            <h3 className="font-semibold" style={{ color: COLORS.navyDark }}>Cómo usar este dashboard</h3>
          </div>
          <button onClick={onClose}><X size={18} color={COLORS.inkSoft} /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <Section title="Introducción y acceso">
            <P>
              Este dashboard reemplaza la planilla de Excel para calcular y reportar mensualmente la situación de
              financiamiento de remuneraciones del Programa 02 de SLEP Petorca. Vive en cuatro pestañas que se
              recalculan solas: Datos Mensuales, Resumen Ejecutivo, Traspasos entre Cuentas y Bitácora de Movimientos.
            </P>
            <P>
              <B>Acceso.</B> Se entra con el correo institucional: escribes tu correo, llega un enlace de acceso al
              mismo correo, y lo abres en el mismo navegador para ingresar. Solo los correos autorizados pueden
              entrar (los administra Wilson Rojas junto con dos apps hermanas del mismo equipo). Si tu correo no
              está autorizado, el sistema lo indica en pantalla al iniciar sesión.
            </P>
            <P>
              <B>Guardado automático.</B> No existe un botón "Guardar": cada celda que editas se guarda sola apenas
              sales de ella (aparece "Guardando…" y luego "Guardado" en la esquina superior). Todo lo que edites lo
              ven de inmediato los demás usuarios conectados, ya que los datos viven en una base de datos compartida
              (Firestore), no en tu computador.
            </P>
            <P><B>Cerrar sesión</B> está disponible en la esquina superior derecha.</P>
          </Section>

          <Section title="Marco presupuestario: subtítulos 21, 22 y 29">
            <P>
              SLEP Petorca reporta su situación financiera a la <B>Dirección de Educación Pública (DEP)</B>, que
              consolida la de todos los SLEP del país y, a su vez, la informa a la <B>Dirección de Presupuestos
              (DIPRES)</B>, del Ministerio de Hacienda, que supervisa la ejecución del presupuesto público. Para ese
              reporte, el gasto de cada fuente de financiamiento se clasifica según el clasificador presupuestario
              del sector público en <B>subtítulos</B>, y ese es el mismo criterio que organiza los campos de este
              dashboard:
            </P>
            <div className="overflow-x-auto rounded-xl border mb-3" style={{ borderColor: COLORS.line }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: COLORS.mist }}>
                    <th className="th-cell text-left">Subtítulo</th>
                    <th className="th-cell text-left">Qué cubre</th>
                    <th className="th-cell text-left">Dónde aparece en el dashboard</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell font-medium">21 — Gastos en Personal</td>
                    <td className="td-cell">Remuneraciones del personal</td>
                    <td className="td-cell">Columna <B>Remuneraciones Brutas</B> (Datos Mensuales) y <B>Gasto Remuneraciones</B> (Traspasos entre Cuentas)</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell font-medium">22 — Bienes y Servicios de Consumo</td>
                    <td className="td-cell">Insumos, servicios básicos, mantención, etc.</td>
                    <td className="td-cell" rowSpan={2}>Columna <B>Saldo Sub. 22 y 29</B> (Datos Mensuales) y <B>Gasto Subt. 22 y 29</B> (Traspasos entre Cuentas) — agrupadas</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell font-medium">29 — Adquisición de Activos No Financieros</td>
                    <td className="td-cell">Equipamiento, mobiliario, etc.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <P>
              El dashboard agrupa el 22 y el 29 en una sola columna porque, en la práctica, cada fuente de
              financiamiento resguarda un solo saldo conjunto para ambos, separado del saldo que se destina a
              remuneraciones (subt. 21).
            </P>
            <P>
              <B>Por qué importa esta separación por fuente.</B> Cada fuente de financiamiento (Subvención General,
              PIE, SEP, JUNJI, Aporte Fiscal Educación, Aporte Fiscal Jardines, FAEP, Mantenimiento, Prorretención)
              tiene reglas propias de cuánto de su ingreso debe resguardarse para 22/29 antes de poder usarse en
              remuneraciones. El <B>% Resguardo</B> de Datos Mensuales muestra esa proporción resguardada por fuente.
              El <B>Déficit/Superávit</B> que calcula el dashboard es, en el fondo, la comparación entre lo que queda
              disponible para remuneraciones (subt. 21) después de apartar el 22/29, y el gasto real en
              remuneraciones — ese es el número que en definitiva se informa como la necesidad (o el excedente) de
              financiamiento del Programa 02 hacia DEP/DIPRES.
            </P>
          </Section>

          <Section title="1. Datos Mensuales">
            <P>
              Registra, mes a mes, los ingresos y remuneraciones de cada fuente de financiamiento: Subvención
              General, PIE, SEP, JUNJI, Aporte Fiscal Educación, Aporte Fiscal Jardines, FAEP, Mantenimiento y
              Prorretención.
            </P>
            <P>
              <B>Selector de mes.</B> La fila de botones arriba de la tabla permite cambiar de mes; cada botón
              muestra el Déficit/Superávit de ese mes y una etiqueta "PROY" si el mes está marcado como Proyectado.
            </P>
            <H3>Columnas de la tabla</H3>
            <Ul>
              <li><B>Ingresos Totales</B> — editable, con un ícono de lista al lado para desglosar el monto por fecha y concepto.</li>
              <li><B>Saldo Sub. 22 y 29</B> — editable en la mayoría de las fuentes; en SEP se calcula solo a partir del Saldo para Remuneraciones.</li>
              <li><B>Saldo p/ Remuneraciones (A)</B> — calculado, salvo en SEP donde es editable directamente.</li>
              <li><B>Remuneraciones Brutas (B)</B> — editable, también con desglose por fecha/concepto.</li>
              <li><B>Déficit/Superávit (A−B)</B> — calculado; verde si es superávit, rojo si es déficit.</li>
              <li><B>% Resguardo</B> — calculado (Saldo Sub. 22/29 sobre Ingresos Totales).</li>
              <li><B>Observaciones</B> — texto libre para dejar contexto.</li>
            </Ul>
            <P>
              <B>Desglosar un monto.</B> Al hacer clic en el ícono de lista junto a Ingresos o Remuneraciones se abre
              un detalle donde se agregan líneas (fecha, concepto, monto); la suma de esas líneas reemplaza
              automáticamente el monto general y queda registrada en la Bitácora.
            </P>
            <P>
              <B>Real vs. Proyectado.</B> Cada mes se marca como "Real" o "Proyectado". En un mes Proyectado aparece
              el botón "Recalcular con promedio de los últimos 3 meses reales", que rellena Ingresos y
              Remuneraciones de todas las fuentes con el promedio de los 3 meses reales anteriores.
            </P>
            <P>
              <B>Ajustes del mes</B> (panel bajo la tabla): Saldo FAEP para REMU, Saldo FIGA y Déficit Líquidos
              (informativo). Junto a esto se muestra el <B>Déficit/Superávit Total (F16)</B> del mes y el <B>Déficit/Superávit
              Acumulado</B>, que es el acumulado del mes anterior más el resultado de este mes (incluyendo los
              ajustes FAEP/FIGA).
            </P>
            <P>
              <B>Detalle FAEP de Enero.</B> Solo en el mes de Enero aparece un panel adicional para la rendición de
              la 2ª parte del FAEP a JUNJI (Total FAEP, Cuota Educación, Cuota Jardines, Abril a Educación, FAEP a
              General, Poder rendir real vs. calculado), con una fila que marca en rojo si hay diferencia entre el
              poder rendir calculado y el real.
            </P>
          </Section>

          <Section title="2. Resumen Ejecutivo">
            <P>
              Es una vista de solo lectura: no se edita nada aquí, todo se recalcula automáticamente a partir de lo
              cargado en Datos Mensuales.
            </P>
            <P>
              <B>Selector "Ver hasta".</B> Elige el mes de corte (por ejemplo, Agosto) y todo el resto de la pestaña
              — KPIs, gráfico, tabla y matrices — se recalcula solo hasta ese mes, ideal para informar un acumulado
              a una fecha específica.
            </P>
            <H3>Qué muestra</H3>
            <Ul>
              <li>4 tarjetas KPI: Ingresos totales del período, Remuneraciones brutas, Déficit/Superávit del período y Acumulado a corte (con el número de meses en déficit).</li>
              <li>Un gráfico de área con la evolución del acumulado mes a mes.</li>
              <li>Una tabla mensual (Mes, Estado Real/Proyectado, Ingresos, Saldo Sub. 22/29, Saldo Remuneraciones, Remuneraciones, Déficit/Superávit, Acumulado) con totales del período.</li>
              <li>Tres matrices (Ingresos, Gastos en remuneraciones, Déficit/Superávit), cada una desglosada por fuente y por mes, con totales por fila y columna.</li>
            </Ul>
          </Section>

          <Section title="3. Traspasos entre Cuentas (Estructura Déficit)">
            <P>
              Es <B>independiente de Datos Mensuales</B>: aquí se ingresan los saldos vigentes de cada subvención al
              momento de calcular un traspaso entre cuentas corrientes, no los datos del mes completo.
            </P>
            <P>
              <B>Período de análisis.</B> Un campo de texto libre (ej. "Agosto 2026") que identifica a qué período
              corresponde el análisis vigente.
            </P>
            <P>
              <B>Tabla principal por subvención.</B> Para Subvención General, SEP y PIE se registra Ingresos, Gasto
              Remuneraciones y Gasto Subt. 22 y 29; el sistema calcula Total Gastos y Diferencia (Ingresos − Total
              Gastos). Debajo de cada una aparece:
            </P>
            <Ul>
              <li><B>Carrera Docente</B> — fila propia con su propio Ingreso y Gasto, que se suma al total de esa subvención.</li>
              <li><B>JUNJI</B> — con sus 3 subcuentas (Operación, Convenio CD, Homologación) y un Total JUNJI.</li>
              <li><B>Aporte Fiscal Educación</B> y <B>Aporte Fiscal Jardines</B> — al final, como dos subvenciones separadas (antes eran una sola "Aporte Fiscal"; se dividieron porque sus gastos se destinan a fines distintos).</li>
            </Ul>
            <P>
              <B>Casilla "En total".</B> Marca qué subvenciones se suman en la fila <B>Total Final</B>. Por defecto
              SEP queda sin marcar, porque su déficit/superávit se autocontiene dentro de la propia subvención;
              ajusta las casillas si tu criterio cambia.
            </P>
            <P>
              <B>Carrera Docente — reparto del ingreso.</B> El ingreso de Carrera Docente llega como un solo monto
              total (campo "Ingreso total Carrera Docente del mes"); el panel lo reparte automáticamente entre
              General, SEP y PIE en la misma proporción en que cada una gastó en remuneraciones de Carrera Docente
              ese mes.
            </P>
            <P>
              <B>Registro de traspasos entre cuentas (REX).</B> Cada fila es un movimiento real: fecha, Proceso/Motivo,
              Cuenta Origen (Desde) y Cuenta Destino (Hacia) —elegidas de un desplegable con el N° de cuenta y
              nombre real del banco—, Monto (con signo manual: negativo si el movimiento ya redujo lo que falta
              pedir, positivo si lo aumentó) y N° REX (la resolución exenta que respalda el traspaso). Al final se
              muestra el <B>Subtotal traspasos registrados (REX)</B>, la suma de esa columna Monto.
            </P>
            <P>
              <B>Reporte exclusivo de REX.</B> Los botones <B>Excel REX</B> y <B>PDF REX</B>, junto a "Agregar
              traspaso", generan un reporte que contiene <em>solo</em> esa tabla de traspasos y su subtotal —
              independiente del reporte completo de la pestaña (que solo incluye el cuadro resumen y el detalle por
              subvención, sin la tabla REX).
            </P>
          </Section>

          <Section title="4. Bitácora de Movimientos">
            <P>
              Se llena sola: cada vez que cambias un monto en Datos Mensuales o en Traspasos entre Cuentas queda
              registrado aquí, con fecha/hora, sección, mes o período, concepto, campo, valor anterior y valor
              nuevo. No hay que agregar nada manualmente.
            </P>
            <H3>Por fila puedes</H3>
            <Ul>
              <li>Marcar el checkbox para <B>incluir</B> ese cambio en el próximo reporte a jefatura.</li>
              <li>Escribir una <B>nota para jefatura</B> (motivo del cambio, opcional).</li>
              <li>Eliminar la fila con el ícono de papelera si fue un registro de prueba o erróneo.</li>
            </Ul>
            <P>
              <B>Reportar a jefatura.</B> Al usar el botón "Reporte" se genera un correo con los cambios marcados
              como incluidos; dentro de ese mismo cuadro aparece el botón <B>"Marcar como reportado"</B>, que atenúa
              (deja en gris) las filas ya reportadas para no reportarlas dos veces. El botón "Reporte" muestra un
              contador con la cantidad de cambios pendientes de reportar.
            </P>
          </Section>

          <Section title="5. Exportar y reportar (todas las pestañas)">
            <P>Las 4 pestañas tienen los mismos 3 botones arriba a la derecha:</P>
            <div className="overflow-x-auto rounded-xl border mb-3" style={{ borderColor: COLORS.line }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: COLORS.mist }}>
                    <th className="th-cell text-left" style={{ width: 110 }}>Botón</th>
                    <th className="th-cell text-left">Qué genera</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell font-medium">Excel</td>
                    <td className="td-cell">Descarga un .xlsx con formato de tabla (bordes, encabezados de color, totales en negrita, montos en formato moneda) con todo el contenido de esa pestaña.</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell font-medium">PDF</td>
                    <td className="td-cell">Abre el diálogo de impresión del navegador con una vista lista para guardar como PDF, con el mismo contenido que el Excel.</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: COLORS.line }}>
                    <td className="td-cell font-medium">Reporte</td>
                    <td className="td-cell">Abre un texto de correo (asunto + cuerpo) ya redactado, listo para copiar y pegar, dirigido a Paulina Sáez Kifafi y Javier Ilabaca Barraza.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <P>
              Además, en Traspasos entre Cuentas existen <B>Excel REX</B> y <B>PDF REX</B>, que generan un reporte
              aparte solo con la tabla de traspasos (ver sección 3).
            </P>
            <P>
              <B>Nombre del archivo.</B> Tanto el PDF como el Excel se descargan con un nombre que incluye la fecha
              y hora exactas de la descarga, por ejemplo <code>20260827 1430 - Situacion deficit - Financiamiento
              P02</code>, para que dos descargas del mismo día no se sobreescriban entre sí.
            </P>
          </Section>

          <Section title="6. Notas y preguntas frecuentes">
            <P>
              <B>¿Por qué no hay botón Guardar?</B> Cada campo se guarda solo, al instante, apenas sales de él. No
              hay un estado "sin guardar": si ves "Guardado" en la esquina superior, tu cambio ya quedó en la base
              de datos compartida.
            </P>
            <P>
              <B>Si aparece "No se pudieron cargar los datos" o queda pegado en "Cargando datos…"</B>: recarga la
              página con Ctrl+Shift+R (recarga forzada). Si el mensaje de error persiste, anótalo tal cual aparece
              en pantalla y avísale a Wilson Rojas — casi siempre es un tema de permisos o de conexión, no de los
              datos que cargaste.
            </P>
            <P>
              <B>Administración de accesos.</B> La lista de correos autorizados es compartida con otras dos
              aplicaciones del equipo (Calendariopermisos y Monitoreo Ingresos y Gastos SEP 2026), ya que las tres
              viven en el mismo proyecto de base de datos. Agregar o quitar un correo requiere actualizar esa lista
              compartida, no solo esta app.
            </P>
          </Section>
        </div>
      </div>
    </div>
  );
}
