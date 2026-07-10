import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface DatePickerProps {
  value: string; // Expected format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const formatDisplayDate = (valString: string): string => {
  if (!valString) return "";
  try {
    const [year, month, day] = valString.split("-");
    if (!year || !month || !day) return valString;
    return `${day}/${month}/${year}`;
  } catch {
    return valString;
  }
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data...",
  required = false,
  className = "",
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Split selected state
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      // Create date with time at noon to avoid timezone issues
      const d = new Date(`${value}T12:00:00`);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });

  // Calendar navigation state
  const [navYear, setNavYear] = useState(() => currentDate.getFullYear());
  const [navMonth, setNavMonth] = useState(() => currentDate.getMonth());

  // Temp selected parts inside picker
  const [tempDay, setTempDay] = useState(() => currentDate.getDate());

  // Update nav and temp selection when value prop changes or opens
  useEffect(() => {
    const d = value ? new Date(`${value}T12:00:00`) : new Date();
    const valid = !isNaN(d.getTime());
    const targetDate = valid ? d : new Date();
    setCurrentDate(targetDate);
    setNavYear(targetDate.getFullYear());
    setNavMonth(targetDate.getMonth());
    setTempDay(targetDate.getDate());
  }, [value, open]);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Dropdown fixed positioning relative to viewport
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 290), // ensure enough width for calendar
      });
    }
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setCoords(null);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    updateCoords();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleUpdate = () => {
      updateCoords();
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        const portal = document.getElementById("datepicker-portal");
        if (portal && portal.contains(target)) return;
        closeMenu();
      }
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, updateCoords, closeMenu]);

  // Calendar dates math
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(navYear, navMonth, 1).getDay();
    const totalDays = new Date(navYear, navMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(navYear, navMonth, 0).getDate();

    const cells: Array<{
      dayNum: number;
      isCurrentMonth: boolean;
      monthOffset: number;
    }> = [];

    // Fills from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNum: prevMonthTotalDays - i,
        isCurrentMonth: false,
        monthOffset: -1,
      });
    }

    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: true,
        monthOffset: 0,
      });
    }

    // Fills from next month to complete 6 rows (42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        monthOffset: 1,
      });
    }

    return cells;
  }, [navYear, navMonth]);

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((y) => y - 1);
    } else {
      setNavMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear((y) => y + 1);
    } else {
      setNavMonth((m) => m + 1);
    }
  };

  const handleCellClick = (cell: { dayNum: number; isCurrentMonth: boolean; monthOffset: number }) => {
    let targetYear = navYear;
    let targetMonth = navMonth;

    if (cell.monthOffset !== 0) {
      const nextDate = new Date(navYear, navMonth + cell.monthOffset, cell.dayNum);
      targetYear = nextDate.getFullYear();
      targetMonth = nextDate.getMonth();
      setNavYear(targetYear);
      setNavMonth(targetMonth);
    }

    setTempDay(cell.dayNum);
    
    // Auto confirm on day click for simple datepicker
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${targetYear}-${pad(targetMonth + 1)}-${pad(cell.dayNum)}`;
    onChange(formatted);
    closeMenu();
  };

  const handleClear = () => {
    if (!required) {
      onChange("");
      closeMenu();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <div
        onClick={handleOpen}
        className={`
          h-[38px] w-full flex items-center justify-between px-3 border transition-all duration-300
          ${
            open
              ? "bg-zinc-800 border-[var(--primary-contrast-light)] shadow-[0_0_15px_rgba(232,7,63,0.15)]"
              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          text-sm
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <CalendarIcon size={14} className={value ? "text-[var(--primary-contrast-light)] shrink-0" : "text-zinc-500 shrink-0"} />
            <span className={`truncate ${value ? "text-white" : "text-zinc-500"}`}>
            {value ? formatDisplayDate(value) : placeholder}
            </span>
        </div>
      </div>

      {/* Popover using Portal */}
      {open &&
        coords &&
        createPortal(
          <div
            id="datepicker-portal"
            className="fixed z-[9999] animate-fade-in-up duration-200"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
          >
            <div className="bg-[#111113] border border-[var(--primary-contrast-light)]/20 p-4 shadow-2xl space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {MONTHS_PT[navMonth]} {navYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Weekday Initials */}
              <div className="grid grid-cols-7 text-center gap-y-1">
                {WEEKDAYS_PT.map((day) => (
                  <span key={day} className="text-[10px] font-bold text-zinc-500 uppercase">
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 text-center gap-1">
                {calendarCells.map((cell, idx) => {
                  const isToday =
                    cell.dayNum === new Date().getDate() &&
                    navMonth === new Date().getMonth() &&
                    navYear === new Date().getFullYear() &&
                    cell.isCurrentMonth;

                  const isSelected =
                    cell.dayNum === tempDay &&
                    cell.isCurrentMonth;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCellClick(cell)}
                      className={`
                        h-7 w-7 mx-auto text-xs font-semibold flex items-center justify-center transition-all
                        ${
                          isSelected
                            ? "bg-[var(--primary-contrast-light)] text-white shadow-md shadow-[var(--primary-contrast-light)]/20 scale-110 border border-transparent"
                            : isToday
                            ? "border border-[var(--primary-contrast-light)] text-[var(--primary-contrast-light)] bg-[var(--primary-contrast-opacity)]"
                            : cell.isCurrentMonth
                            ? "text-zinc-300 hover:bg-zinc-800 hover:text-white border border-transparent"
                            : "text-zinc-700 hover:bg-zinc-900 border border-transparent"
                        }
                      `}
                    >
                      {cell.dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              {!required && (
                <div className="flex items-center justify-center pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="w-full py-1.5 text-xs font-semibold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                  >
                    Limpar filtro
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
