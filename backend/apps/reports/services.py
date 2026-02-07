"""
Servicios para generacion de reportes
"""
import os
from io import BytesIO
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER
from apps.attendance.models import DailySession, Attendance
from apps.students.models import Student

# Rutas de imagenes para reportes
STATIC_DIR = os.path.join(settings.BASE_DIR, 'static', 'images')
LOGO_PATH = os.path.join(STATIC_DIR, 'logo.png')
ESCUDO_PATH = os.path.join(STATIC_DIR, 'escudo.png')


def get_attendance_data(date, grade=None, status=None):
    """Obtiene los datos de asistencia para una fecha con estadísticas calculadas"""
    session = DailySession.objects.filter(date=date).first()
    empty_stats = {'total': 0, 'present': 0, 'late': 0, 'absent': 0, 'percentage': 0}
    if not session:
        return None, [], empty_stats

    attendances = Attendance.objects.filter(session=session).select_related('student')

    if grade:
        attendances = attendances.filter(student__grade=grade)

    if status:
        attendances = attendances.filter(status=status)

    data = []
    # Contadores para estadísticas reales
    stats = {
        'total': 0,
        'present': 0,
        'late': 0,
        'absent': 0
    }

    for att in attendances.order_by('student__grade', 'student__section', 'student__paternal_surname'):
        # Convertir timestamp UTC a hora local de Perú
        hora_local = '-'
        if att.scan_timestamp:
            local_time = timezone.localtime(att.scan_timestamp)
            hora_local = local_time.strftime('%H:%M:%S')

        data.append({
            'dni': att.student.dni,
            'nombre': att.student.full_name,
            'grado': att.student.grade,
            'seccion': att.student.section,
            'estado': att.get_status_display(),
            'estado_key': att.status,  # Clave para conteo
            'hora': hora_local,
        })

        # Contar estadísticas reales
        stats['total'] += 1
        if att.status == 'present':
            stats['present'] += 1
        elif att.status == 'late':
            stats['late'] += 1
        elif att.status == 'absent':
            stats['absent'] += 1

    # Calcular porcentaje de asistencia (presentes + tardanzas = asistieron)
    if stats['total'] > 0:
        attended = stats['present'] + stats['late']
        stats['percentage'] = round((attended / stats['total']) * 100, 1)
    else:
        stats['percentage'] = 0

    return session, data, stats


def generate_excel_report(date, grade=None, status=None):
    """Genera reporte en formato Excel"""
    session, data, stats = get_attendance_data(date, grade, status)

    wb = Workbook()
    ws = wb.active
    ws.title = "Asistencia"

    # Estilos
    header_font = Font(bold=True, color="FFFFFF", size=11)
    header_fill = PatternFill(start_color="1e40af", end_color="1e40af", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center")
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )

    # Titulo
    institution = settings.INSTITUTION_CONFIG.get('NAME', 'IES Tupac Amaru')
    ws.merge_cells('A1:F1')
    ws['A1'] = institution
    ws['A1'].font = Font(bold=True, size=14)
    ws['A1'].alignment = Alignment(horizontal="center")

    ws.merge_cells('A2:F2')
    status_names = {'present': 'PRESENTES', 'late': 'TARDANZAS', 'absent': 'FALTAS'}
    title = f"REPORTE DE ASISTENCIA - {date.strftime('%d/%m/%Y')}"
    if status:
        title = f"REPORTE DE {status_names.get(status, status.upper())} - {date.strftime('%d/%m/%Y')}"
    if grade:
        title += f" - {grade} Secundaria"
    ws['A2'] = title
    ws['A2'].font = Font(bold=True, size=12)
    ws['A2'].alignment = Alignment(horizontal="center")

    # Estadisticas (calculadas desde los datos reales)
    if stats['total'] > 0:
        ws['A4'] = f"Total: {stats['total']}"
        ws['B4'] = f"Presentes: {stats['present']}"
        ws['C4'] = f"Tardanzas: {stats['late']}"
        ws['D4'] = f"Faltas: {stats['absent']}"
        ws['E4'] = f"Asistencia: {stats['percentage']}%"

    # Headers de la tabla
    headers = ['DNI', 'Nombre Completo', 'Grado', 'Seccion', 'Estado', 'Hora']
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=6, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = thin_border

    # Datos
    status_fills = {
        'Presente': PatternFill(start_color="dcfce7", end_color="dcfce7", fill_type="solid"),
        'Tardanza': PatternFill(start_color="fef3c7", end_color="fef3c7", fill_type="solid"),
        'Falta': PatternFill(start_color="fee2e2", end_color="fee2e2", fill_type="solid"),
    }

    for row_num, record in enumerate(data, 7):
        ws.cell(row=row_num, column=1, value=record['dni']).border = thin_border
        ws.cell(row=row_num, column=2, value=record['nombre']).border = thin_border
        ws.cell(row=row_num, column=3, value=record['grado']).border = thin_border
        ws.cell(row=row_num, column=4, value=record['seccion']).border = thin_border

        status_cell = ws.cell(row=row_num, column=5, value=record['estado'])
        status_cell.border = thin_border
        status_cell.fill = status_fills.get(record['estado'], PatternFill())

        ws.cell(row=row_num, column=6, value=record['hora']).border = thin_border

    # Ajustar anchos de columna
    ws.column_dimensions['A'].width = 12
    ws.column_dimensions['B'].width = 35
    ws.column_dimensions['C'].width = 10
    ws.column_dimensions['D'].width = 10
    ws.column_dimensions['E'].width = 12
    ws.column_dimensions['F'].width = 12

    # Guardar en buffer
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return buffer


def generate_pdf_report(date, grade=None, status=None):
    """Genera reporte en formato PDF profesional con header y footer institucional fijos"""
    session, data, stats = get_attendance_data(date, grade, status)

    buffer = BytesIO()
    page_width, page_height = A4

    # Configurar documento con margenes para header y footer fijos
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=5.5*cm,  # Espacio reservado para header fijo
        bottomMargin=2*cm,  # Espacio para footer
        leftMargin=1.5*cm,
        rightMargin=1.5*cm
    )

    elements = []
    styles = getSampleStyleSheet()

    # ============ ESTADISTICAS (calculadas desde datos reales) ============
    if stats['total'] > 0:
        stats_data = [[
            f"Total\n{stats['total']}",
            f"Presentes\n{stats['present']}",
            f"Tardanzas\n{stats['late']}",
            f"Faltas\n{stats['absent']}",
            f"Asistencia\n{stats['percentage']}%"
        ]]
        stats_table = Table(stats_data, colWidths=[3*cm, 3*cm, 3*cm, 3*cm, 3*cm])
        stats_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#e0e7ff')),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#dcfce7')),
            ('BACKGROUND', (2, 0), (2, 0), colors.HexColor('#fef3c7')),
            ('BACKGROUND', (3, 0), (3, 0), colors.HexColor('#fee2e2')),
            ('BACKGROUND', (4, 0), (4, 0), colors.HexColor('#dbeafe')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.grey),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 15))

    # ============ FILTROS APLICADOS ============
    status_names = {'present': 'PRESENTES', 'late': 'TARDANZAS', 'absent': 'FALTAS'}
    filters_text = ""
    if grade:
        filters_text += f"Grado: {grade}° Secundaria"
    if status:
        if filters_text:
            filters_text += " | "
        filters_text += f"Estado: {status_names.get(status, status.upper())}"

    if filters_text:
        filter_style = ParagraphStyle(
            'FilterStyle',
            parent=styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#666666'),
            spaceAfter=10
        )
        elements.append(Paragraph(f"Filtros: {filters_text}", filter_style))
        elements.append(Spacer(1, 10))

    # ============ TABLA DE DATOS ============
    table_data = [['N°', 'DNI', 'Nombre Completo', 'Grado', 'Sec.', 'Estado', 'Hora']]
    for idx, record in enumerate(data, 1):
        table_data.append([
            str(idx),
            record['dni'],
            record['nombre'][:35],
            record['grado'],
            record['seccion'],
            record['estado'],
            record['hora']
        ])

    if len(table_data) > 1:
        table = Table(
            table_data,
            colWidths=[1*cm, 2*cm, 6*cm, 1.5*cm, 1.2*cm, 2*cm, 1.8*cm],
            repeatRows=1  # Repetir header de tabla en cada pagina
        )

        # Estilos de la tabla
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (2, 1), (2, -1), 'LEFT'),  # Nombre alineado a la izquierda
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ])

        # Colores por estado
        for i, record in enumerate(data, 1):
            if record['estado'] == 'Presente':
                style.add('BACKGROUND', (5, i), (5, i), colors.HexColor('#dcfce7'))
                style.add('TEXTCOLOR', (5, i), (5, i), colors.HexColor('#166534'))
            elif record['estado'] == 'Tardanza':
                style.add('BACKGROUND', (5, i), (5, i), colors.HexColor('#fef3c7'))
                style.add('TEXTCOLOR', (5, i), (5, i), colors.HexColor('#92400e'))
            elif record['estado'] == 'Falta':
                style.add('BACKGROUND', (5, i), (5, i), colors.HexColor('#fee2e2'))
                style.add('TEXTCOLOR', (5, i), (5, i), colors.HexColor('#991b1b'))

        table.setStyle(style)
        elements.append(table)
    else:
        no_data_style = ParagraphStyle(
            'NoData',
            parent=styles['Normal'],
            fontSize=11,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#666666'),
            spaceBefore=30
        )
        elements.append(Paragraph("No hay registros de asistencia para esta fecha.", no_data_style))

    # ============ FUNCION PARA HEADER Y FOOTER FIJOS ============
    def add_header_footer(canvas, doc):
        """Dibuja header y footer fijos en cada pagina"""
        canvas.saveState()

        # ========== HEADER FIJO ==========
        img_size = 1.8*cm
        header_top = page_height - 1*cm  # Posicion superior del header

        # Logo izquierdo
        if os.path.exists(LOGO_PATH):
            canvas.drawImage(
                LOGO_PATH,
                1.5*cm,
                header_top - img_size,
                width=img_size,
                height=img_size,
                preserveAspectRatio=True,
                mask='auto'
            )

        # Escudo derecho
        if os.path.exists(ESCUDO_PATH):
            canvas.drawImage(
                ESCUDO_PATH,
                page_width - 1.5*cm - img_size,
                header_top - img_size,
                width=img_size,
                height=img_size,
                preserveAspectRatio=True,
                mask='auto'
            )

        # Textos centrales del header
        center_x = page_width / 2

        # Titulo institucion
        canvas.setFont('Helvetica-Bold', 11)
        canvas.setFillColor(colors.HexColor('#1e3a5f'))
        canvas.drawCentredString(center_x, header_top - 0.5*cm, "INSTITUCIÓN EDUCATIVA SECUNDARIA")
        canvas.drawCentredString(center_x, header_top - 1*cm, "TÚPAC AMARU")

        # Subtitulo
        canvas.setFont('Helvetica-Bold', 10)
        canvas.setFillColor(colors.black)
        canvas.drawCentredString(center_x, header_top - 1.7*cm, "REGISTRO DE ASISTENCIA")

        # Fecha
        canvas.setFont('Helvetica', 10)
        canvas.drawCentredString(center_x, header_top - 2.2*cm, f"FECHA: {date.strftime('%d / %m / %Y')}")

        # Linea separadora del header
        canvas.setStrokeColor(colors.HexColor('#1e40af'))
        canvas.setLineWidth(1.5)
        canvas.line(1.5*cm, header_top - 2.8*cm, page_width - 1.5*cm, header_top - 2.8*cm)

        # ========== FOOTER FIJO ==========
        # Linea del footer
        canvas.setStrokeColor(colors.HexColor('#1e40af'))
        canvas.setLineWidth(1)
        canvas.line(1.5*cm, 1.5*cm, page_width - 1.5*cm, 1.5*cm)

        # Texto del footer
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#666666'))

        # Izquierda: "Hecho en Django + React"
        canvas.drawString(1.5*cm, 1*cm, "Hecho en Django + React")

        # Centro: Fecha de generacion
        gen_text = f"Generado: {timezone.localtime(timezone.now()).strftime('%d/%m/%Y %H:%M')}"
        canvas.drawCentredString(page_width / 2, 1*cm, gen_text)

        # Derecha: Numero de pagina
        page_num = f"Página {doc.page}"
        canvas.drawRightString(page_width - 1.5*cm, 1*cm, page_num)

        canvas.restoreState()

    doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    buffer.seek(0)

    return buffer
