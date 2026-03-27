'use client'

import React, { useState } from 'react'
import type { YearPoint } from '@/app/[locale]/clients/[id]/cycles/page'

// ── Vietnamese interpretations for Personal Year numbers ──────────────────────
const CYCLE_INTERP: Record<string, { title: string; body: string }> = {
  '1': {
    title: 'Năm Khởi Đầu Mới',
    body: 'Đây là năm của những khởi đầu mạnh mẽ. Hãy gieo hạt giống cho những gì bạn muốn gặt hái trong 9 năm tới. Sự độc lập, quyết đoán và can đảm là chìa khóa.',
  },
  '2': {
    title: 'Năm Hợp Tác & Kiên Nhẫn',
    body: 'Một năm chậm rãi hơn, tập trung vào các mối quan hệ và sự hợp tác. Hãy kiên nhẫn, lắng nghe và xây dựng cầu nối với người xung quanh.',
  },
  '3': {
    title: 'Năm Sáng Tạo & Biểu Đạt',
    body: 'Năng lượng của sự vui vẻ và sáng tạo nở rộ. Hãy để bản thân biểu đạt, giao tiếp và tận hưởng cuộc sống. Tránh phân tán năng lượng quá rộng.',
  },
  '4': {
    title: 'Năm Xây Dựng Nền Tảng',
    body: 'Đây là năm làm việc chăm chỉ và đặt nền móng vững chắc. Tập trung, kỷ luật và thực tế sẽ đưa bạn đến kết quả bền vững.',
  },
  '5': {
    title: 'Năm Thay Đổi & Tự Do',
    body: 'Sự thay đổi và phiêu lưu đến dồn dập. Hãy linh hoạt, đón nhận cơ hội mới và không sợ bước ra khỏi vùng an toàn.',
  },
  '6': {
    title: 'Năm Trách Nhiệm & Gia Đình',
    body: 'Trọng tâm là gia đình, sức khỏe và trách nhiệm cộng đồng. Đây là thời điểm tuyệt vời để chăm sóc bản thân và những người thân yêu.',
  },
  '7': {
    title: 'Năm Tâm Linh & Nội Tâm',
    body: 'Một năm hướng nội và tìm kiếm sự thật. Hãy dành thời gian cho việc học hỏi, thiền định và suy nghĩ sâu sắc. Tránh các quyết định kinh doanh lớn.',
  },
  '8': {
    title: 'Năm Thành Tựu & Tài Chính',
    body: 'Năng lượng vật chất và tài chính mạnh mẽ. Đây là năm thu hoạch nếu bạn đã làm việc chăm chỉ. Hãy quản lý tiền bạc và quyền lực một cách khôn ngoan.',
  },
  '9': {
    title: 'Năm Hoàn Thành & Buông Bỏ',
    body: 'Một chu kỳ 9 năm kết thúc. Hãy buông bỏ những gì không còn phục vụ bạn, tha thứ và khép lại. Sự rộng lượng và từ bi sẽ mở ra cánh cửa mới.',
  },
  '11': {
    title: 'Năm Linh Cảm & Giác Ngộ (Số Chủ)',
    body: 'Số 11 mang năng lượng linh cảm cao và sứ mệnh tâm linh. Đây là năm của những khải thị và cảm hứng sâu sắc, nhưng cũng cần giữ vững thực tại.',
  },
  '22': {
    title: 'Năm Xây Dựng Vĩ Đại (Số Chủ)',
    body: 'Số 22 là số của kiến trúc sư vũ trụ. Tiềm năng để tạo ra những điều có giá trị lâu dài là cực kỳ lớn. Hãy tập trung vào tầm nhìn dài hạn.',
  },
}

interface CyclesScreenProps {
  clientName: string
  birthDay: number
  birthMonth: number
  yearPoints: YearPoint[]
  currentPersonalYearDisplay: string
  mbText: string | null
}

// ── Pure SVG dual-line chart ──────────────────────────────────────────────────
function CycleChart({ yearPoints }: { yearPoints: YearPoint[] }) {
  const W = 320
  const H = 140
  const padL = 24
  const padR = 12
  const padT = 12
  const padB = 28

  const chartW = W - padL - padR
  const chartH = H - padT - padB

  // Collect all values to determine Y range (1–9 or up to 11/22)
  const allVals = yearPoints.flatMap(p => [p.personalYear, p.worldYear])
  const maxVal = Math.max(...allVals, 9)
  const minVal = 1

  function xPos(i: number) {
    return padL + (i / (yearPoints.length - 1)) * chartW
  }
  function yPos(v: number) {
    return padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH
  }

  const pyPoints = yearPoints.map((p, i) => `${xPos(i)},${yPos(p.personalYear)}`).join(' ')
  const wyPoints = yearPoints.map((p, i) => `${xPos(i)},${yPos(p.worldYear)}`).join(' ')

  const gold = '#C4922A'
  const purple = '#8B7FD4'
  const gridColor = 'rgba(255,255,255,0.06)'
  const labelColor = 'rgba(255,255,255,0.35)'

  // Y grid lines at 1,3,5,7,9
  const gridLines = [1, 3, 5, 7, 9].filter(v => v <= maxVal)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Grid lines */}
      {gridLines.map(v => (
        <g key={v}>
          <line
            x1={padL} y1={yPos(v)} x2={W - padR} y2={yPos(v)}
            stroke={gridColor} strokeWidth={0.5}
          />
          <text x={padL - 4} y={yPos(v) + 3.5} textAnchor="end"
            fontSize={7} fill={labelColor} fontFamily="monospace"
          >{v}</text>
        </g>
      ))}

      {/* World Year line (purple) */}
      <polyline
        points={wyPoints}
        fill="none"
        stroke={purple}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />

      {/* Personal Year line (gold) */}
      <polyline
        points={pyPoints}
        fill="none"
        stroke={gold}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots */}
      {yearPoints.map((p, i) => {
        const cx = xPos(i)
        const pyCy = yPos(p.personalYear)
        const wyCy = yPos(p.worldYear)
        const r = p.isCurrent ? 5 : 3

        return (
          <g key={i}>
            {/* Glow ring — rendered first so it sits behind dot and label */}
            {p.isCurrent && (
              <circle cx={cx} cy={pyCy} r={r + 2}
                fill="none" stroke={gold} strokeWidth={1} opacity={0.35} />
            )}

            {/* World Year dot */}
            <circle cx={cx} cy={wyCy} r={p.isCurrent ? 4 : 2.5}
              fill={purple} opacity={0.85} />

            {/* Personal Year dot */}
            <circle cx={cx} cy={pyCy} r={r} fill={gold} />

            {/* PY value label */}
            <text
              x={cx} y={pyCy - (r + 4)}
              textAnchor="middle"
              fontSize={8}
              fill={p.isCurrent ? gold : 'rgba(196,146,42,0.7)'}
              fontFamily="Georgia, serif"
              fontWeight={p.isCurrent ? '700' : '400'}
            >{p.personalYearDisplay}</text>

            {/* Year label on X axis */}
            <text
              x={cx} y={H - 4}
              textAnchor="middle"
              fontSize={7}
              fill={p.isCurrent ? 'rgba(255,255,255,0.75)' : labelColor}
              fontFamily="monospace"
            >{p.year}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Calculation steps ─────────────────────────────────────────────────────────
function calcDigitSum(n: number): number[] {
  return String(n).split('').map(Number)
}

function CalculationSteps({
  birthDay,
  birthMonth,
  yearPoints,
}: {
  birthDay: number
  birthMonth: number
  yearPoints: YearPoint[]
}) {
  const currentYear = yearPoints[0].year
  const py = yearPoints[0]

  const dayDigits = calcDigitSum(birthDay)
  const monthDigits = calcDigitSum(birthMonth)
  const yearDigits = calcDigitSum(currentYear)
  const allDigits = [...dayDigits, ...monthDigits, ...yearDigits]
  const sumAll = allDigits.reduce((a, b) => a + b, 0)

  const wyDigits = calcDigitSum(currentYear)
  const wySum = wyDigits.reduce((a, b) => a + b, 0)
  const wySumDigits = calcDigitSum(wySum)
  const wyFinal = wySumDigits.reduce((a, b) => a + b, 0)

  const mono: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.8,
    margin: 0,
    whiteSpace: 'pre-wrap',
  }
  const highlight: React.CSSProperties = { color: '#C4922A', fontWeight: 700 }
  const purpleSpan: React.CSSProperties = { color: '#8B7FD4', fontWeight: 700 }

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 14,
      margin: '0 16px',
    }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-ui)' }}>
        Cách tính
      </p>
      <p style={mono}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{'// Số Năm Cá Nhân ' + currentYear}</span>{'\n'}
        {`Ngày sinh: ${birthDay} → ${dayDigits.join('+')}`}
        {dayDigits.length > 1 ? ` = ${dayDigits.reduce((a,b)=>a+b,0)}` : ''}{'\n'}
        {`Tháng sinh: ${birthMonth} → ${monthDigits.join('+')}`}
        {monthDigits.length > 1 ? ` = ${monthDigits.reduce((a,b)=>a+b,0)}` : ''}{'\n'}
        {`Năm hiện tại: ${currentYear} → ${yearDigits.join('+')}`} = {yearDigits.reduce((a,b)=>a+b,0)}{'\n'}
        {`Tổng: ${allDigits.join('+')} = ${sumAll}`}
        {sumAll > 9 && sumAll !== 11 && sumAll !== 22
          ? <> → {calcDigitSum(sumAll).join('+')} = <span style={highlight}>{py.personalYearDisplay}</span></>
          : <> → <span style={highlight}>{py.personalYearDisplay}</span></>
        }{'\n\n'}
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{'// Số Năm Thế Giới ' + currentYear}</span>{'\n'}
        {`${currentYear} → ${wyDigits.join('+')} = ${wySum}`}
        {wySum > 9
          ? <> → {wySumDigits.join('+')} = <span style={purpleSpan}>{wyFinal}</span></>
          : <> → <span style={purpleSpan}>{wySum}</span></>
        }
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function CyclesScreen({
  clientName,
  birthDay,
  birthMonth,
  yearPoints,
  currentPersonalYearDisplay,
  mbText,
}: CyclesScreenProps) {
  const [mbExpanded, setMbExpanded] = useState(false)

  const gold = 'var(--color-gold)'
  const fontUi = 'var(--font-ui)'

  const interp = CYCLE_INTERP[currentPersonalYearDisplay] ?? CYCLE_INTERP[String(yearPoints[0]?.personalYear)] ?? null
  const currentWY = yearPoints[0]?.worldYear ?? null

  return (
    <div style={{ paddingBottom: 8 }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 20px 8px' }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          color: gold, textTransform: 'uppercase',
          margin: '0 0 2px', fontFamily: fontUi,
        }}>
          Chu Kỳ Cá Nhân & Thế Giới
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, fontFamily: fontUi }}>
          {clientName} · 5 năm tới
        </p>
      </div>

      {/* ── Chart card ── */}
      <div style={{
        margin: '10px 16px',
        backgroundColor: '#1C1A14',
        borderRadius: 16,
        border: '0.5px solid rgba(255,255,255,0.08)',
        padding: '14px 12px 10px',
      }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, paddingLeft: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 2, backgroundColor: '#C4922A', borderRadius: 1 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: fontUi }}>
              Năm Cá Nhân
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 2, backgroundColor: '#8B7FD4', borderRadius: 1, opacity: 0.85 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: fontUi }}>
              Năm Thế Giới
            </span>
          </div>
        </div>

        <CycleChart yearPoints={yearPoints} />

        {/* Current year world year badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <span style={{
            fontSize: 9, color: '#8B7FD4', fontFamily: fontUi,
            opacity: 0.8,
          }}>
            Năm Thế Giới {yearPoints[0]?.year}: {currentWY}
          </span>
        </div>
      </div>

      {/* ── Info card (current personal year) ── */}
      {interp && (
        <div style={{
          margin: '10px 16px',
          backgroundColor: 'rgba(196,146,42,0.05)',
          borderRadius: 14,
          border: `0.5px solid rgba(196,146,42,0.25)`,
          padding: 14,
        }}>
          {/* PY badge + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: 'rgba(196,146,42,0.12)',
              border: '1px solid rgba(196,146,42,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700,
                color: '#C4922A', lineHeight: 1,
              }}>
                {currentPersonalYearDisplay}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: 'rgba(196,146,42,0.7)', textTransform: 'uppercase', margin: '0 0 2px', fontFamily: fontUi }}>
                Số Năm Cá Nhân {yearPoints[0]?.year}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#C4922A', margin: 0, fontFamily: fontUi }}>
                {interp.title}
              </p>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 10px', lineHeight: 1.6, fontFamily: fontUi }}>
            {interp.body}
          </p>

          {/* MB book text collapsible */}
          {mbText && (
            <>
              <button
                onClick={() => setMbExpanded(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: 0, marginTop: 2,
                }}
              >
                <span style={{ fontSize: 10, color: 'rgba(196,146,42,0.6)', fontFamily: fontUi }}>
                  {mbExpanded ? 'Ẩn bớt' : 'Xem thêm từ sách'}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(196,146,42,0.5)', transform: mbExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>
                  ▾
                </span>
              </button>
              {mbExpanded && (
                <p style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '10px 0 0',
                  lineHeight: 1.65, fontFamily: fontUi,
                  borderTop: '0.5px solid rgba(196,146,42,0.15)',
                  paddingTop: 10,
                }}>
                  {mbText}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Year summary strip ── */}
      <div style={{ margin: '10px 16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {yearPoints.map((p) => (
          <div key={p.year} style={{
            borderRadius: 10,
            padding: '8px 4px',
            backgroundColor: p.isCurrent ? 'rgba(196,146,42,0.08)' : 'transparent',
            border: `0.5px solid ${p.isCurrent ? 'rgba(196,146,42,0.3)' : 'rgba(255,255,255,0.07)'}`,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', margin: '0 0 3px', fontFamily: fontUi }}>{p.year}</p>
            <p style={{
              fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, lineHeight: 1,
              color: p.isCurrent ? '#C4922A' : 'rgba(255,255,255,0.5)',
              margin: '0 0 2px',
            }}>
              {p.personalYearDisplay}
            </p>
            <p style={{ fontSize: 7, color: p.isCurrent ? 'rgba(139,127,212,0.8)' : 'rgba(139,127,212,0.4)', margin: 0, fontFamily: fontUi }}>
              TG: {p.worldYearDisplay}
            </p>
          </div>
        ))}
      </div>

      {/* ── Calculation steps ── */}
      <div style={{ marginTop: 14 }}>
        <CalculationSteps
          birthDay={birthDay}
          birthMonth={birthMonth}
          yearPoints={yearPoints}
        />
      </div>

    </div>
  )
}
