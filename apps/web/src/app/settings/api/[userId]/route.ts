import { NextRequest, NextResponse } from "next/server";

type NotificationPreferences = {
  userId: string;

  pushNotifications: boolean;

  donationNotifications: boolean;

  festivalNotifications: boolean;

  templeNotifications: boolean;

  promoNotifications: boolean;
};

// MOCK DATABASE
let preferences: NotificationPreferences = {
  userId: "123",

  pushNotifications: true,

  donationNotifications: true,

  festivalNotifications: true,

  templeNotifications: true,

  promoNotifications: true,
};

// GET API
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      userId: string;
    }>;
  },
) {
  try {
    // NEXT 16 FIX
    const { userId } = await context.params;

    if (preferences.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: preferences,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch preferences",
      },
      {
        status: 500,
      },
    );
  }
}

// PATCH API
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      userId: string;
    }>;
  },
) {
  try {
    // NEXT 16 FIX
    const { userId } = await context.params;

    const body = await request.json();

    if (preferences.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // UPDATE DATA
    preferences = {
      ...preferences,
      ...body,
    };

    // MASTER TOGGLE OFF
    if (body.pushNotifications === false) {
      preferences.donationNotifications = false;

      preferences.festivalNotifications = false;

      preferences.templeNotifications = false;

      preferences.promoNotifications = false;
    }

    // MASTER TOGGLE ON
    if (body.pushNotifications === true) {
      preferences.donationNotifications = true;

      preferences.festivalNotifications = true;

      preferences.templeNotifications = true;

      preferences.promoNotifications = true;
    }

    return NextResponse.json(
      {
        success: true,
        data: preferences,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("PATCH_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update preferences",
      },
      {
        status: 500,
      },
    );
  }
}
