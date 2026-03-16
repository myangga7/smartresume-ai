// frontend/app/api/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export async function POST(request: NextRequest) {
  try {
    console.log("MONGODB_URI exists:", !!uri);

    if (!uri) {
      console.error("MONGODB_URI is not defined");
      return NextResponse.json(
        { error: "Database connection string not configured" },
        { status: 500 },
      );
    }

    const resumeData = await request.json();
    console.log(
      "📦 Resume data received:",
      JSON.stringify(resumeData, null, 2),
    );

    // Validasi lebih detail
    if (!resumeData.personal) {
      console.error("Missing personal field");
      return NextResponse.json(
        { error: "Personal information is required" },
        { status: 400 },
      );
    }

    if (!resumeData.personal?.fullName || !resumeData.personal?.email) {
      console.error("Missing name or email");
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 },
      );
    }

    const client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("smartresume");
    const collection = db.collection("resumes");

    // Tambahkan timestamp
    const dataToInsert = {
      ...resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("💾 Inserting data...");
    const result = await collection.insertOne(dataToInsert);
    console.log("✅ Insert successful, ID:", result.insertedId);

    await client.close();

    return NextResponse.json(
      {
        message: "Resume created successfully",
        resume: {
          id: result.insertedId.toString(),
          ...dataToInsert,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ ERROR DETAIL:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
    });

    return NextResponse.json(
      { error: error.message || "Failed to create resume" },
      { status: 500 },
    );
  }
}
