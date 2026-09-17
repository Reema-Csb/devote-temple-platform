"use client";

import { useEffect } from "react";
import { listenForForegroundMessages } from "@/lib/firebase-messaging";

export default function NotificationListener() {
  useEffect(() => {
    listenForForegroundMessages();
  }, []);

  return null;
}
