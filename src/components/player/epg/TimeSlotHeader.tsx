
import React from "react";

interface TimeSlotHeaderProps {
  timeSlots: Date[];
}

const TimeSlotHeader: React.FC<TimeSlotHeaderProps> = ({ timeSlots }) => {
  // Format time for display (12-hour format)
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="grid grid-cols-[180px_1fr] overflow-hidden">
      <div className="p-2 bg-secondary/30 border-r font-semibold">
        Channel
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-6 min-w-[600px]">
          {timeSlots.map((slot, i) => (
            <div key={i} className="p-2 text-center bg-secondary/30 border-r font-semibold">
              {formatTime(slot)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotHeader;
