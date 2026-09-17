"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minDate?: string;
  disabled?: boolean;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  if (!value) return "";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  minDate,
  disabled = false,
}: DatePickerProps) {
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(initialDate.getMonth());
  const [visibleYear, setVisibleYear] = useState(initialDate.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;

    const selectedDate = new Date(`${value}T00:00:00`);

    setVisibleMonth(selectedDate.getMonth());
    setVisibleYear(selectedDate.getFullYear());
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const firstDay = new Date(visibleYear, visibleMonth, 1).getDay();

  const numberOfDays = new Date(visibleYear, visibleMonth + 1, 0).getDate();

  const previousMonthDays = new Date(visibleYear, visibleMonth, 0).getDate();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstDay + 1;

    if (dayOffset <= 0) {
      return new Date(
        visibleYear,
        visibleMonth - 1,
        previousMonthDays + dayOffset,
      );
    }

    if (dayOffset > numberOfDays) {
      return new Date(visibleYear, visibleMonth + 1, dayOffset - numberOfDays);
    }

    return new Date(visibleYear, visibleMonth, dayOffset);
  });

  const goToPreviousMonth = () => {
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((current) => current - 1);
      return;
    }

    setVisibleMonth((current) => current - 1);
  };

  const goToNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((current) => current + 1);
      return;
    }

    setVisibleMonth((current) => current + 1);
  };

  const handleDateSelect = (date: Date) => {
    const selectedValue = toDateValue(date);

    if (minDate && selectedValue < minDate) {
      return;
    }

    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="festival-date-picker">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="festival-date-trigger"
      >
        <CalendarDays className="festival-date-icon" />

        <span>{value ? formatDisplayDate(value) : placeholder}</span>
      </button>

      {isOpen && !disabled && (
        <div className="festival-calendar-panel">
          <div className="festival-calendar-header">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="festival-calendar-nav"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="festival-calendar-selects">
              <select
                value={visibleMonth}
                onChange={(event) =>
                  setVisibleMonth(Number(event.target.value))
                }
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={visibleYear}
                onChange={(event) => setVisibleYear(Number(event.target.value))}
              >
                {Array.from({ length: 21 }, (_, index) => {
                  const year = new Date().getFullYear() - 5 + index;

                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="festival-calendar-nav"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="festival-calendar-weekdays">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="festival-calendar-grid">
            {calendarDays.map((date) => {
              const dateValue = toDateValue(date);
              const isSelected = value === dateValue;
              const isCurrentMonth = date.getMonth() === visibleMonth;
              const isToday = dateValue === toDateValue(new Date());
              const isDisabled = Boolean(minDate) && dateValue < minDate!;

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateSelect(date)}
                  className={[
                    "festival-calendar-day",
                    !isCurrentMonth ? "festival-calendar-day-outside" : "",
                    isToday ? "festival-calendar-day-today" : "",
                    isSelected ? "festival-calendar-day-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
