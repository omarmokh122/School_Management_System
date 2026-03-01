import csv
import io
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import dependencies
from app.db.session import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse

router = APIRouter()

# ── Column name map: Arabic header → schema field ─────────────────────────
COL_MAP = {
    "الاسم الأول":   "first_name",
    "first_name":    "first_name",
    "الاسم الأخير":  "last_name",
    "last_name":     "last_name",
    "الصف الدراسي": "grade",
    "grade":         "grade",
    "الشعبة":        "section",
    "section":       "section",
    "البريد الإلكتروني": "email",
    "email":         "email",
    "رقم الهاتف":    "phone",
    "phone":         "phone",
    "تاريخ الميلاد": "date_of_birth",
    "date_of_birth": "date_of_birth",
    "تاريخ التسجيل": "enrollment_date",
    "enrollment_date": "enrollment_date",
}


def _parse_date(val: str) -> Optional[date]:
    if not val or not val.strip():
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            from datetime import datetime
            return datetime.strptime(val.strip(), fmt).date()
        except ValueError:
            continue
    return None


def _parse_csv(data: bytes) -> List[dict]:
    text = data.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for row in reader:
        normalized = {}
        for raw_key, val in row.items():
            mapped = COL_MAP.get(raw_key.strip()) or COL_MAP.get(raw_key.strip().lower())
            if mapped:
                normalized[mapped] = val.strip() if val else ""
        if normalized.get("first_name") or normalized.get("last_name"):
            rows.append(normalized)
    return rows


def _parse_xlsx(data: bytes) -> List[dict]:
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    headers_raw = [str(c).strip() if c is not None else "" for c in next(rows_iter, [])]
    headers = [COL_MAP.get(h) or COL_MAP.get(h.lower()) for h in headers_raw]
    rows = []
    for row in rows_iter:
        mapped = {}
        for i, val in enumerate(row):
            col = headers[i] if i < len(headers) else None
            if col:
                mapped[col] = str(val).strip() if val is not None else ""
        if mapped.get("first_name") or mapped.get("last_name"):
            rows.append(mapped)
    wb.close()
    return rows


@router.post("/bulk-import")
async def bulk_import_students(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
):
    """
    Bulk-import students from a CSV or Excel (.xlsx) file.
    Returns a summary: inserted / skipped / errors per row.
    """
    try:
        tenant_uuid = UUID(school_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid school ID")

    data = await file.read()
    fname = (file.filename or "").lower()

    if fname.endswith(".csv"):
        rows = _parse_csv(data)
    elif fname.endswith((".xlsx", ".xls")):
        rows = _parse_xlsx(data)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Upload a CSV or Excel (.xlsx) file.")

    if not rows:
        raise HTTPException(status_code=422, detail="No valid rows found. Check that the column headers match the template.")

    inserted, skipped, errors = 0, 0, []

    for i, row in enumerate(rows, start=2):  # start=2 because row 1 = header
        first = row.get("first_name", "").strip()
        last  = row.get("last_name", "").strip()
        if not first or not last:
            errors.append({"row": i, "reason": "الاسم الأول أو الأخير مفقود", "data": row})
            skipped += 1
            continue
        try:
            student = Student(
                school_id=tenant_uuid,
                first_name=first,
                last_name=last,
                grade=row.get("grade") or None,
                section=row.get("section") or None,
                email=row.get("email") or None,
                phone=row.get("phone") or None,
                date_of_birth=_parse_date(row.get("date_of_birth", "")),
                enrollment_date=_parse_date(row.get("enrollment_date", "")) or date.today(),
            )
            db.add(student)
            inserted += 1
        except Exception as e:
            errors.append({"row": i, "reason": str(e), "data": row})
            skipped += 1

    await db.commit()
    return {
        "total": len(rows),
        "inserted": inserted,
        "skipped": skipped,
        "errors": errors[:20],   # cap error list at 20 for readability
    }


@router.get("/bulk-import/template")
async def download_template():
    """Return a ready-to-fill CSV template for bulk student import."""
    headers = [
        "الاسم الأول", "الاسم الأخير", "الصف الدراسي", "الشعبة",
        "البريد الإلكتروني", "رقم الهاتف", "تاريخ الميلاد", "تاريخ التسجيل"
    ]
    sample = [
        "محمد", "أحمد", "الأول الابتدائي", "أ",
        "student@school.com", "0501234567", "2015-03-15", "2025-09-01"
    ]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerow(sample)
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="students_template.csv"'}
    )
