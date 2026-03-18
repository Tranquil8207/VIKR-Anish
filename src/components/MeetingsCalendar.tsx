"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Meeting = {
    id: string
    title: string
    date_time: string
    meet_link: string | null
    recording_url: string | null
    notes: string | null
}

interface MeetingsCalendarProps {
    meetings: Meeting[]
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

function toLocalDateKey(date: Date): string {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
}

const GRID_STYLE: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
}

export function MeetingsCalendar({ meetings }: MeetingsCalendarProps) {
    const today = new Date()
    const todayKey = toLocalDateKey(today)

    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    )
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    // Build date-string → meetings[] map
    const meetingMap = useMemo(() => {
        const map = new Map<string, Meeting[]>()
        for (const m of meetings) {
            const key = toLocalDateKey(new Date(m.date_time))
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push(m)
        }
        return map
    }, [meetings])

    // Build 42-cell grid
    const calendarCells = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDow = new Date(year, month, 1).getDay() // 0 = Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrev = new Date(year, month, 0).getDate()

        const cells: { date: Date; key: string; current: boolean }[] = []

        // Leading days (prev month)
        for (let i = firstDow - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, daysInPrev - i)
            cells.push({ date: d, key: toLocalDateKey(d), current: false })
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d)
            cells.push({ date, key: toLocalDateKey(date), current: true })
        }

        // Trailing days (next month)
        let t = 1
        while (cells.length < 42) {
            const d = new Date(year, month + 1, t++)
            cells.push({ date: d, key: toLocalDateKey(d), current: false })
        }

        return cells
    }, [currentMonth])

    const prevMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))

    const nextMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

    const selectedMeetings = selectedDate ? (meetingMap.get(selectedDate) ?? []) : []

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })

    return (
        <div
            style={{ borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #243018", background: "#121a0e" }}
        >
            {/* ── Header ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid #243018",
                    background: "#1a2413",
                }}
            >
                <button
                    onClick={prevMonth}
                    aria-label="Previous month"
                    style={{
                        padding: "0.375rem",
                        borderRadius: "0.5rem",
                        color: "#8aab7a",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6abf30"; (e.currentTarget as HTMLButtonElement).style.background = "#243018" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8aab7a"; (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                </button>

                <span style={{ color: "#e8f0e2", fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "0.02em" }}>
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>

                <button
                    onClick={nextMonth}
                    aria-label="Next month"
                    style={{
                        padding: "0.375rem",
                        borderRadius: "0.5rem",
                        color: "#8aab7a",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6abf30"; (e.currentTarget as HTMLButtonElement).style.background = "#243018" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8aab7a"; (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                >
                    <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
            </div>

            {/* ── Day-of-week headers ── */}
            <div style={{ ...GRID_STYLE, borderBottom: "1px solid #243018" }}>
                {DAYS_OF_WEEK.map((d) => (
                    <div
                        key={d}
                        style={{
                            padding: "0.5rem 0",
                            textAlign: "center",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "#4a6040",
                        }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* ── Day cells grid ── */}
            <div style={GRID_STYLE}>
                {calendarCells.map((cell, idx) => {
                    const count = cell.current ? (meetingMap.get(cell.key)?.length ?? 0) : 0
                    const hasMeetings = count > 0
                    const isToday = cell.current && cell.key === todayKey
                    const isSelected = cell.key === selectedDate

                    let bg = "transparent"
                    if (isSelected) bg = "#1e2e16"
                    else if (hasMeetings) bg = "rgba(26,36,19,0.7)"

                    return (
                        <button
                            key={`${cell.key}-${idx}`}
                            onClick={() => {
                                if (!cell.current) return
                                setSelectedDate(isSelected ? null : cell.key)
                            }}
                            disabled={!cell.current}
                            style={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                paddingTop: "0.75rem",
                                paddingBottom: "0.75rem",
                                minHeight: "64px",
                                borderBottom: "1px solid #1a2413",
                                borderRight: "1px solid #1a2413",
                                background: bg,
                                cursor: cell.current ? "pointer" : "default",
                                opacity: cell.current ? 1 : 0.25,
                                border: "none",
                                outline: isSelected ? "1px solid rgba(106,191,48,0.35)" : "none",
                                outlineOffset: "-1px",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                if (cell.current && !isSelected) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "#1a2413"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (cell.current && !isSelected) {
                                    (e.currentTarget as HTMLButtonElement).style.background = bg
                                }
                            }}
                        >
                            {/* Day number */}
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "2rem",
                                    height: "2rem",
                                    borderRadius: "50%",
                                    fontSize: "0.875rem",
                                    fontWeight: isToday ? 700 : 500,
                                    background: isToday ? "#6abf30" : "transparent",
                                    color: isToday ? "#000" : isSelected ? "#6abf30" : cell.current ? "#e8f0e2" : "#4a6040",
                                    transition: "color 0.15s",
                                }}
                            >
                                {cell.date.getDate()}
                            </span>

                            {/* Meeting count badge */}
                            {hasMeetings && (
                                <span
                                    style={{
                                        marginTop: "0.25rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "1.125rem",
                                        height: "1.125rem",
                                        borderRadius: "50%",
                                        background: "#6abf30",
                                        color: "#000",
                                        fontSize: "0.5625rem",
                                        fontWeight: 700,
                                        lineHeight: 1,
                                    }}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Selected day detail panel ── */}
            {selectedDate && (
                <div
                    style={{
                        borderTop: "1px solid #243018",
                        background: "#0f1a0b",
                        padding: "1rem 1.25rem",
                    }}
                >
                    <p
                        style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "#4a6040",
                            marginBottom: "0.75rem",
                        }}
                    >
                        {selectedMeetings.length > 0
                            ? `Meetings on ${new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                                month: "long", day: "numeric", year: "numeric",
                            })}`
                            : `No meetings on ${new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                                month: "long", day: "numeric", year: "numeric",
                            })}`}
                    </p>

                    {selectedMeetings.length === 0 ? (
                        <p style={{ fontSize: "0.8125rem", color: "#4a6040", fontStyle: "italic", textAlign: "center" }}>
                            Nothing scheduled for this day.
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {selectedMeetings.map((m) => {
                                const isPast = new Date(m.date_time) < new Date()
                                return (
                                    <div
                                        key={m.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "0.75rem",
                                            padding: "0.75rem",
                                            borderRadius: "0.5rem",
                                            border: "1px solid #243018",
                                            background: "#121a0e",
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#e8f0e2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {m.title}
                                            </p>
                                            <p style={{ fontSize: "0.75rem", color: "#8aab7a", marginTop: "0.125rem" }}>
                                                {formatTime(m.date_time)}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                            {m.meet_link && !isPast && (
                                                <a
                                                    href={m.meet_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        padding: "0.25rem 0.6rem",
                                                        borderRadius: "0.375rem",
                                                        background: "rgba(106,191,48,0.15)",
                                                        color: "#6abf30",
                                                        border: "1px solid rgba(106,191,48,0.3)",
                                                        textDecoration: "none",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Join
                                                </a>
                                            )}
                                            {m.recording_url && (
                                                <a
                                                    href={m.recording_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        padding: "0.25rem 0.6rem",
                                                        borderRadius: "0.375rem",
                                                        background: "#243018",
                                                        color: "#8aab7a",
                                                        border: "1px solid #2e3d1c",
                                                        textDecoration: "none",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Recording
                                                </a>
                                            )}
                                            {isPast && !m.recording_url && (
                                                <span style={{ fontSize: "0.6875rem", color: "#4a6040", fontStyle: "italic" }}>Past</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Legend ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    padding: "0.625rem 1.25rem",
                    borderTop: "1px solid #243018",
                    background: "rgba(26,36,19,0.4)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <span
                        style={{
                            width: "1.125rem", height: "1.125rem", borderRadius: "50%",
                            background: "#6abf30", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "0.5625rem", fontWeight: 700, color: "#000",
                        }}
                    >
                        n
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "#4a6040" }}>= meeting count</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <span
                        style={{
                            width: "1.75rem", height: "1.75rem", borderRadius: "50%",
                            background: "#6abf30", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "#000",
                        }}
                    >
                        {today.getDate()}
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "#4a6040" }}>= today</span>
                </div>
            </div>
        </div>
    )
}
