// app/api/2fa/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import qrcode from "qrcode";
import { authenticator } from 'otplib'; // Using otplib instead

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Find user with the given email
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    ) as [any[], any];

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const user = rows[0];

    // Generate a new secret using otplib
    const secret = authenticator.generateSecret();
    console.log("Generated new 2FA secret:", secret.substring(0, 5) + "...", "length:", secret.length);

    // Store the secret in the database
    await db.query(
      "UPDATE users SET twoFactorSecret = ?, twoFactorVerified = 0 WHERE id = ?",
      [secret, user.id]
    );

    // Generate QR code
    const otpauthUrl = authenticator.keyuri(email, 'Rainien', secret);
    const qrCode = await qrcode.toDataURL(otpauthUrl);

    return NextResponse.json({
      success: true,
      qrCode,
      secret,
      otpauthUrl
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json(
      { error: "Failed to set up 2FA." },
      { status: 500 }
    );
  }
}