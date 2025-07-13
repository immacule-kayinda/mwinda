import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    // Validation des champs requis
    const { name, phone, departure, arrival } = body;

    if (!name || !phone || !departure || !arrival) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const { departureCoords, arrivalCoords, distance, duration, price } = body;

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        departure,
        arrival,
        departureCoords,
        arrivalCoords,
        distance: distance ? parseFloat(distance) : null,
        duration: duration ? parseInt(duration) : null,
        price: price ? parseFloat(price) : null,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);

    // Log détaillé pour le débogage
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde de la réservation" },
      { status: 500 }
    );
  }
}
