export interface Booking {
  id: string;
  name: string;
  phone: string;
  departure: string;
  arrival: string;
  timestamp: number;
  driver?: {
    name: string;
    car: string;
    rating: number;
    phone: string;
    eta: number;
  };
}

const STORAGE_KEY = "mwinda_bookings";

export function saveBooking(
  booking: Omit<Booking, "id" | "timestamp">
): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: generateId(),
    timestamp: Date.now(),
  };

  bookings.unshift(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

  return newBooking;
}

export function getBookings(): Booking[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Erreur lors de la lecture des réservations:", error);
    return [];
  }
}

export function deleteBooking(id: string): void {
  const bookings = getBookings();
  const filtered = bookings.filter((booking) => booking.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
