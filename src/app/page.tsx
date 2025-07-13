"use client";

import { useSession } from "next-auth/react";
import { MwindaApp } from "@/components/MwindaApp";
import { AuthForm } from "@/components/AuthForm";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mwinda</h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre application de réservation
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return <MwindaApp />;
}
