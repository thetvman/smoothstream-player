
/**
 * Generate time slots for the EPG guide
 * @returns Array of Date objects representing time slots
 */
export const generateTimeSlots = (): Date[] => {
  // Generate time slots for the next 3 hours in 30-minute increments
  const now = new Date();
  now.setMinutes(now.getMinutes() - (now.getMinutes() % 30), 0, 0); // Round to nearest 30 min
  
  const slots = [];
  for (let i = 0; i < 6; i++) {
    const slotTime = new Date(now);
    slotTime.setMinutes(now.getMinutes() + (i * 30));
    slots.push(slotTime);
  }
  
  return slots;
};

/**
 * Format a date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString([], { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};
